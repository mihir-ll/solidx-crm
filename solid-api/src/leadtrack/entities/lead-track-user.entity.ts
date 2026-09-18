import { Exclude, Expose } from 'class-transformer';
import { ChildEntity, Column, Index } from 'typeorm';
import { User } from '@solidxai/core';

@ChildEntity()
@Exclude()
export class LeadTrackUser extends User {
    @Expose()
    @Index({ unique: true })
    @Column({ type: "varchar" })
    leadTrackUserKey: string;

    @Expose()
    @Index()
    @Column({ type: "varchar", default: "SalesRepresentative" })
    userType: string = "SalesRepresentative";
}
