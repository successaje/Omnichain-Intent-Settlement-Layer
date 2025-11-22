import { Module } from '@nestjs/common';
import { FilecoinService } from './filecoin.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [FilecoinService],
  exports: [FilecoinService],
})
export class FilecoinModule {}

