import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  ActiveUserData,
  ChatterMessage,
  ChatterMessageRepository,
  User,
} from '@solidxai/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { FollowUpTask } from '../entities/follow-up-task.entity';
import { Lead } from '../entities/lead.entity';
import { LeadActivityReportQueryDto } from '../dtos/lead-activity-report-query.dto';

const AUDITED_MODELS = ['lead', 'followUpTask'];
const AUDIT_SUBTYPES = ['audit_insert', 'audit_update', 'audit_delete'];
const NOTE_SUBTYPE = 'note';
const KNOWN_CHANNELS = [
  'Call',
  'Email',
  'LinkedIn',
  'WhatsApp',
  'Meeting',
  'Other',
] as const;

type Channel = (typeof KNOWN_CHANNELS)[number];
type ReportEventType =
  'lead_added' | 'lead_changed' | 'task_completed' | 'note_posted';

type DateRange = {
  start: Date;
  end: Date;
  startIso: string;
  endIso: string;
};

type ActivityActor = {
  id: number | null;
  fullName: string;
  email: string | null;
};

type ActivityChange = {
  fieldName: string;
  fieldDisplayName?: string;
  oldValue?: string | null;
  oldValueDisplay?: string | null;
  newValue?: string | null;
  newValueDisplay?: string | null;
};

type ReportEvent = {
  id: number;
  actor: ActivityActor;
  occurredAt: Date;
  type: ReportEventType;
  entity: string;
  entityName: string;
  record: string;
  entityId: number;
  lead: {
    id: number | null;
    name: string;
    company: string | null;
  };
  message: string;
  channel?: string | null;
  changes: ActivityChange[];
};

type MetricSummary = {
  leadsAdded: number;
  tasksCompleted: number;
  tasksCompletedByChannel: Record<Channel, number>;
  stageAdvances: number;
  meetingsSet: number;
  opportunitiesGenerated: number;
  deadOrWrong: number;
  overdueFollowUps: number;
  notesPosted: number;
};

@Injectable()
export class LeadActivityReportService {
  constructor(
    private readonly chatterMessages: ChatterMessageRepository,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  async getSummary(
    query: LeadActivityReportQueryDto,
    activeUser: ActiveUserData,
  ) {
    this.ensureAdmin(activeUser);
    const range = this.resolveDateRange(query);
    const [auditMessages, noteMessages, leads, tasks, users] =
      await Promise.all([
        this.loadMessages(range, 'audit', AUDIT_SUBTYPES, query.actorId),
        this.loadMessages(range, 'custom', [NOTE_SUBTYPE], query.actorId),
        this.loadLeads(),
        this.loadTasks(),
        this.manager.getRepository(User).find({
          select: { id: true, fullName: true, email: true },
          order: { fullName: 'ASC' },
        }),
      ]);
    const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const leadChannelMap = this.buildLeadChannelMap(leads, tasks);
    const events = this.buildEvents(
      auditMessages,
      noteMessages,
      leadMap,
      taskMap,
      leadChannelMap,
    );

    const groups = new Map<
      string,
      { actor: ActivityActor; metrics: MetricSummary }
    >();

    for (const user of users) {
      if (query.actorId !== undefined && user.id !== query.actorId) continue;
      this.getGroup(groups, this.actorFromUser(user));
    }

    for (const event of events) {
      const group = this.getGroup(groups, event.actor);
      this.applyEventMetric(group.metrics, event);
    }

    const now = new Date();
    for (const task of tasks) {
      if (
        task.isCompleted ||
        !task.dueDate ||
        new Date(task.dueDate) >= now
      )
        continue;
      if (!task.lead?.owner) continue;
      if (query.actorId !== undefined && task.lead.owner.id !== query.actorId) continue;
      if (
        query.actorId === undefined &&
        !groups.has(String(task.lead.owner.id))
      )
        continue;
      const group = this.getGroup(groups, this.actorFromUser(task.lead.owner));
      group.metrics.overdueFollowUps += 1;
    }

    const summaryGroups = Array.from(groups.values())
      .sort(
        (left, right) =>
          this.metricTotal(right.metrics) - this.metricTotal(left.metrics),
      )
      .map(({ actor, metrics }) => ({ ...actor, ...metrics }));

    return {
      range: { startDate: range.startIso, endDate: range.endIso },
      groups: summaryGroups,
      totalActions: summaryGroups.reduce(
        (total, group) => total + this.metricTotal(group),
        0,
      ),
    };
  }

  async getActivity(
    query: LeadActivityReportQueryDto,
    activeUser: ActiveUserData,
  ) {
    this.ensureAdmin(activeUser);
    const range = this.resolveDateRange(query);
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
    const [auditMessages, noteMessages, leads, tasks] = await Promise.all([
      this.loadMessages(range, 'audit', AUDIT_SUBTYPES, query.actorId),
      this.loadMessages(range, 'custom', [NOTE_SUBTYPE], query.actorId),
      this.loadLeads(),
      this.loadTasks(),
    ]);
    const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const leadChannelMap = this.buildLeadChannelMap(leads, tasks);
    const records = this.buildEvents(
      auditMessages,
      noteMessages,
      leadMap,
      taskMap,
      leadChannelMap,
    ).sort(
      (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime(),
    );
    const total = records.length;

    return {
      range: { startDate: range.startIso, endDate: range.endIso },
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      records: records.slice((page - 1) * pageSize, page * pageSize),
    };
  }

  async exportCsv(
    query: LeadActivityReportQueryDto,
    activeUser: ActiveUserData,
  ) {
    this.ensureAdmin(activeUser);
    const range = this.resolveDateRange(query);
    const [auditMessages, noteMessages, leads, tasks] = await Promise.all([
      this.loadMessages(range, 'audit', AUDIT_SUBTYPES, query.actorId),
      this.loadMessages(range, 'custom', [NOTE_SUBTYPE], query.actorId),
      this.loadLeads(),
      this.loadTasks(),
    ]);
    const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const leadChannelMap = this.buildLeadChannelMap(leads, tasks);
    const records = this.buildEvents(
      auditMessages,
      noteMessages,
      leadMap,
      taskMap,
      leadChannelMap,
    ).sort(
      (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime(),
    );
    const headers = [
      'Representative',
      'Email',
      'Timestamp',
      'Event',
      'Lead',
      'Company',
      'Channel',
      'Message',
      'Field',
      'Old Value',
      'New Value',
    ];
    const rows = [
      headers,
      ...records.flatMap((record) => {
        const changes = record.changes.length > 0 ? record.changes : [null];
        return changes.map((change) => [
          record.actor.fullName,
          record.actor.email ?? '',
          record.occurredAt.toISOString(),
          record.type,
          record.lead.name,
          record.lead.company ?? '',
          record.channel ?? '',
          record.message,
          change?.fieldDisplayName ?? change?.fieldName ?? '',
          change?.oldValueDisplay ?? change?.oldValue ?? '',
          change?.newValueDisplay ?? change?.newValue ?? '',
        ]);
      }),
    ];

    return (
      rows
        .map((row) => row.map((value) => this.csvCell(value)).join(','))
        .join('\r\n') + '\r\n'
    );
  }

  private async loadMessages(
    range: DateRange,
    messageType: string,
    subTypes: string[],
    actorId?: number,
  ) {
    const qb =
      await this.chatterMessages.createSecurityRuleAwareQueryBuilder('message');
    qb.leftJoinAndSelect('message.user', 'actor')
      .leftJoinAndSelect('message.chatterMessageDetails', 'detail')
      .where('message.messageType = :messageType', { messageType })
      .andWhere('message.messageSubType IN (:...subTypes)', { subTypes })
      .andWhere('message.coModelName IN (:...models)', {
        models: AUDITED_MODELS,
      })
      .andWhere('message.createdAt >= :startDate', { startDate: range.start })
      .andWhere('message.createdAt <= :endDate', { endDate: range.end });

    if (actorId === 0) {
      qb.andWhere('actor.id IS NULL');
    } else if (actorId !== undefined) {
      qb.andWhere('actor.id = :actorId', { actorId });
    }

    return qb
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .getMany();
  }

  private async loadLeads() {
    return this.manager
      .getRepository(Lead)
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.owner', 'owner')
      .where('lead.deletedAt IS NULL')
      .getMany();
  }

  private async loadTasks() {
    return this.manager
      .getRepository(FollowUpTask)
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.lead', 'lead')
      .leftJoinAndSelect('lead.owner', 'owner')
      .where('task.deletedAt IS NULL')
      .andWhere('lead.deletedAt IS NULL')
      .getMany();
  }

  private buildLeadChannelMap(leads: Lead[], tasks: FollowUpTask[]) {
    const channels = new Map<number, string>();

    for (const lead of leads) {
      const sourceValues = this.parseChannelValues(lead.source);
      if (sourceValues.length > 0) channels.set(lead.id, sourceValues.join(", "));
    }

    for (const task of tasks) {
      if (!task.lead?.id || !task.channel || channels.has(task.lead.id)) continue;
      const values = this.parseChannelValues(task.channel);
      if (values.length > 0) channels.set(task.lead.id, values.join(", "));
    }

    return channels;
  }

  private parseChannelValues(value?: string | null) {
    if (!value?.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      // Keep compatibility with legacy comma-separated values.
    }
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  private buildEvents(
    auditMessages: ChatterMessage[],
    noteMessages: ChatterMessage[],
    leadMap: Map<number, Lead>,
    taskMap: Map<number, FollowUpTask>,
    leadChannelMap: Map<number, string>,
  ): ReportEvent[] {
    const events: ReportEvent[] = [];

    for (const message of auditMessages) {
      const task =
        message.coModelName === 'followUpTask'
          ? taskMap.get(message.coModelEntityId)
          : undefined;
      const lead =
        message.coModelName === 'lead'
          ? leadMap.get(message.coModelEntityId)
          : task?.lead;
      if (
        message.coModelName === 'followUpTask' &&
        !this.isTaskCompletion(message)
      )
        continue;
      if (!lead) continue;

      events.push({
        id: message.id,
        actor: this.actorFromUser(message.user),
        occurredAt: new Date(message.createdAt),
        type:
          message.coModelName === 'lead'
            ? message.messageSubType === 'audit_insert'
              ? 'lead_added'
              : 'lead_changed'
            : 'task_completed',
        entity: message.modelDisplayName || message.coModelName,
        entityName: message.coModelName,
        record: message.modelUserKey || String(message.coModelEntityId),
        entityId: message.coModelEntityId,
        lead: this.leadSummary(lead, message),
        message: message.messageBody ?? '',
        channel: task?.channel ??
          leadChannelMap.get(lead?.id ?? -1) ??
          this.channelFromChanges(message),
        changes: this.mapChanges(message),
      });
    }

    for (const message of noteMessages) {
      const task =
        message.coModelName === 'followUpTask'
          ? taskMap.get(message.coModelEntityId)
          : undefined;
      const lead =
        message.coModelName === 'lead'
          ? leadMap.get(message.coModelEntityId)
          : task?.lead;
      if (!lead) continue;
      events.push({
        id: message.id,
        actor: this.actorFromUser(message.user),
        occurredAt: new Date(message.createdAt),
        type: 'note_posted',
        entity: message.modelDisplayName || message.coModelName,
        entityName: message.coModelName,
        record: message.modelUserKey || String(message.coModelEntityId),
        entityId: message.coModelEntityId,
        lead: this.leadSummary(lead, message),
        message: message.messageBody ?? '',
        changes: [],
      });
    }

    return events;
  }

  private applyEventMetric(metrics: MetricSummary, event: ReportEvent) {
    if (event.type === 'lead_added') metrics.leadsAdded += 1;
    if (event.type === 'note_posted') metrics.notesPosted += 1;
    if (event.type === 'task_completed') {
      metrics.tasksCompleted += 1;
      metrics.tasksCompletedByChannel[this.normalizeChannel(event.channel)] +=
        1;
    }
    if (event.type !== 'lead_changed') return;
    for (const change of event.changes) {
      if (change.fieldName !== 'stage' || change.oldValue === change.newValue)
        continue;
      metrics.stageAdvances += 1;
      if (change.newValue === 'meeting_set') metrics.meetingsSet += 1;
      if (change.newValue === 'opportunity_generated')
        metrics.opportunitiesGenerated += 1;
      if (change.newValue === 'dead' || change.newValue === 'wrong_lead_info')
        metrics.deadOrWrong += 1;
    }
  }

  private getGroup(
    groups: Map<string, { actor: ActivityActor; metrics: MetricSummary }>,
    actor: ActivityActor,
  ) {
    const key = actor.id === null ? 'system' : String(actor.id);
    let group = groups.get(key);
    if (!group) {
      group = { actor, metrics: this.emptyMetrics() };
      groups.set(key, group);
    }
    return group;
  }

  private emptyMetrics(): MetricSummary {
    return {
      leadsAdded: 0,
      tasksCompleted: 0,
      tasksCompletedByChannel: {
        Call: 0,
        Email: 0,
        LinkedIn: 0,
        WhatsApp: 0,
        Meeting: 0,
        Other: 0,
      },
      stageAdvances: 0,
      meetingsSet: 0,
      opportunitiesGenerated: 0,
      deadOrWrong: 0,
      overdueFollowUps: 0,
      notesPosted: 0,
    };
  }

  private metricTotal(metrics: MetricSummary) {
    return (
      metrics.leadsAdded +
      metrics.tasksCompleted +
      metrics.stageAdvances +
      metrics.overdueFollowUps +
      metrics.notesPosted
    );
  }

  private isTaskCompletion(message: ChatterMessage) {
    return this.mapChanges(message).some(
      (change) =>
        change.fieldName === 'isCompleted' &&
        this.booleanValue(change.oldValue) === false &&
        this.booleanValue(change.newValue) === true,
    );
  }

  private booleanValue(value?: string | null) {
    return value === 'true' || value === '1';
  }

  private channelFromChanges(message: ChatterMessage): string | null {
    const channelChange = this.mapChanges(message).find(
      (change) => change.fieldName === "channel",
    );
    return channelChange?.newValueDisplay ?? channelChange?.newValue ?? null;
  }

  private normalizeChannel(channel?: string | null): Channel {
    return KNOWN_CHANNELS.includes(channel as Channel)
      ? (channel as Channel)
      : 'Other';
  }

  private mapChanges(message: ChatterMessage): ActivityChange[] {
    return (message.chatterMessageDetails ?? []).map((detail) => ({
      fieldName: detail.fieldName,
      fieldDisplayName: detail.fieldDisplayName,
      oldValue: detail.oldValue,
      oldValueDisplay: detail.oldValueDisplay,
      newValue: detail.newValue,
      newValueDisplay: detail.newValueDisplay,
    }));
  }

  private leadSummary(lead: Lead | undefined, message: ChatterMessage) {
    return {
      id: lead?.id ?? null,
      name:
        lead?.name || message.modelUserKey || `Lead ${message.coModelEntityId}`,
      company: lead?.company ?? null,
    };
  }

  private actorFromUser(
    user?: { id?: number; fullName?: string; email?: string | null } | null,
  ): ActivityActor {
    return this.actorSummary(user?.id, user?.fullName, user?.email);
  }

  private actorSummary(
    id?: number | string | null,
    fullName?: string,
    email?: string | null,
  ): ActivityActor {
    const normalizedId =
      id === null || id === undefined || id === '' ? null : Number(id);
    return {
      id: Number.isFinite(normalizedId) ? normalizedId : null,
      fullName: fullName || 'System',
      email: email || null,
    };
  }

  private ensureAdmin(activeUser: ActiveUserData) {
    if (!activeUser?.roles?.includes('Admin')) {
      throw new ForbiddenException(
        'Only administrators can view team activity reports.',
      );
    }
  }

  private resolveDateRange(query: LeadActivityReportQueryDto): DateRange {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException(
        'startDate and endDate must be valid ISO dates.',
      );
    }
    if (start > end) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate.',
      );
    }
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    };
  }

  private csvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  }
}
