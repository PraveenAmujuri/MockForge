import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, origin?: any) => void) => {
      // Return true to dynamically mirror the request origin, satisfying browser credentials policy
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: ['mock/:projectSlug', 'mock/:projectSlug/*'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}`);
}
bootstrap();
