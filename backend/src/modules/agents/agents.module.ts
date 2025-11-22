import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { LlamaModule } from '../llama/llama.module';
import { ChainlinkModule } from '../chainlink/chainlink.module';
import { FilecoinModule } from '../filecoin/filecoin.module';

@Module({
  imports: [LlamaModule, ChainlinkModule, FilecoinModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}

