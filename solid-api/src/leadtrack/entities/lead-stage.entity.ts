import { CommonEntity } from '@solidxai/core';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Lead } from './lead.entity';

@Entity('leadtrack_lead_stage')
export class LeadStage extends CommonEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80, unique: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80, unique: true })
  code: string;

  @Index()
  @Column({ type: 'integer', default: 10 })
  sequence = 10;

  @ManyToOne(() => LeadStage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'after_stage_id' })
  afterStage?: LeadStage;

  @OneToMany(() => Lead, (lead) => lead.stage)
  leads: Lead[];
}
