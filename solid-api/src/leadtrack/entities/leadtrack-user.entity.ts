import { Exclude, Expose } from 'class-transformer';
import { ChildEntity, Column, Index } from 'typeorm';
import { User } from '@solidxai/core';

@ChildEntity()
@Exclude()
export class LeadTrackUser extends User {
  @Index({ unique: true })
  @Expose()
  // Preserve the existing physical column while exposing LeadTrack naming in code.
  @Column({ name: 'crmUserKey', type: 'varchar' })
  leadTrackUserKey: string;

  @Expose()
  @Column({ type: 'varchar', default: 'SalesRepresentative' })
  userType: 'Admin' | 'SalesRepresentative' = 'SalesRepresentative';
}
