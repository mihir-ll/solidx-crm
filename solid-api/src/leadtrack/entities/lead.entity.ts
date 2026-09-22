import { CommonEntity, User } from '@solidxai/core';
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
import { FollowUpTask } from './follow-up-task.entity';
import { LeadStage } from './lead-stage.entity';

@Entity('leadtrack_lead')
@Index(["email", "deletedTracker"], { unique: true })
export class Lead extends CommonEntity {
    @Index()
    @Column({ type: "varchar", length: 120 })
    name: string;

    @Index()
    @Column({ type: "varchar", nullable: true, length: 120 })
    company?: string;

    @Column({ type: "varchar", nullable: true })
    industry?: string;

    @Index()
    @Column({ type: "varchar", length: 254, nullable: true })
    email?: string;

    @Column({ type: "varchar", length: 20 })
    phone: string;

    @Column({ type: "decimal", nullable: true, precision: 15, scale: 2 })
    dealValue?: number;

    @Column({ type: "varchar", default: "INR" })
    currency: string = "INR";

    @Index()
    @Column({ type: "varchar" })
    source: string;

    @Index()
    @Column({ name: "lead_type", type: "varchar", length: 40, nullable: true })
    leadType?: string;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @Column({ name: 'stage', type: 'varchar', default: 'new' })
  legacyStage = 'new';

  @Index()
  @ManyToOne(() => LeadStage, (stage) => stage.leads, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'stage_id' })
  stage: LeadStage;

    @Index()
    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn()
    owner: User;

    @Column({ type: "text", nullable: true })
    remarks?: string;

  @OneToMany(() => FollowUpTask, (task) => task.lead)
  tasks: FollowUpTask[];

  @BeforeInsert()
  @BeforeUpdate()
  syncLegacyStage() {
    if (this.stage?.code) this.legacyStage = this.stage.code;
  }
}
