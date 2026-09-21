import { CommonEntity } from '@solidxai/core';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LeadTrackUser } from './lead-track-user.entity';
import { FollowUpTask } from './follow-up-task.entity';
import { LeadStage } from './lead-stage.entity';

@Entity('leadtrack_lead')
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

  @Column({ name: 'stage', type: 'varchar', default: 'New' })
  legacyStage = 'New';

  @Index()
  @ManyToOne(() => LeadStage, (stage) => stage.leads, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'stage_id' })
  stage: LeadStage;

  @Index()
  @ManyToOne(() => LeadTrackUser, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  owner: LeadTrackUser;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => FollowUpTask, (task) => task.lead)
  tasks: FollowUpTask[];

  @BeforeInsert()
  @BeforeUpdate()
  syncLegacyStage() {
    if (this.stage?.code) this.legacyStage = this.stage.code;
  }
}
