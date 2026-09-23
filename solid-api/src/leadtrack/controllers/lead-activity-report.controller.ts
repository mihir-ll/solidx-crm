import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActiveUser, ActiveUserData } from '@solidxai/core';
import { Response } from 'express';
import { LeadActivityReportQueryDto } from '../dtos/lead-activity-report-query.dto';
import { LeadActivityReportService } from '../services/lead-activity-report.service';

@ApiTags('LeadTrack Reports')
@ApiBearerAuth('jwt')
@Controller('leadtrack-report/activity')
export class LeadActivityReportController {
  constructor(private readonly service: LeadActivityReportService) {}

  @Get('summary')
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  getSummary(
    @Query() query: LeadActivityReportQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.service.getSummary(query, activeUser);
  }

  @Get()
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'actorId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  getActivity(
    @Query() query: LeadActivityReportQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.service.getActivity(query, activeUser);
  }

  @Get('export')
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'actorId', required: false, type: Number })
  async exportCsv(
    @Query() query: LeadActivityReportQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Res() response: Response,
  ) {
    const csv = await this.service.exportCsv(query, activeUser);
    response
      .status(200)
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader(
        'Content-Disposition',
        'attachment; filename="leadtrack-team-activity-report.csv"',
      )
      .send(csv);
  }
}
