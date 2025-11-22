import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateIntentDto {
  @IsString()
  intentSpec: string;

  @IsString()
  @IsOptional()
  userAddress?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  tokenAddress?: string;

  @IsDateString()
  deadline: string;
}

