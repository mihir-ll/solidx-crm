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
import { CreateCrmUserDto } from '../dtos/create-crm-user.dto';
import { UpdateCrmUserDto } from '../dtos/update-crm-user.dto';
import { CrmUserService } from '../services/crm-user.service';

@ApiTags('CRM')
@ApiBearerAuth('jwt')
@Controller('crm-user')
export class CrmUserController {
  constructor(private readonly service: CrmUserService) {}
  @Post() @UseInterceptors(AnyFilesInterceptor()) create(
    @Body() dto: CreateCrmUserDto,
    @UploadedFiles() files: Express.Multer.File[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.create(dto, files, ctxt);
  }
  @Post('bulk') @UseInterceptors(AnyFilesInterceptor()) insertMany(
    @Body() dtos: CreateCrmUserDto[],
    @UploadedFiles() files: Express.Multer.File[][] = [],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.insertMany(dtos, files, ctxt);
  }
  @Put(':id') @UseInterceptors(AnyFilesInterceptor()) update(
    @Param('id') id: number,
    @Body() dto: UpdateCrmUserDto,
    @UploadedFiles() files: Express.Multer.File[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.update(id, dto, files, false, ctxt);
  }
  @Patch(':id') @UseInterceptors(AnyFilesInterceptor()) partialUpdate(
    @Param('id') id: number,
    @Body() dto: UpdateCrmUserDto,
    @UploadedFiles() files: Express.Multer.File[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.update(id, dto, files, true, ctxt);
  }
  @Get() findMany(
    @Query() query: any,
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.find(query, ctxt);
  }
  @Get(':id') findOne(
    @Param('id') id: string,
    @Query() query: any,
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.findOne(+id, query, ctxt);
  }
  @Delete('bulk') deleteMany(
    @Body() ids: number[],
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.deleteMany(ids, ctxt);
  }
  @Delete(':id') delete(
    @Param('id') id: number,
    @SolidRequestContextDecorator() ctxt: SolidRequestContextDto,
  ) {
    return this.service.delete(id, ctxt);
  }
  @Post('bulk-recover') recoverMany(@Body() ids: number[]) {
    return this.service.recoverMany(ids);
  }
  @Get('recover/:id') recover(@Param('id') id: number) {
    return this.service.recover(id);
  }
}
