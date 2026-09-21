import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  SolidRequestContextDecorator,
  SolidRequestContextDto,
} from '@solidxai/core';
import { CreateLeadStageDto } from '../dtos/create-lead-stage.dto';
import { UpdateLeadStageDto } from '../dtos/update-lead-stage.dto';
import { LeadStageService } from '../services/lead-stage.service';

@ApiTags('LeadTrack')
@ApiBearerAuth('jwt')
@Controller('lead-stage')
export class LeadStageController {
  constructor(private readonly service: LeadStageService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body() dto: CreateLeadStageDto,
    @UploadedFiles() files: Express.Multer.File[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.create(dto, files, ctxt);
  }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: number,
    @Body() dto: UpdateLeadStageDto,
    @UploadedFiles() files: Express.Multer.File[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.update(id, dto, files, false, ctxt);
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  partialUpdate(
    @Param('id') id: number,
    @Body() dto: UpdateLeadStageDto,
    @UploadedFiles() files: Express.Multer.File[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.update(id, dto, files, true, ctxt);
  }

  @Get()
  findMany(
    @Query() query: any,
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.find(query, ctxt);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query() query: any,
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.findOne(+id, query, ctxt);
  }

  @Delete(':id')
  delete(
    @Param('id') id: number,
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.delete(id, ctxt);
  }
}
