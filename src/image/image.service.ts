import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';

import { env } from '../common/env';

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private readonly bucketName = env.aws.bucketName;
  private readonly baseImageUrl = env.app.apiUrl + '/images';

  constructor(private readonly prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<{
    uniqueId: string;
    url: string;
  }> {
    try {
      const fileExtension = this.getFileExtension(file.originalname);
      const uniqueId = uuidv4();
      const key = `${uniqueId}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      await this.prisma.image.create({
        data: {
          uniqueId,
          fileExtension,
        },
      });

      return { uniqueId, url: `${this.baseImageUrl}/${uniqueId}` };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async getImageUrl(uniqueId: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueId,
      });

      // Generate a signed URL that expires in 24 hours (86400 seconds)
      return await getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }

  async getImage(key: string): Promise<StreamableFile> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;
      return new StreamableFile(stream);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }

  private getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }
}
