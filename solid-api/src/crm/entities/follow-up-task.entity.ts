import { CommonEntity } from '@solidxai/core';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CrmUser } from './crm-user.entity';
import { Lead } from './lead.entity';

@Entity('crm_follow_up_task')
export class FollowUpTask extends CommonEntity {
  @Index()
  @ManyToOne(() => Lead, (lead) => lead.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lead: Lead;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'varchar', default: 'Call' })
  channel = 'Call';

  @Index()
  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Index()
  @Column({ type: 'boolean', default: false })
  isCompleted : Boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  outcomeNotes?: string;

  @ManyToOne(() => CrmUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  assignedTo?: CrmUser;

  @BeforeInsert()
  @BeforeUpdate()
  syncCompletionTimestamp() {
    this.completedAt = this.isCompleted
      ? (this.completedAt ?? new Date())
      : undefined;
  }
}
