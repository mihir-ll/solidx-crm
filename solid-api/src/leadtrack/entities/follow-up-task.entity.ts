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
import { LeadTrackUser } from './lead-track-user.entity';
import { Lead } from './lead.entity';

@Entity('leadtrack_follow_up_task')
export class FollowUpTask extends CommonEntity {
    @Index()
    @ManyToOne(() => Lead, (lead) => lead.tasks, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    lead: Lead;

    @Column({ type: "varchar", length: 160 })
    title: string;

    @Column({ type: "varchar", default: "Call" })
    channel: string = "Call";

    @Index()
    @Column({ type: "timestamptz" })
    dueDate: Date;

    @Index()
    @Column({ type: "boolean", default: false })
    isCompleted: boolean = false;

    @Column({ type: "timestamptz", nullable: true })
    completedAt?: Date;

    @Column({ type: "text", nullable: true })
    outcomeNotes?: string;

    @Index()
    @ManyToOne(() => LeadTrackUser, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn()
    assignedTo?: LeadTrackUser;

    @BeforeInsert()
    @BeforeUpdate()
    syncCompletionTimestamp() {
        this.completedAt = this.isCompleted
            ? (this.completedAt ?? new Date())
            : undefined;

    }
}
