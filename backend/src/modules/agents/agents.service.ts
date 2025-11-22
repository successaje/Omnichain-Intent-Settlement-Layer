import { Injectable, Logger } from '@nestjs/common';
import { LlamaService } from '../llama/llama.service';
import { ChainlinkService } from '../chainlink/chainlink.service';
import { FilecoinService } from '../filecoin/filecoin.service';
import { ethers } from 'ethers';

export interface AgentProposal {
  proposalId: string;
  intentId: string;
  agentId: string;
  strategy: any;
  expectedCost: string;
  expectedAPY: number;
  timeline: number;
  signature: string;
  proofCid: string;
  confidence: number;
}

/**
 * @notice Agent runner service - evaluates intents and generates proposals
 */
@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private agents: Map<string, { address: string; privateKey?: string }> = new Map();

  constructor(
    private readonly llamaService: LlamaService,
    private readonly chainlinkService: ChainlinkService,
    private readonly filecoinService: FilecoinService,
  ) {
    // Initialize demo agents
    this.initializeAgents();
  }

  /**
   * Generate proposal for an intent
   */
  async generateProposal(
    intentId: string,
    intentSpec: string,
    agentId: string,
  ): Promise<AgentProposal> {
    this.logger.log(`Agent ${agentId} generating proposal for intent ${intentId}`);

    // 1. Fetch current market data via Chainlink
    const marketData = await this.fetchMarketData();

    // 2. Generate strategy using Llama 3.2
    const llamaResponse = await this.llamaService.generateStrategy(
      intentSpec,
      marketData,
    );

    // 3. Parse strategy JSON
    const strategy = this.parseStrategy(llamaResponse.response);

    // 4. Store proof on Filecoin
    const proof = {
      intentId,
      agentId,
      strategy,
      marketData,
      generatedAt: new Date(),
      llamaResponse: llamaResponse.reasoning,
    };
    const proofCid = await this.filecoinService.pinJson(proof);

    // 5. Sign proposal
    const agent = this.agents.get(agentId);
    const signature = await this.signProposal(agentId, intentId, strategy, proofCid);

    // 6. Build proposal
    const proposal: AgentProposal = {
      proposalId: `proposal-${Date.now()}-${agentId}`,
      intentId,
      agentId,
      strategy,
      expectedCost: strategy.cost?.toString() || '0',
      expectedAPY: strategy.expectedAPY || 0,
      timeline: strategy.timeline || 86400,
      signature,
      proofCid,
      confidence: strategy.confidence || 0.7,
    };

    return proposal;
  }

  /**
   * Evaluate multiple intents in parallel (for auction)
   */
  async generateProposalsForAuction(
    intentId: string,
    intentSpec: string,
    agentIds: string[],
  ): Promise<AgentProposal[]> {
    const proposals = await Promise.all(
      agentIds.map((agentId) =>
        this.generateProposal(intentId, intentSpec, agentId).catch((error) => {
          this.logger.error(`Agent ${agentId} failed to generate proposal:`, error);
          return null;
        }),
      ),
    );

    return proposals.filter((p): p is AgentProposal => p !== null);
  }

  private async fetchMarketData(): Promise<any> {
    // Fetch price feeds and rates
    try {
      // Mock data for development - in production would fetch real Chainlink feeds
      return {
        ETH: { price: 2000, source: 'chainlink' },
        USDC: { price: 1, source: 'chainlink' },
        rates: {
          Aave: { APY: 4.5 },
          Compound: { APY: 3.8 },
          Yearn: { APY: 5.2 },
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error('Error fetching market data:', error);
      return {};
    }
  }

  private parseStrategy(response: string): any {
    try {
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback structure
      return {
        strategy: { type: 'yield-farming', protocols: ['Aave'] },
        expectedAPY: 5.0,
        timeline: 86400,
        cost: 0.01,
        confidence: 0.7,
      };
    } catch (error) {
      this.logger.error('Error parsing strategy:', error);
      return {
        strategy: { type: 'fallback' },
        expectedAPY: 0,
        timeline: 0,
        cost: 0,
        confidence: 0,
      };
    }
  }

  private async signProposal(
    agentId: string,
    intentId: string,
    strategy: any,
    proofCid: string,
  ): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent?.privateKey) {
      // Return mock signature for development
      return `0x${'0'.repeat(130)}`;
    }

    try {
      const wallet = new ethers.Wallet(agent.privateKey);
      const message = ethers.solidityPackedKeccak256(
        ['string', 'string', 'string'],
        [intentId, JSON.stringify(strategy), proofCid],
      );
      const signature = await wallet.signMessage(ethers.getBytes(message));
      return signature;
    } catch (error) {
      this.logger.error('Error signing proposal:', error);
      return `0x${'0'.repeat(130)}`;
    }
  }

  private initializeAgents(): void {
    // Demo agents - in production these would be registered on-chain
    for (let i = 1; i <= 5; i++) {
      const agentId = `agent-${i}`;
      this.agents.set(agentId, {
        address: `0x${'1'.repeat(40)}${i}`,
        // In production, agents would manage their own keys securely
      });
    }
  }
}

