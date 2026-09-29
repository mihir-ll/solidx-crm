import { Injectable } from '@nestjs/common';
import {
  DashboardWidgetDataProvider,
  IDashboardWidgetDataProvider,
  IDashboardWidgetDataProviderContext,
  IDashboardWidgetDataResponseEnvelope,
  ISelectionProvider,
  ISelectionProviderContext,
  ISelectionProviderValues,
  SelectionProvider,
} from '@solidxai/core';
import { LeadRepository } from '../repositories/lead.repository';

const meta = (providerName: string, widgetName: string) => ({
  providerName,
  widgetName,
  generatedAt: new Date().toISOString(),
  durationMs: 0,
});

const STAGE_ORDER = [
  'new',
  'first_contact_pending',
  'follow_up',
  'meeting_set',
  'meeting_pending',
  'opportunity_generated',
  'dead',
  'wrong_lead_info',
];
const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  first_contact_pending: 'First Contact Pending',
  follow_up: 'Follow up',
  meeting_set: 'Meeting Set',
  meeting_pending: 'Meeting Pending',
  opportunity_generated: 'Opportunity Generated',
  dead: 'Dead',
  wrong_lead_info: 'Wrong Lead Info',
};


const TABLE_COLUMN_LABELS: Record<string, string> = {
  currency: 'Currency',
  value: 'Value',
  title: 'Title',
  lead: 'Lead',
  dueDate: 'Due date',
};

const tableColumns = (
  providerContext: Record<string, any> | undefined,
  fallbackFields: readonly string[],
) => {
  const requestedFields = Array.isArray(providerContext?.columns)
    ? providerContext.columns.filter(
        (field: unknown): field is string => typeof field === 'string',
      )
    : [];
  const fields = requestedFields.filter((field) => fallbackFields.includes(field));
  const selectedFields = fields.length > 0 ? fields : [...fallbackFields];

  return selectedFields.map((field) => ({
    field,
    header: TABLE_COLUMN_LABELS[field] ?? field,
  }));
};

const formatDashboardDateTime = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

const sortTableRecords = <T extends Record<string, any>>(
  records: T[],
  providerContext: Record<string, any> | undefined,
  allowedFields: readonly string[],
  fallbackField: string,
): T[] => {
  const requestedField = providerContext?.sort?.field;
  const field = allowedFields.includes(requestedField)
    ? requestedField
    : fallbackField;
  const direction = providerContext?.sort?.order === 'desc' ? -1 : 1;

  return [...records].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    if (leftValue === rightValue) return 0;
    if (leftValue === null || leftValue === undefined || leftValue === '') {
      return -1 * direction;
    }
    if (rightValue === null || rightValue === undefined || rightValue === '') {
      return 1 * direction;
    }
    return (leftValue < rightValue ? -1 : 1) * direction;
  });
};

abstract class LeadDashboardProvider {
  constructor(protected readonly leads: LeadRepository) {}
  protected async query(alias = 'lead') {
    return this.leads.createSecurityRuleAwareQueryBuilder(alias);
  }
  protected async filteredQuery(
    ctxt: IDashboardWidgetDataProviderContext,
    alias = 'lead',
  ) {
    const query = await this.query(alias);
    const variables = ctxt?.variables ?? {};
    const asArray = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
      return typeof value === 'string' && value.length > 0 ? [value] : [];
    };
    const owners = asArray(variables.representative);
    const leadTypes = asArray(variables.leadType);
    const stages = asArray(variables.stage);

    if (variables.date?.from) {
      query.andWhere(`${alias}.createdAt >= :dashboardFrom`, { dashboardFrom: variables.date.from });
    }
    if (variables.date?.to) {
      query.andWhere(`${alias}.createdAt <= :dashboardTo`, { dashboardTo: variables.date.to });
    }
    if (owners.length > 0) {
      query.innerJoin(`${alias}.owner`, 'dashboardOwner');
      query.andWhere('dashboardOwner.id IN (:...dashboardOwners)', { dashboardOwners: owners });
    }
    if (leadTypes.length > 0) {
      query.andWhere(`${alias}.leadType IN (:...dashboardLeadTypes)`, { dashboardLeadTypes: leadTypes });
    }
    if (stages.length > 0) {
      query.andWhere(`${alias}.stage IN (:...dashboardStages)`, { dashboardStages: stages });
    }

    return query;
  }
  protected envelope(widgetName: string, data: any) {
    return { meta: meta(this.constructor.name, widgetName), data };
  }
}

type LeadOverviewMetric =
  | 'total_leads'
  | 'active_leads'
  | 'generated_opportunities'
  | 'overdue_followups';

@DashboardWidgetDataProvider()
@Injectable()
export class LeadOverviewKpiProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }

  name() {
    return 'LeadOverviewKpiProvider';
  }

  help() {
    return 'Security-aware lead overview metrics for dashboard KPI widgets.';
  }

  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<{ value: number; label: string }>> {
    const metric = ctxt?.providerContext?.metric as LeadOverviewMetric;
    const query = await this.filteredQuery(ctxt);
    let value = 0;

    switch (metric) {
      case 'active_leads':
        value = await query
          .andWhere('lead.stage NOT IN (:...terminal)', {
            terminal: ['dead', 'wrong_lead_info'],
          })
          .getCount();
        break;
      case 'generated_opportunities':
        value = await query
          .andWhere('lead.stage = :stage', { stage: 'opportunity_generated' })
          .getCount();
        break;
      case 'overdue_followups': {
        const result = await query
          .innerJoin('lead.tasks', 'task')
          .select('COUNT(DISTINCT task.id)', 'value')
          .andWhere('task.isCompleted = false')
          .andWhere('task.dueDate < :now', { now: new Date() })
          .getRawOne<{ value: string | number }>();
        value = Number(result?.value ?? 0);
        break;
      }
      case 'total_leads':
      default:
        value = await query.getCount();
    }

    return this.envelope(ctxt.widgetName, {
      value,
      label: _definition?.name ?? 'Lead KPI',
    });
  }
}

@DashboardWidgetDataProvider()
@Injectable()
export class PipelineFunnelProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }
  name() {
    return 'PipelineFunnelProvider';
  }
  help() {
    return 'Security-aware lead count by pipeline stage.';
  }
  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<any>> {
    const rows = await (
      await this.filteredQuery(ctxt)
    )
      .select('lead.stage', 'stage')
      .addSelect('COUNT(lead.id)', 'value')
      .groupBy('lead.stage')
      .getRawMany();
    const countsByStage = new Map(
      rows.map((row) => [row.stage, Number(row.value)] as const),
    );
    return this.envelope(ctxt.widgetName, {
      categories: STAGE_ORDER.map(
        (stage) => STAGE_LABELS[stage] ?? stage,
      ),
      series: [
        {
          name: 'Leads',
          data: STAGE_ORDER.map((stage) => countsByStage.get(stage) ?? 0),
        },
      ],
    });
  }
}

@DashboardWidgetDataProvider()
@Injectable()
export class PipelineValueProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }
  name() {
    return 'PipelineValueProvider';
  }
  help() {
    return 'Security-aware open pipeline value grouped by currency.';
  }
  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<any>> {
    const rows = await (
      await this.query()
    )
      .select('lead.currency', 'currency')
      .addSelect('COALESCE(SUM(lead.dealValue), 0)', 'value')
      .andWhere('lead.stage NOT IN (:...terminal)', {
        terminal: ['dead', 'wrong_lead_info'],
      })
      .groupBy('lead.currency')
      .getRawMany();
    const records = rows.map((row) => ({
      currency: row.currency,
      value: Number(row.value),
    }));
    return this.envelope(ctxt.widgetName, {
      columns: tableColumns(ctxt.providerContext, ['currency', 'value']),
      records: sortTableRecords(
        records,
        ctxt.providerContext,
        ['currency', 'value'],
        'value',
      ),
    });
  }
}

@DashboardWidgetDataProvider()
@Injectable()
export class LeadsBySourceProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }
  name() {
    return 'LeadsBySourceProvider';
  }
  help() {
    return 'Security-aware lead distribution by outreach source.';
  }
  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<any>> {
    const rows = await (await this.filteredQuery(ctxt))
      .select('lead.source', 'source')
      .getRawMany();
    const counts = new Map<string, number>();
    for (const row of rows) {
      let sources: string[] = [];
      if (typeof row.source === 'string') {
        try {
          const parsed = JSON.parse(row.source);
          sources = Array.isArray(parsed) ? parsed : [row.source];
        } catch {
          sources = [row.source];
        }
      }
      for (const source of sources.filter(Boolean)) {
        counts.set(source, (counts.get(source) ?? 0) + 1);
      }
    }
    return this.envelope(ctxt.widgetName, {
      items: Array.from(counts.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([label, value]) => ({ label, value })),
    });
  }
}

@DashboardWidgetDataProvider()
@Injectable()
export class RepLeaderboardProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }
  name() {
    return 'RepLeaderboardProvider';
  }
  help() {
    return 'Security-aware representative ranking by generated opportunities.';
  }
  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<any>> {
    const rows = await (
      await this.query()
    )
      .innerJoin('lead.owner', 'leadOwner')
      .select('leadOwner.fullName', 'name')
      .addSelect('COUNT(lead.id)', 'value')
      .andWhere('lead.stage = :stage', { stage: 'opportunity_generated' })
      .groupBy('leadOwner.id')
      .addGroupBy('leadOwner.fullName')
      .orderBy('COUNT(lead.id)', 'DESC')
      .limit(10)
      .getRawMany();
    return this.envelope(ctxt.widgetName, {
      categories: rows.map((row) => row.name),
      series: [
        { name: 'Opportunities', data: rows.map((row) => Number(row.value)) },
      ],
    });
  }
}

@DashboardWidgetDataProvider()
@Injectable()
export class OverdueFollowUpsProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }
  name() {
    return 'OverdueFollowUpsProvider';
  }
  help() {
    return 'Security-aware overdue follow-ups joined through accessible leads.';
  }
  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<any>> {
    const rows = await (
      await this.query()
    )
      .innerJoin('lead.tasks', 'task')
      .select('task.id', 'id')
      .addSelect('task.title', 'title')
      .addSelect('task.dueDate', 'dueDate')
      .addSelect('lead.name', 'lead')
      .andWhere('task.isCompleted = false')
      .andWhere('task.dueDate < :now', { now: new Date() })
      .orderBy('task.dueDate', 'ASC')
      .limit(20)
      .getRawMany();
    const sortedRows = sortTableRecords(
      rows,
      ctxt.providerContext,
      ['title', 'lead', 'dueDate'],
      'dueDate',
    );
    return this.envelope(ctxt.widgetName, {
      columns: tableColumns(ctxt.providerContext, ['title', 'lead', 'dueDate']),
      records: sortedRows.map((row) => ({
        ...row,
        dueDate: formatDashboardDateTime(row.dueDate),
      })),
    });
  }
}

@SelectionProvider()
@Injectable()
export class LeadOwnerDashboardOptionsProvider
  implements ISelectionProvider<ISelectionProviderContext>
{
  constructor(private readonly leads: LeadRepository) {}

  name() {
    return 'LeadOwnerDashboardOptionsProvider';
  }

  help() {
    return 'Provides representative options from accessible lead owners.';
  }

  async value(
    optionValue: string,
    _ctxt: ISelectionProviderContext,
  ): Promise<ISelectionProviderValues | null> {
    const row = await (
      await this.leads.createSecurityRuleAwareQueryBuilder('lead')
    )
      .innerJoin('lead.owner', 'owner')
      .select('owner.id', 'value')
      .addSelect('owner.fullName', 'label')
      .andWhere('owner.id = :ownerId', { ownerId: optionValue })
      .getRawOne();

    return row
      ? { value: String(row.value), label: row.label }
      : { value: optionValue, label: optionValue };
  }

  async values(
    query: string,
    ctxt: ISelectionProviderContext,
  ): Promise<readonly ISelectionProviderValues[]> {
    const builder = await this.leads.createSecurityRuleAwareQueryBuilder('lead');
    builder
      .innerJoin('lead.owner', 'owner')
      .select('owner.id', 'value')
      .addSelect('owner.fullName', 'label')
      .groupBy('owner.id')
      .addGroupBy('owner.fullName')
      .orderBy('owner.fullName', 'ASC')
      .limit(Math.min(Math.max(ctxt?.limit ?? 50, 1), 200))
      .offset(Math.max(ctxt?.offset ?? 0, 0));

    if (query?.trim()) {
      builder.andWhere('owner.fullName ILIKE :ownerQuery', {
        ownerQuery: `%${query.trim()}%`,
      });
    }

    const rows = await builder.getRawMany();
    return rows.map((row) => ({
      value: String(row.value),
      label: row.label,
    }));
  }
}

@DashboardWidgetDataProvider()
@Injectable()
export class LeadsCreatedTrendProvider
  extends LeadDashboardProvider
  implements IDashboardWidgetDataProvider
{
  constructor(leads: LeadRepository) {
    super(leads);
  }
  name() {
    return 'LeadsCreatedTrendProvider';
  }
  help() {
    return 'Security-aware monthly lead creation trend.';
  }
  async getData(
    _definition: Record<string, any>,
    ctxt: IDashboardWidgetDataProviderContext,
  ): Promise<IDashboardWidgetDataResponseEnvelope<any>> {
    const rows = await (
      await this.query()
    )
      .select(
        "TO_CHAR(DATE_TRUNC('month', lead.createdAt), 'YYYY-MM')",
        'bucket',
      )
      .addSelect('COUNT(lead.id)', 'value')
      .groupBy("DATE_TRUNC('month', lead.createdAt)")
      .orderBy("DATE_TRUNC('month', lead.createdAt)", 'ASC')
      .getRawMany();
    return this.envelope(ctxt.widgetName, {
      categories: rows.map((row) => row.bucket),
      series: [{ name: 'Leads', data: rows.map((row) => Number(row.value)) }],
    });
  }
}
