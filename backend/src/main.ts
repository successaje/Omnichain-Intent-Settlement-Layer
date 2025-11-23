import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  // Debug: Check .env file location
  const envPath = join(process.cwd(), '.env');
  console.log(`[DEBUG] Looking for .env at: ${envPath}`);
  console.log(`[DEBUG] .env file exists: ${existsSync(envPath)}`);
  console.log(`[DEBUG] process.cwd(): ${process.cwd()}`);
  console.log(`[DEBUG] FILECOIN_PRIVATE_KEY from process.env: ${process.env.FILECOIN_PRIVATE_KEY ? 'SET (' + process.env.FILECOIN_PRIVATE_KEY.substring(0, 10) + '...)' : 'NOT SET'}`);
  
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();

