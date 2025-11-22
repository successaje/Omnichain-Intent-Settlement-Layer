import { Module } from '@nestjs/common';
import { LlamaService } from './llama.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [LlamaService],
  exports: [LlamaService],
})
export class LlamaModule {}

