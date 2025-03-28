import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  // Generate Swagger document using the imported config
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Serve Swagger UI at /api-docs
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
