import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IntentsService } from './intents.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Controller('api/intents')
export class IntentsController {
  constructor(private readonly intentsService: IntentsService) {}

  @Post()
  async create(@Body() createIntentDto: CreateIntentDto) {
    // In production, extract user address from auth token
    const userAddress = createIntentDto.userAddress || '0x0000000000000000000000000000000000000000';
    return this.intentsService.create(createIntentDto, userAddress);
  }

  @Get()
  async findAll(@Query('user') userAddress?: string) {
    return this.intentsService.findAll(userAddress);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.intentsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.intentsService.updateStatus(id, status);
  }
}

