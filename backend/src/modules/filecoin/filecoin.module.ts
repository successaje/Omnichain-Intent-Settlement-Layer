import { Module } from '@nestjs/common';
import { FilecoinService } from './filecoin.service';
import { FilecoinController } from './filecoin.controller';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [ConfigModule, MulterModule.register()],
  controllers: [FilecoinController],
  providers: [FilecoinService],
  exports: [FilecoinService],
})
export class FilecoinModule {}

