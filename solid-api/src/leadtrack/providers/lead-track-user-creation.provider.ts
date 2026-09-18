import { Injectable } from '@nestjs/common';
import {
  ExtensionUserCreationProvider,
  IExtensionUserCreationProvider,
} from '@solidxai/core';
import { CreateLeadTrackUserDto } from '../dtos/create-lead-track-user.dto';
import { LeadTrackUser } from '../entities/lead-track-user.entity';
import { LeadTrackUserRepository } from '../repositories/lead-track-user.repository';

@ExtensionUserCreationProvider()
@Injectable()
export class LeadTrackUserCreationProvider implements IExtensionUserCreationProvider<
  LeadTrackUser,
  CreateLeadTrackUserDto
> {
  constructor(readonly repo: LeadTrackUserRepository) {}

  async buildExtensionEntity(dto: CreateLeadTrackUserDto): Promise<LeadTrackUser> {
    const key = dto.email ?? dto.mobile ?? `lead-track-user-${Date.now()}`;
    return this.repo.merge(this.repo.create(), {
      leadTrackUserKey: key,
      userType: dto.userType,
    });
  }

  roles(dto: CreateLeadTrackUserDto): string[] {
    return [dto.userType];
  }
}
