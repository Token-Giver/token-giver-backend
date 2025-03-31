import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Token Giver API DOCS')
  .setDescription(
    'API documentation with detailed descriptions, request/response examples, and error handling for token giver',
  )
  .setVersion('1.0')
  .addTag('Users') // Add relevant tags
  .build();
