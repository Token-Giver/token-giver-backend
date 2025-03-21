import {
  Get,
  Post,
  Param,
  Controller,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
  Header,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { ImageService } from './image.service';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Image')
@Controller('image')
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, or svg) max 5MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        uniqueId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        url: {
          type: 'string',
          example: 'https://example.com/images/123e4567.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type, size, or format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: 'File too large',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 413 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Payload Too Large' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB in bytes
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|svg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ uniqueId: string; url: string }> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const { uniqueId, url } = await this.imageService.uploadImage(file);
      return { uniqueId, url };
    } catch (error) {
      this.logger.error(
        `Failed to upload image: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get image by unique ID' })
  @ApiParam({
    name: 'uniqueId',
    required: true,
    description: 'Unique ID of the image to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Image retrieved successfully',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  @Header('Content-Type', 'image/*')
  async getImage(@Param('uniqueId') uniqueId: string) {
    try {
      if (!uniqueId) {
        throw new BadRequestException('Image ID is required');
      }

      const image = await this.prisma.image.findUnique({
        where: { uniqueId },
      });

      if (!image) {
        throw new NotFoundException(`Image with ID ${uniqueId} not found`);
      }

      const key = `${image.uniqueId}${image.fileExtension}`;
      return await this.imageService.getImage(key);
    } catch (error) {
      this.logger.error(`Failed to get image: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get image');
    }
  }
}
