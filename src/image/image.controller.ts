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
  constructor(
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'tokenId',
    required: true,
    description: 'Token ID for the image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, or png) max 5MB',
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
        tokenId: {
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
    description: 'Invalid file type or size',
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
    const { uniqueId, url } = await this.imageService.uploadImage(file);
    return { uniqueId, url };
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
  })
  @Header('Content-Type', 'image/*')
  async getImage(@Param('uniqueId') uniqueId: string) {
    const image = await this.prisma.image.findUnique({
      where: { uniqueId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const key = `${image.uniqueId}${image.fileExtension}`;
    return await this.imageService.getImage(key);
  }
}
