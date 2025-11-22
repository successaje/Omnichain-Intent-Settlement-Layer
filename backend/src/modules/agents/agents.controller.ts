import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('api/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post(':id/proposals')
  async createProposal(
    @Param('id') agentId: string,
    @Body('intentId') intentId: string,
    @Body('intentSpec') intentSpec: string,
  ) {
    return this.agentsService.generateProposal(intentId, intentSpec, agentId);
  }

  @Post('auction/:intentId/proposals')
  async createProposalsForAuction(
    @Param('intentId') intentId: string,
    @Body('intentSpec') intentSpec: string,
    @Body('agentIds') agentIds: string[],
  ) {
    return this.agentsService.generateProposalsForAuction(
      intentId,
      intentSpec,
      agentIds || ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'],
    );
  }
}

