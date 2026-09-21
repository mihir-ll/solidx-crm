import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  ActiveUserData,
  ChatterMessage,
  ChatterMessageRepository,
} from '@solidxai/core';
import { LeadActivityReportQueryDto } from '../dtos/lead-activity-report-query.dto';

const AUDITED_MODELS = ['lead', 'followUpTask'];
const AUDIT_SUBTYPES = ['audit_insert', 'audit_update', 'audit_delete'];

type AuditAction = 'Created' | 'Updated' | 'Deleted';

type DateRange = {
  start: Date;
  end: Date;
  startIso: string;
  endIso: string;
};

@Injectable()
export class LeadActivityReportService {
  constructor(private readonly chatterMessages: ChatterMessageRepository) {}

  async getSummary(query: LeadActivityReportQueryDto, activeUser: ActiveUserData) {
    const range = this.resolveDateRange(query);
    const actorId = this.resolveActorId(query.actorId, activeUser);
    const qb = await this.buildAuditQuery(range, actorId);

    const rows = await qb
      .select('actor.id', 'actorId')
      .addSelect('actor.fullName', 'fullName')
      .addSelect('actor.email', 'email')
      .addSelect('COUNT(message.id)', 'total')
      .addSelect(
        "SUM(CASE WHEN message.messageSubType = 'audit_insert' THEN 1 ELSE 0 END)",
        'created',
      )
      .addSelect(
        "SUM(CASE WHEN message.messageSubType = 'audit_update' THEN 1 ELSE 0 END)",
        'updated',
      )
      .addSelect(
        "SUM(CASE WHEN message.messageSubType = 'audit_delete' THEN 1 ELSE 0 END)",
        'deleted',
      )
      .groupBy('actor.id')
      .addGroupBy('actor.fullName')
      .addGroupBy('actor.email')
      .orderBy('COUNT(message.id)', 'DESC')
      .addOrderBy('actor.fullName', 'ASC')
      .getRawMany();

    return {
      range: { startDate: range.startIso, endDate: range.endIso },
      groups: rows.map((row) => ({
        ...this.actorSummary(row.actorId, row.fullName, row.email),
        total: Number(row.total),
        created: Number(row.created),
        updated: Number(row.updated),
        deleted: Number(row.deleted),
      })),
      totalActions: rows.reduce((sum, row) => sum + Number(row.total), 0),
    };
  }

  async getActivity(query: LeadActivityReportQueryDto, activeUser: ActiveUserData) {
    const range = this.resolveDateRange(query);
    const actorId = this.resolveActorId(query.actorId, activeUser);
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
    const qb = await this.buildAuditQuery(range, actorId);

    const [messages, total] = await qb
      .leftJoinAndSelect('message.chatterMessageDetails', 'detail')
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      range: { startDate: range.startIso, endDate: range.endIso },
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      records: messages.map((message) => this.mapMessage(message)),
    };
  }

  async exportCsv(query: LeadActivityReportQueryDto, activeUser: ActiveUserData) {
    const range = this.resolveDateRange(query);
    const actorId = this.resolveActorId(query.actorId, activeUser);
    const qb = await this.buildAuditQuery(range, actorId);
    const messages = await qb
      .leftJoinAndSelect('message.chatterMessageDetails', 'detail')
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .getMany();

    const headers = [
      'Actor Name',
      'Actor Email',
      'Timestamp',
      'Action',
      'Entity',
      'Record',
      'Field',
      'Old Value',
      'New Value',
    ];
    const rows = [headers, ...messages.flatMap((message) => {
      const mapped = this.mapMessage(message);
      const details = mapped.changes.length > 0 ? mapped.changes : [null];
      return details.map((detail) => [
        mapped.actor.fullName,
        mapped.actor.email ?? '',
        mapped.occurredAt,
        mapped.action,
        mapped.entity,
        mapped.record,
        detail?.fieldDisplayName ?? detail?.fieldName ?? '',
        detail?.oldValueDisplay ?? detail?.oldValue ?? '',
        detail?.newValueDisplay ?? detail?.newValue ?? '',
      ]);
    })];

    return rows.map((row) => row.map((value) => this.csvCell(value)).join(',')).join('\r\n') + '\r\n';
  }

  private async buildAuditQuery(range: DateRange, actorId?: number) {
    const qb = await this.chatterMessages.createSecurityRuleAwareQueryBuilder('message');
    qb.leftJoinAndSelect('message.user', 'actor')
      .where('message.messageType = :messageType', { messageType: 'audit' })
      .andWhere('message.messageSubType IN (:...subTypes)', { subTypes: AUDIT_SUBTYPES })
      .andWhere('message.coModelName IN (:...models)', { models: AUDITED_MODELS })
      .andWhere('message.createdAt >= :startDate', { startDate: range.start })
      .andWhere('message.createdAt <= :endDate', { endDate: range.end });

    if (actorId === 0) {
      qb.andWhere('actor.id IS NULL');
    } else if (actorId !== undefined) {
      qb.andWhere('actor.id = :actorId', { actorId });
    }

    return qb;
  }

  private resolveActorId(requestedActorId: number | undefined, activeUser: ActiveUserData) {
    if (activeUser?.roles?.includes('Admin')) {
      return requestedActorId;
    }

    if (!activeUser?.sub) {
      throw new ForbiddenException('An authenticated user is required to view activity reports.');
    }

    return activeUser.sub;
  }

  private resolveDateRange(query: LeadActivityReportQueryDto): DateRange {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('startDate and endDate must be valid ISO dates.');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before or equal to endDate.');
    }

    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    };
  }

  private mapMessage(message: ChatterMessage) {
    const actor = this.actorSummary(
      message.user?.id,
      message.user?.fullName,
      message.user?.email,
    );

    return {
      id: message.id,
      actor,
      occurredAt: message.createdAt,
      action: this.actionName(message.messageSubType),
      entity: message.modelDisplayName || message.coModelName,
      entityName: message.coModelName,
      record: message.modelUserKey || String(message.coModelEntityId),
      entityId: message.coModelEntityId,
      message: message.messageBody ?? '',
      changes: (message.chatterMessageDetails ?? []).map((detail) => ({
        fieldName: detail.fieldName,
        fieldDisplayName: detail.fieldDisplayName,
        oldValue: detail.oldValue,
        oldValueDisplay: detail.oldValueDisplay,
        newValue: detail.newValue,
        newValueDisplay: detail.newValueDisplay,
      })),
    };
  }

  private actorSummary(id?: number | string | null, fullName?: string, email?: string | null) {
    const normalizedId = id === null || id === undefined || id === '' ? null : Number(id);
    return {
      id: Number.isFinite(normalizedId) ? normalizedId : null,
      fullName: fullName || 'System',
      email: email || null,
    };
  }

  private actionName(subType: string): AuditAction {
    if (subType === 'audit_insert') return 'Created';
    if (subType === 'audit_delete') return 'Deleted';
    return 'Updated';
  }

  private csvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  }
}
