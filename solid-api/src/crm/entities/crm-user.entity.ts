import { Exclude, Expose } from 'class-transformer';
import { ChildEntity, Column, Index } from 'typeorm';
import { User } from '@solidxai/core';

@ChildEntity()
@Exclude()
export class CrmUser extends User {
  @Index({ unique: true })
  @Expose()
  @Column({ type: 'varchar' })
  crmUserKey: string;

  @Expose()
  @Column({ type: 'varchar', default: 'SalesRepresentative' })
  userType: 'Admin' | 'SalesRepresentative' = 'SalesRepresentative';
}
