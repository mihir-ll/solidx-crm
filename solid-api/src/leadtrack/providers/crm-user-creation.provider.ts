import { Injectable } from '@nestjs/common';
import {
  ExtensionUserCreationProvider,
  IExtensionUserCreationProvider,
} from '@solidxai/core';
import { CreateCrmUserDto } from '../dtos/create-crm-user.dto';
import { CrmUser } from '../entities/crm-user.entity';
import { CrmUserRepository } from '../repositories/crm-user.repository';

const CRM_USER_TYPES = ['Admin', 'SalesRepresentative'];

@ExtensionUserCreationProvider()
@Injectable()
export class CrmUserCreationProvider
  implements IExtensionUserCreationProvider<CrmUser, CreateCrmUserDto>
{
  constructor(readonly repo: CrmUserRepository) {}

  async buildExtensionEntity(dto: CreateCrmUserDto) {
    if (!CRM_USER_TYPES.includes(dto.userType)) {
      throw new Error('A valid LeadTrack user role is required.');
    }
    return this.repo.merge(this.repo.create(), { userType: dto.userType });
  }

  roles(dto: CreateCrmUserDto) {
    return CRM_USER_TYPES.includes(dto.userType) ? [dto.userType] : [];
  }
}
