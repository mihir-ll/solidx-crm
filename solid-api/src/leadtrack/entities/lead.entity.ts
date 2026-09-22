import { CommonEntity } from '@solidxai/core';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FollowUpTask } from './follow-up-task.entity';
import { CrmUser } from './crm-user.entity';

@Entity('leadtrack_lead')
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

  @Column({ type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  meetingDate?: Date;

  @Index()
  @Column({ type: 'varchar', default: 'New' })
  stage = 'New';

    @Index()
    @ManyToOne(() => CrmUser, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn()
    owner: CrmUser;

    @Column({ type: "text", nullable: true })
    remarks?: string;

  @OneToMany(() => FollowUpTask, (task) => task.lead)
  tasks: FollowUpTask[];

}
