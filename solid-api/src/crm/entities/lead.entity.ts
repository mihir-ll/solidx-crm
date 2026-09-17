import { CommonEntity } from '@solidxai/core';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CrmUser } from './crm-user.entity';
import { FollowUpTask } from './follow-up-task.entity';

export type LeadStage =
  | 'New'
  | 'FirstContactPending'
  | 'FollowUp'
  | 'MeetingSet'
  | 'MeetingPending'
  | 'OpportunityGenerated'
  | 'Dead'
  | 'WrongLeadInfo';

@Entity('crm_lead')
export class Lead extends CommonEntity {
  @Index()
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 120, nullable: true })
  company?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  industry?: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  dealValue?: string;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency = 'INR';

  @Index()
  @Column({ type: 'varchar' })
  source: string;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @Index()
  @Column({ type: 'varchar', default: 'New' })
  stage: LeadStage = 'New';

  @Index()
  @ManyToOne(() => CrmUser, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  owner: CrmUser;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => FollowUpTask, (task) => task.lead)
  tasks: FollowUpTask[];
}
