import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

/**
 * @notice LayerZero service for cross-chain messaging
 */
@Injectable()
export class LayerzeroService {
  private readonly logger = new Logger(LayerzeroService.name);
  private readonly provider?: ethers.Provider;
  private readonly intentManagerAddress?: string;
  private readonly executionProxyAddress?: string;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = configService.get<string>('RPC_URL');
    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    this.intentManagerAddress = configService.get<string>('INTENT_MANAGER_ADDRESS');
    this.executionProxyAddress = configService.get<string>('EXECUTION_PROXY_ADDRESS');
  }

  /**
   * Send cross-chain message via IntentManager
   */
  async sendCrossChainMessage(
    intentId: string,
    dstEid: number,
    payload: string,
    signer: ethers.Signer,
  ): Promise<string> {
    try {
      if (!this.intentManagerAddress || !this.provider) {
        throw new Error('IntentManager not configured');
      }

      // Simplified ABI for sendCrossChainExecution
      const intentManagerABI = [
        'function sendCrossChainExecution(uint256 _intentId, uint32 _dstEid, bytes calldata _payload, bytes calldata _options) external payable returns (MessagingReceipt memory)',
      ];

      const contract = new ethers.Contract(
        this.intentManagerAddress,
        intentManagerABI,
        signer,
      );

      const tx = await contract.sendCrossChainExecution(
        intentId,
        dstEid,
        payload,
        '0x', // default options
        { value: ethers.parseEther('0.1') }, // estimated fee
      );

      const receipt = await tx.wait();
      this.logger.log(`Cross-chain message sent: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error('Error sending cross-chain message:', error);
      throw error;
    }
  }

  /**
   * Get LayerZero endpoint ID for chain
   */
  getEndpointId(chainId: number): number {
    // LayerZero endpoint IDs
    const endpointIds: Record<number, number> = {
      1: 301, // Ethereum
      42161: 30110, // Arbitrum
      10: 30111, // Optimism
      43114: 30106, // Avalanche
      8453: 30184, // Base
      137: 30109, // Polygon
    };
    return endpointIds[chainId] || 0;
  }

  /**
   * Quote cross-chain messaging fee
   */
  async quoteFee(
    intentId: string,
    dstEid: number,
    payload: string,
  ): Promise<bigint> {
    try {
      if (!this.intentManagerAddress || !this.provider) {
        // Return mock fee for development
        return ethers.parseEther('0.01');
      }

      const intentManagerABI = [
        'function quoteCrossChainFee(uint32 _dstEid, bytes calldata _message, bytes calldata _options, bool _payInLzToken) external view returns (MessagingFee memory)',
      ];

      const contract = new ethers.Contract(
        this.intentManagerAddress,
        intentManagerABI,
        this.provider,
      );

      const fee = await contract.quoteCrossChainFee(
        dstEid,
        payload,
        '0x',
        false,
      );

      return fee.nativeFee;
    } catch (error) {
      this.logger.error('Error quoting fee:', error);
      return ethers.parseEther('0.01'); // Fallback fee
    }
  }
}

