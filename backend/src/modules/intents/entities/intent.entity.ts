import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('intents')
export class Intent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  intentId: string; // On-chain intent ID

  @Column()
  userAddress: string;

  @Column('text')
  intentSpec: string; // Natural language + structured JSON

  @Column('decimal', { precision: 36, scale: 18 })
  amount: string;

  @Column({ nullable: true })
  tokenAddress: string;

  @Column({ default: 'open' })
  status: string; // open, bidding, executing, completed, disputed, cancelled

  @Column()
  deadline: Date;

  @Column({ nullable: true })
  selectedAgentId: string;

  @Column({ nullable: true })
  filecoinCid: string; // CID of stored metadata

  @Column({ nullable: true })
  executionProof: string; // Proof of execution

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

