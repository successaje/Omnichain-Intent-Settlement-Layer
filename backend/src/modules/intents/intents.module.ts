import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntentsController } from './intents.controller';
import { IntentsService } from './intents.service';
import { Intent } from './entities/intent.entity';
import { FilecoinModule } from '../filecoin/filecoin.module';
import { ChainlinkModule } from '../chainlink/chainlink.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intent]),
    FilecoinModule,
    ChainlinkModule,
  ],
  controllers: [IntentsController],
  providers: [IntentsService],
  exports: [IntentsService],
})
export class IntentsModule {}

