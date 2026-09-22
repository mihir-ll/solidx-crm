import { User } from '@solidxai/core';
import { ChildEntity, Column } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@ChildEntity()
@Exclude()
export class CrmUser extends User {
  @Expose()
  @Column({ type: 'varchar' })
  userType: string;
}
