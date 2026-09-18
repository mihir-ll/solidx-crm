import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadTrackUserController } from './controllers/lead-track-user.controller';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadController } from './controllers/lead.controller';
import { LeadTrackUser } from './entities/lead-track-user.entity';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import { LeadTrackUserCreationProvider } from './providers/lead-track-user-creation.provider';
import {
  LeadsBySourceProvider,
  LeadsCreatedTrendProvider,
  OverdueFollowUpsProvider,
  PipelineFunnelProvider,
  PipelineValueProvider,
  RepLeaderboardProvider,
} from './providers/dashboard.providers';
import { LeadTrackUserRepository } from './repositories/lead-track-user.repository';
import { FollowUpTaskRepository } from './repositories/follow-up-task.repository';
import { LeadRepository } from './repositories/lead.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { LeadTrackUserService } from './services/lead-track-user.service';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { LeadService } from './services/lead.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadTrackUser, Lead, FollowUpTask])],
  controllers: [LeadTrackUserController, LeadController, FollowUpTaskController],
  providers: [
    LeadTrackUserRepository,
    LeadRepository,
    FollowUpTaskRepository,
    LeadTrackUserService,
    LeadService,
    FollowUpTaskService,
    LeadTrackUserCreationProvider,
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
