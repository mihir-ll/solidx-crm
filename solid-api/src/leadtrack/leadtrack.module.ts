import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadTrackUserController } from './controllers/lead-track-user.controller';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadController } from './controllers/lead.controller';
import { LeadStageController } from './controllers/lead-stage.controller';
import { LeadTrackUser } from './entities/lead-track-user.entity';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import { LeadStage } from './entities/lead-stage.entity';
import { LeadStageBootstrapService } from './providers/lead-stage-bootstrap.service';
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
import { LeadStageRepository } from './repositories/lead-stage.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { LeadTrackUserService } from './services/lead-track-user.service';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { LeadService } from './services/lead.service';
import { LeadStageService } from './services/lead-stage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadTrackUser, LeadStage, Lead, FollowUpTask]),
  ],
  controllers: [
    LeadTrackUserController,
    LeadStageController,
    LeadController,
    FollowUpTaskController,
  ],
  providers: [
    LeadTrackUserRepository,
    LeadRepository,
    LeadStageRepository,
    FollowUpTaskRepository,
    LeadTrackUserService,
    LeadService,
    LeadStageService,
    LeadStageBootstrapService,
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
