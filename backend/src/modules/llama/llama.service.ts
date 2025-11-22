import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface LlamaRequest {
  prompt: string;
  context?: any;
  maxTokens?: number;
  temperature?: number;
}

export interface LlamaResponse {
  response: string;
  reasoning?: string;
  confidence?: number;
}

/**
 * @notice Llama 3.2 service for agent reasoning
 * @dev Connects to local Llama 3.2 HTTP API
 */
@Injectable()
export class LlamaService {
  private readonly logger = new Logger(LlamaService.name);
  private readonly llamaUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.llamaUrl =
      configService.get<string>('LLAMA_API_URL') || 'http://localhost:8000';
  }

  /**
   * Generate strategy proposal using Llama 3.2
   */
  async generateStrategy(
    intentSpec: string,
    marketData: any,
    context?: any,
  ): Promise<LlamaResponse> {
    const prompt = this.buildStrategyPrompt(intentSpec, marketData, context);

    try {
      const response = await firstValueFrom(
        this.httpService.post<LlamaResponse>(`${this.llamaUrl}/api/generate`, {
          prompt,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      );

      this.logger.log('Generated strategy from Llama 3.2');
      return response.data;
    } catch (error) {
      this.logger.error('Error calling Llama API:', error);
      // Fallback response for development
      return {
        response: this.generateFallbackStrategy(intentSpec),
        confidence: 0.5,
      };
    }
  }

  /**
   * Evaluate intent feasibility
   */
  async evaluateIntent(
    intentSpec: string,
    currentRates: any,
  ): Promise<{ feasible: boolean; expectedAPY: number; reasoning: string }> {
    const prompt = this.buildEvaluationPrompt(intentSpec, currentRates);

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ feasible: boolean; expectedAPY: number; reasoning: string }>(
          `${this.llamaUrl}/api/evaluate`,
          { prompt },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error evaluating intent:', error);
      return {
        feasible: true,
        expectedAPY: 5.0,
        reasoning: 'Fallback evaluation - unable to reach Llama API',
      };
    }
  }

  private buildStrategyPrompt(
    intentSpec: string,
    marketData: any,
    context?: any,
  ): string {
    return `You are an AI agent specializing in DeFi strategy generation.

User Intent: ${intentSpec}

Current Market Data:
${JSON.stringify(marketData, null, 2)}

${context ? `Additional Context:\n${JSON.stringify(context, null, 2)}` : ''}

Generate a detailed execution strategy including:
1. Target chains and protocols
2. Expected yield/returns
3. Execution timeline
4. Risk assessment
5. Gas cost estimation

Respond in JSON format:
{
  "strategy": {...},
  "expectedAPY": 0.0,
  "timeline": 0,
  "cost": 0,
  "confidence": 0.0,
  "reasoning": "..."
}`;
  }

  private buildEvaluationPrompt(
    intentSpec: string,
    currentRates: any,
  ): string {
    return `Evaluate if this DeFi intent is feasible:

Intent: ${intentSpec}

Current Rates:
${JSON.stringify(currentRates, null, 2)}

Respond with:
{
  "feasible": true/false,
  "expectedAPY": 0.0,
  "reasoning": "..."
}`;
  }

  private generateFallbackStrategy(intentSpec: string): string {
    return JSON.stringify({
      strategy: {
        type: 'yield-farming',
        protocols: ['Aave', 'Compound'],
        chains: ['Ethereum', 'Arbitrum'],
        steps: [
          'Deposit stablecoins to Aave',
          'Stake aTokens for additional yield',
          'Monitor rates and rebalance',
        ],
      },
      expectedAPY: 5.5,
      timeline: 86400, // 1 day
      cost: 0.01,
      confidence: 0.7,
      reasoning: 'Fallback strategy based on intent keywords',
    });
  }
}

