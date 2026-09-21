import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { LeadStage } from '../entities/lead-stage.entity';

const DEFAULT_STAGES = [
  ['New', 'New'],
  ['FirstContactPending', 'First Contact Pending'],
  ['FollowUp', 'Follow up'],
  ['MeetingSet', 'Meeting Set'],
  ['MeetingPending', 'Meeting Pending'],
  ['OpportunityGenerated', 'Opportunity Generated'],
  ['Dead', 'Dead'],
  ['WrongLeadInfo', 'Wrong Lead Info'],
] as const;

@Injectable()
export class LeadStageBootstrapService implements OnApplicationBootstrap {
  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  async onApplicationBootstrap() {
    await this.manager.transaction(async (trx) => {
      const repo = trx.getRepository(LeadStage);

      if ((await repo.count()) === 0) {
        let previous: LeadStage | undefined;
        for (let index = 0; index < DEFAULT_STAGES.length; index++) {
          const [code, name] = DEFAULT_STAGES[index];
          previous = await repo.save(
            repo.create({
              code,
              name,
              sequence: (index + 1) * 10,
              afterStage: previous,
            }),
          );
        }
      }

      const orderedStages = await repo.find({
        order: { sequence: 'ASC', id: 'ASC' },
      });
      orderedStages.sort((left, right) => {
        if (left.code === 'New') return -1;
        if (right.code === 'New') return 1;
        return left.sequence - right.sequence || left.id - right.id;
      });
      for (let index = 0; index < orderedStages.length; index++) {
        await repo.update(orderedStages[index].id, {
          sequence: (index + 1) * 10,
          afterStage: index === 0 ? null : orderedStages[index - 1],
        });
      }

      await trx.query(`
        UPDATE leadtrack_lead AS lead
        SET stage_id = stage.id
        FROM leadtrack_lead_stage AS stage
        WHERE lead.stage_id IS NULL AND stage.code = lead.stage
      `);

      await trx.query(`
        UPDATE leadtrack_lead AS lead
        SET stage_id = stage.id
        FROM leadtrack_lead_stage AS stage
        WHERE lead.stage_id IS NULL AND stage.code = 'New'
      `);
    });
  }
}
