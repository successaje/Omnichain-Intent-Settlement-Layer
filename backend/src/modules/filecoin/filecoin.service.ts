import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// Dynamic import types (ESM module)
type Synapse = any;
type StorageService = any;

/**
 * @notice Filecoin service using Synapse SDK for Onchain Cloud storage
 * @dev Integrates with Filecoin Calibration Testnet or mainnet
 * @dev Uses @filoz/synapse-sdk package - only requires private key and RPC URL
 * @dev Uses dynamic imports to handle ESM-only package in CommonJS NestJS
 */
@Injectable()
export class FilecoinService implements OnModuleInit {
  private readonly logger = new Logger(FilecoinService.name);
  private synapse: Synapse | null = null;
  private storageService: StorageService | null = null;
  private readonly privateKey: string;
  private readonly rpcUrl: string;
  private synapseModule: any = null;

  constructor(private readonly configService: ConfigService) {
    // Try both ConfigService and process.env as fallback
    const rawKey =
      configService.get<string>('FILECOIN_PRIVATE_KEY') ||
      process.env.FILECOIN_PRIVATE_KEY ||
      '';
    
    // Ensure private key has 0x prefix if it's a hex string
    this.privateKey = rawKey && !rawKey.startsWith('0x') ? `0x${rawKey}` : rawKey;
    
    // Default RPC URL for Calibration testnet
    this.rpcUrl =
      configService.get<string>('FILECOIN_RPC_URL') ||
      process.env.FILECOIN_RPC_URL ||
      'https://api.calibration.node.glif.io/rpc/v1';
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `FilecoinService constructor - Private key found: ${!!this.privateKey}, ` +
        `Length: ${this.privateKey.length}, ` +
        `First 10 chars: ${this.privateKey.substring(0, 10)}...`,
      );
    }
  }

  /**
   * Initialize Synapse SDK on module init
   * Uses dynamic import to handle ESM-only package
   * Note: This may fail in CommonJS mode - service will fall back to mock CIDs
   */
  async onModuleInit() {
    if (!this.privateKey) {
      this.logger.warn(
        'FILECOIN_PRIVATE_KEY not set. Filecoin operations will return mock CIDs.',
      );
      return;
    }

    try {
      // Try dynamic import - may fail in CommonJS mode
      // The @filoz/synapse-sdk is ESM-only and may not work in CommonJS NestJS
      this.synapseModule = await import('@filoz/synapse-sdk');

      const { Synapse } = this.synapseModule;
      
      this.synapse = await Synapse.create({
        privateKey: this.privateKey,
        rpcURL: this.rpcUrl,
      });
      
      // Create storage service for uploads
      this.storageService = await this.synapse.createStorage();
      
      this.logger.log('Synapse SDK initialized successfully');
    } catch (error: any) {
      // Handle ESM/CommonJS incompatibility gracefully
      if (
        error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' ||
        error.message?.includes('exports') ||
        error.message?.includes('ERR_REQUIRE_ESM')
      ) {
        this.logger.warn(
          'Synapse SDK (ESM-only) cannot be loaded in CommonJS mode. ' +
          'Filecoin operations will return mock CIDs. ' +
          'This is expected behavior - the service will work with mock data for development.',
        );
      } else {
        this.logger.error(
          'Failed to initialize Synapse SDK:',
          error.message || error,
        );
        this.logger.warn('Filecoin operations will return mock CIDs.');
      }
    }
  }

  /**
   * Pin JSON data to Filecoin and return PieceCID (commp)
   */
  async pinJson(data: any): Promise<string> {
    if (!this.storageService) {
      this.logger.warn('Storage service not initialized, returning mock CID');
      return `mock-cid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    try {
      // Convert JSON to bytes
      const jsonString = JSON.stringify(data);
      const dataBytes = new TextEncoder().encode(jsonString);

      // Upload to Filecoin using Synapse SDK
      const { commp, size } = await this.storageService.upload(dataBytes);

      // Convert CommP to string
      const pieceCid = String(commp);
      
      this.logger.log(
        `Pinned JSON to Filecoin - PieceCID: ${pieceCid}, Size: ${size} bytes`,
      );
      return pieceCid;
    } catch (error) {
      this.logger.error('Error pinning JSON to Filecoin:', error);
      // Fallback: return mock CID for development
      return `mock-cid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
  }

  /**
   * Pin file/blob to Filecoin
   */
  async pinFile(file: Buffer, filename: string): Promise<string> {
    if (!this.storageService) {
      this.logger.warn('Storage service not initialized, returning mock CID');
      return `mock-file-cid-${Date.now()}`;
    }

    try {
      // Convert Buffer to Uint8Array for Synapse SDK
      const fileBytes = new Uint8Array(file);

      // Upload to Filecoin using Synapse SDK
      const { commp, size } = await this.storageService.upload(fileBytes);

      // Convert CommP to string
      const pieceCid = String(commp);
      
      this.logger.log(
        `Pinned file to Filecoin - PieceCID: ${pieceCid}, Size: ${size} bytes, Filename: ${filename}`,
      );
      return pieceCid;
    } catch (error) {
      this.logger.error('Error pinning file to Filecoin:', error);
      return `mock-file-cid-${Date.now()}`;
    }
  }

  /**
   * Retrieve data from Filecoin by PieceCID (commp)
   */
  async getByCid(cid: string): Promise<any> {
    if (!this.synapse) {
      this.logger.warn('Synapse SDK not initialized, cannot retrieve data');
      throw new Error('Synapse SDK not initialized');
    }

    try {
      // Download data from Filecoin using Synapse SDK
      const bytes = await this.synapse.download(cid);

      // Try to parse as JSON, otherwise return as text
      try {
        const text = new TextDecoder().decode(bytes);
        return JSON.parse(text);
      } catch {
        // If not JSON, return as text
        return new TextDecoder().decode(bytes);
      }
    } catch (error) {
      this.logger.error(`Error retrieving PieceCID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Verify PieceCID exists on Filecoin
   */
  async verifyCid(cid: string): Promise<boolean> {
    if (!this.synapse) {
      this.logger.debug(
        'Synapse SDK not initialized (FILECOIN_PRIVATE_KEY not set). Cannot verify CID.',
      );
      return false;
    }

    try {
      // Try to download the CID - if it succeeds, it exists
      await this.synapse.download(cid);
      return true;
    } catch (error) {
      this.logger.debug(`PieceCID ${cid} verification failed:`, error);
      return false;
    }
  }

  /**
   * Check if Synapse SDK is initialized
   */
  isInitialized(): boolean {
    return this.synapse !== null && this.storageService !== null;
  }

  /**
   * Ensure wallet is funded and approved for storage
   * Call this before first upload to deposit USDFC and approve operator
   */
  async ensureFundedAndApproved(): Promise<void> {
    if (!this.synapse || !this.storageService) {
      throw new Error('Synapse SDK or storage service not initialized');
    }

    try {
      const depositAmount = ethers.parseUnits('2.5', 18); // 2.5 USDFC covers 1TiB for 30 days
      
      // Get the storage provider address from the storage service
      const serviceAddress = this.storageService.storageProvider;
      
      // Deposit USDFC
      const depositTx = await this.synapse.payments.deposit(depositAmount);
      await depositTx.wait();
      this.logger.log('USDFC deposit successful');
      
      // Approve the storage service operator
      const rateAllowance = ethers.MaxUint256;
      const lockupAllowance = ethers.MaxUint256;
      const approveTx = await this.synapse.payments.approveService(
        serviceAddress,
        rateAllowance,
        lockupAllowance,
      );
      await approveTx.wait();
      this.logger.log('Storage service approval successful');
    } catch (error) {
      this.logger.error('Error funding and approving:', error);
      throw error;
    }
  }
}

