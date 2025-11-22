import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intent } from './entities/intent.entity';
import { FilecoinService } from '../filecoin/filecoin.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Injectable()
export class IntentsService {
  constructor(
    @InjectRepository(Intent)
    private intentsRepository: Repository<Intent>,
    private filecoinService: FilecoinService,
  ) {}

  async create(createIntentDto: CreateIntentDto, userAddress: string): Promise<Intent> {
    // Store intent metadata to Filecoin
    const cid = await this.filecoinService.pinJson({
      intentSpec: createIntentDto.intentSpec,
      userAddress,
      amount: createIntentDto.amount,
      tokenAddress: createIntentDto.tokenAddress,
      deadline: createIntentDto.deadline,
      createdAt: new Date(),
    });

    const intent = this.intentsRepository.create({
      intentId: `intent-${Date.now()}`,
      userAddress,
      intentSpec: createIntentDto.intentSpec,
      amount: createIntentDto.amount,
      tokenAddress: createIntentDto.tokenAddress,
      status: 'open',
      deadline: new Date(createIntentDto.deadline),
      filecoinCid: cid,
    });

    return this.intentsRepository.save(intent);
  }

  async findAll(userAddress?: string): Promise<Intent[]> {
    if (userAddress) {
      return this.intentsRepository.find({
        where: { userAddress },
        order: { createdAt: 'DESC' },
      });
    }
    return this.intentsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Intent> {
    const intent = await this.intentsRepository.findOne({ where: { id } });
    if (!intent) {
      throw new NotFoundException(`Intent with ID ${id} not found`);
    }
    return intent;
  }

  async updateStatus(id: string, status: string): Promise<Intent> {
    const intent = await this.findOne(id);
    intent.status = status;
    return this.intentsRepository.save(intent);
  }
}

