import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadTrackUserController } from './controllers/leadtrack-user.controller';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadController } from './controllers/lead.controller';
import { LeadTrackUser } from './entities/leadtrack-user.entity';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import { LeadTrackUserCreationProvider } from './providers/leadtrack-user-creation.provider';
import {
  LeadsBySourceProvider,
  LeadsCreatedTrendProvider,
  OverdueFollowUpsProvider,
  PipelineFunnelProvider,
  PipelineValueProvider,
  RepLeaderboardProvider,
} from './providers/dashboard.providers';
import { LeadTrackUserRepository } from './repositories/leadtrack-user.repository';
import { FollowUpTaskRepository } from './repositories/follow-up-task.repository';
import { LeadRepository } from './repositories/lead.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { LeadTrackUserService } from './services/leadtrack-user.service';
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
