import { Injectable } from '@nestjs/common';
import {
  ExtensionUserCreationProvider,
  IExtensionUserCreationProvider,
} from '@solidxai/core';
import { CreateCrmUserDto } from '../dtos/create-crm-user.dto';
import { CrmUser } from '../entities/crm-user.entity';
import { CrmUserRepository } from '../repositories/crm-user.repository';

@ExtensionUserCreationProvider()
@Injectable()
export class CrmUserCreationProvider implements IExtensionUserCreationProvider<
  CrmUser,
  CreateCrmUserDto
> {
  constructor(readonly repo: CrmUserRepository) {}

  async buildExtensionEntity(dto: CreateCrmUserDto): Promise<CrmUser> {
    const key = dto.email ?? dto.mobile ?? `crm-user-${Date.now()}`;
    return this.repo.merge(this.repo.create(), {
      crmUserKey: key,
      userType: dto.userType,
    });
  }

  roles(dto: CreateCrmUserDto): string[] {
    return [dto.userType];
  }
}
