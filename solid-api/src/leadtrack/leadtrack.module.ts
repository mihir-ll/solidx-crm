import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadController } from './controllers/lead.controller';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
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
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { LeadService } from './services/lead.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, FollowUpTask])],
  controllers: [LeadController, FollowUpTaskController],
  providers: [
    LeadRepository,
    FollowUpTaskRepository,
    LeadService,
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
