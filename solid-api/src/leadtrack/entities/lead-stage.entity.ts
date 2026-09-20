import { CommonEntity } from '@solidxai/core';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Lead } from './lead.entity';

@Entity('leadtrack_lead_stage')
export class LeadStage extends CommonEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  code: string;

  @Index()
  @Column({ type: 'integer', default: 10 })
  sequence: number = 10;

  @Column({ type: 'boolean', default: false })
  isTerminal: boolean = false;

  @Column({ type: 'boolean', default: false })
  isWon: boolean = false;

  @OneToMany(() => Lead, (lead) => lead.stage)
  leads: Lead[];
}
