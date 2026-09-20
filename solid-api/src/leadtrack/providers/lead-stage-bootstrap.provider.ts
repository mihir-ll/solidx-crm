import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LeadStage } from '../entities/lead-stage.entity';

const DEFAULT_LEAD_STAGES: ReadonlyArray<Partial<LeadStage>> = [
  { name: 'New', code: 'new', sequence: 10 },
  {
    name: 'First Contact Pending',
    code: 'firstContactPending',
    sequence: 20,
  },
  { name: 'Follow up', code: 'followUp', sequence: 30 },
  { name: 'Meeting Set', code: 'meetingSet', sequence: 40 },
  { name: 'Meeting Pending', code: 'meetingPending', sequence: 50 },
  {
    name: 'Opportunity Generated',
    code: 'opportunityGenerated',
    sequence: 60,
    isTerminal: true,
    isWon: true,
  },
  { name: 'Dead', code: 'dead', sequence: 70, isTerminal: true },
  {
    name: 'Wrong Lead Info',
    code: 'wrongLeadInfo',
    sequence: 80,
    isTerminal: true,
  },
];

@Injectable()
export class LeadStageBootstrapProvider implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    const repository = this.dataSource.getRepository(LeadStage);
    if ((await repository.count()) > 0) {
      return;
    }

    await repository.save(
      DEFAULT_LEAD_STAGES.map((stage) => repository.create(stage)),
    );
  }
}
