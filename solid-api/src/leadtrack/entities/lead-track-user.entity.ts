import { Exclude, Expose } from 'class-transformer';
import { ChildEntity, Column, Index } from 'typeorm';
import { User } from '@solidxai/core';

@ChildEntity()
@Exclude()
export class LeadTrackUser extends User {
  @Index({ unique: true })
  @Expose()
  @Column({ type: 'varchar' })
  leadTrackUserKey: string;

  @Expose()
  @Column({ type: 'varchar', default: 'SalesRepresentative' })
  userType: 'Admin' | 'SalesRepresentative' = 'SalesRepresentative';
}
