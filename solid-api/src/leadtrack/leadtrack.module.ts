import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadController } from './controllers/lead.controller';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import { LeadStage } from './entities/lead-stage.entity';
import { LeadStageBootstrapService } from './providers/lead-stage-bootstrap.service';
import {
  LeadsBySourceProvider,
  LeadsCreatedTrendProvider,
  OverdueFollowUpsProvider,
  PipelineFunnelProvider,
  PipelineValueProvider,
  RepLeaderboardProvider,
} from './providers/dashboard.providers';
import { FollowUpTaskRepository } from './repositories/follow-up-task.repository';
import { LeadRepository } from './repositories/lead.repository';
import { LeadStageRepository } from './repositories/lead-stage.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { LeadService } from './services/lead.service';
import { LeadStageService } from './services/lead-stage.service';

@Module({
  imports: [TypeOrmModule.forFeature([ Lead, FollowUpTask])],
  controllers: [ LeadController, FollowUpTaskController],
  providers: [
    LeadRepository,
    LeadStageRepository,
    FollowUpTaskRepository,
    LeadService,
    LeadStageService,
    LeadStageBootstrapService,
    FollowUpTaskService,
    PipelineFunnelProvider,
    PipelineValueProvider,
    LeadsBySourceProvider,
    RepLeaderboardProvider,
    OverdueFollowUpsProvider,
    LeadsCreatedTrendProvider,
    FollowUpReminderJob,
  ],
})
export class LeadTrackModule {}
