import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('My API')
  .setDescription(
    'API documentation with detailed descriptions, request/response examples, and error handling',
  )
  .setVersion('1.0')
  .addTag('Users') // Add relevant tags
  .build();
