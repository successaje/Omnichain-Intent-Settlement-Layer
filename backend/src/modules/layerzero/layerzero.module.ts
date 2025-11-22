import { Module } from '@nestjs/common';
import { LayerzeroService } from './layerzero.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [LayerzeroService],
  exports: [LayerzeroService],
})
export class LayerzeroModule {}

