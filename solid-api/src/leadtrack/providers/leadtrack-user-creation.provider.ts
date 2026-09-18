import { Injectable } from '@nestjs/common';
import {
  ExtensionUserCreationProvider,
  IExtensionUserCreationProvider,
} from '@solidxai/core';
import { CreateLeadTrackUserDto } from '../dtos/create-leadtrack-user.dto';
import { LeadTrackUser } from '../entities/leadtrack-user.entity';
import { LeadTrackUserRepository } from '../repositories/leadtrack-user.repository';

@ExtensionUserCreationProvider()
@Injectable()
export class LeadTrackUserCreationProvider implements IExtensionUserCreationProvider<
  LeadTrackUser,
  CreateLeadTrackUserDto
> {
  constructor(readonly repo: LeadTrackUserRepository) {}

  async buildExtensionEntity(dto: CreateLeadTrackUserDto): Promise<LeadTrackUser> {
    const key = dto.email ?? dto.mobile ?? `leadtrack-user-${Date.now()}`;
    return this.repo.merge(this.repo.create(), {
      leadTrackUserKey: key,
      userType: dto.userType,
    });
  }

  roles(dto: CreateLeadTrackUserDto): string[] {
    return [dto.userType];
  }
}
