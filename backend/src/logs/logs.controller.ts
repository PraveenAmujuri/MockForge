import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('project/:projectId')
  findAllByProject(
    @CurrentUser() user: { sub: string; email: string },
    @Param('projectId') projectId: string,
  ) {
    return this.logsService.findAllByProject(user.sub, projectId);
  }

  @Get('endpoint/:endpointId')
  findAllByEndpoint(
    @CurrentUser() user: { sub: string; email: string },
    @Param('endpointId') endpointId: string,
  ) {
    return this.logsService.findAllByEndpoint(user.sub, endpointId);
  }

  @Delete('project/:projectId')
  clearProjectLogs(
    @CurrentUser() user: { sub: string; email: string },
    @Param('projectId') projectId: string,
  ) {
    return this.logsService.clearProjectLogs(user.sub, projectId);
  }
}
