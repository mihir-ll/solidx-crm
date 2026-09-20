import { CommonEntity } from '@solidxai/core';
import {
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

    @Column({ type: "date", nullable: true })
    expectedCloseDate?: Date;

    @Index()
    @ManyToOne(() => LeadStage, (stage) => stage.leads, {
        nullable: true,
        onDelete: 'RESTRICT',
    })
    @JoinColumn()
    stage: LeadStage;

    @Index()
    @ManyToOne(() => LeadTrackUser, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn()
    owner: LeadTrackUser;

    @Column({ type: "text", nullable: true })
    remarks?: string;

    @OneToMany(() => FollowUpTask, followUpTask => followUpTask.lead, { cascade: true })
    tasks: FollowUpTask[];
}
