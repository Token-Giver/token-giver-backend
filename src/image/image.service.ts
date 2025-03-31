import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';

import { env } from '../common/env';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private s3Client: S3Client;
  private readonly bucketName = env.aws.bucketName;
  private readonly baseImageUrl = env.app.apiUrl + '/images';
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];

  constructor(private readonly prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<Array<{ uniqueId: string; url: string }>> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error(
        `Unexpected error during multiple image uploads: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to upload images');
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{
    uniqueId: string;
    url: string;
  }> {
    try {
      const fileExtension = this.getFileExtension(file.originalname);

      if (!this.allowedExtensions.includes(fileExtension.toLowerCase())) {
        throw new BadRequestException(
          `Invalid file extension. Allowed extensions are: ${this.allowedExtensions.join(', ')}`,
        );
      }

      const uniqueId = uuidv4();
      const key = `${uniqueId}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      try {
        await this.s3Client.send(command);
      } catch (error) {
        if (error instanceof S3ServiceException) {
          this.logger.error(
            `Failed to upload image to S3: ${error.message}`,
            error.stack,
          );
          throw new InternalServerErrorException(
            'Failed to upload image to storage service',
          );
        }
        throw error;
      }

      try {
        await this.prisma.image.create({
          data: {
            uniqueId,
            fileExtension,
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to create image record in database: ${error.message}`,
          error.stack,
        );
        // Attempt to clean up the S3 file since database operation failed
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: key,
            }),
          );
        } catch (cleanupError) {
          this.logger.error(
            `Failed to clean up S3 file after database error: ${cleanupError.message}`,
            cleanupError.stack,
          );
        }
        throw new InternalServerErrorException('Failed to save image metadata');
      }

      return { uniqueId, url: `${this.baseImageUrl}/${uniqueId}` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error during image upload: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async getImageUrl(uniqueId: string): Promise<string> {
    try {
      const image = await this.prisma.image.findUnique({
        where: { uniqueId },
      });

      if (!image) {
        throw new NotFoundException(`Image with ID ${uniqueId} not found`);
      }

      const key = `${image.uniqueId}${image.fileExtension}`;
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      try {
        return await getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
      } catch (error) {
        if (error instanceof S3ServiceException) {
          this.logger.error(
            `Failed to generate signed URL for image: ${error.message}`,
            error.stack,
          );
          throw new InternalServerErrorException(
            'Failed to generate image URL',
          );
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error getting image URL: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to get image URL');
    }
  }

  async getImage(key: string): Promise<StreamableFile> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      try {
        const response = await this.s3Client.send(command);
        const stream = response.Body as Readable;
        return new StreamableFile(stream);
      } catch (error) {
        if (error instanceof S3ServiceException) {
          this.logger.error(
            `Failed to get image from S3: ${error.message}`,
            error.stack,
          );
          throw new NotFoundException('Image not found in storage');
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error getting image: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to get image');
    }
  }

  private getFileExtension(filename: string): string {
    const extension = filename
      .substring(filename.lastIndexOf('.'))
      .toLowerCase();
    if (!extension) {
      throw new BadRequestException('File must have an extension');
    }
    return extension;
  }
}
