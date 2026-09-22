import { Injectable } from '@nestjs/common';
import {
  DashboardWidgetDataProvider,
  IDashboardWidgetDataProvider,
  IDashboardWidgetDataProviderContext,
  IDashboardWidgetDataResponseEnvelope,
} from '@solidxai/core';
import { LeadRepository } from '../repositories/lead.repository';

const meta = (providerName: string, widgetName: string) => ({
  providerName,
  widgetName,
  generatedAt: new Date().toISOString(),
  durationMs: 0,
});

const STAGE_ORDER = [
  'New',
  'FirstContactPending',
  'FollowUp',
  'MeetingSet',
  'MeetingPending',
  'OpportunityGenerated',
  'Dead',
  'WrongLeadInfo',
];
const STAGE_LABELS: Record<string, string> = {
  New: 'New',
  FirstContactPending: 'First Contact Pending',
  FollowUp: 'Follow up',
  MeetingSet: 'Meeting Set',
  MeetingPending: 'Meeting Pending',
  OpportunityGenerated: 'Opportunity Generated',
  Dead: 'Dead',
  WrongLeadInfo: 'Wrong Lead Info',
};

abstract class LeadDashboardProvider {
  constructor(protected readonly leads: LeadRepository) {}
  protected async query(alias = 'lead') {
    return this.leads.createSecurityRuleAwareQueryBuilder(alias);
  }
  protected envelope(widgetName: string, data: any) {
    return { meta: meta(this.constructor.name, widgetName), data };
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
      await this.query()
    )
      .select('lead.stage', 'stage')
      .addSelect('COUNT(lead.id)', 'value')
      .groupBy('lead.stage')
      .getRawMany();
    rows.sort(
      (left, right) =>
        STAGE_ORDER.indexOf(left.stage) - STAGE_ORDER.indexOf(right.stage),
    );
    return this.envelope(ctxt.widgetName, {
      items: rows.map((row) => ({
        label: STAGE_LABELS[row.stage] ?? row.stage,
        value: Number(row.value),
      })),
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
        terminal: ['Dead', 'WrongLeadInfo'],
      })
      .groupBy('lead.currency')
      .getRawMany();
    return this.envelope(ctxt.widgetName, {
      columns: ['currency', 'value'],
      records: rows.map((row) => ({
        currency: row.currency,
        value: Number(row.value),
      })),
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
    const rows = await (
      await this.query()
    )
      .select('lead.source', 'label')
      .addSelect('COUNT(lead.id)', 'value')
      .groupBy('lead.source')
      .orderBy('COUNT(lead.id)', 'DESC')
      .getRawMany();
    return this.envelope(ctxt.widgetName, {
      items: rows.map((row) => ({
        label: row.label,
        value: Number(row.value),
      })),
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
      .innerJoin('lead.owner', 'owner')
      .select('owner.fullName', 'name')
      .addSelect('COUNT(lead.id)', 'value')
      .andWhere('lead.stage = :stage', { stage: 'OpportunityGenerated' })
      .groupBy('owner.id')
      .addGroupBy('owner.fullName')
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
    return this.envelope(ctxt.widgetName, {
      columns: ['title', 'lead', 'dueDate'],
      records: rows,
    });
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
