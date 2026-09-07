import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SectionsService } from './sections.service';
import { UpdateSectionDto } from './dto/update-section.dto';

interface AuthedRequest extends Request {
  user: { userId: string; email: string };
}

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.sectionsService.findOne(key);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('key') key: string, @Body() dto: UpdateSectionDto, @Req() req: AuthedRequest) {
    return this.sectionsService.update(key, dto.data, req.user.email);
  }
}
