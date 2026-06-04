import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyCookie);
  const config = app.get(ConfigService);
  await app.register(fastifyMultipart, {
    limits: { fileSize: config.getOrThrow<number>('media.maxVideoBytes') },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: config.getOrThrow<string>('auth.frontendUrl'),
    credentials: true,
  });

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
