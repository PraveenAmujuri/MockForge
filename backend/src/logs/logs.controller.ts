import { Controller, Get, Delete, Param, UseGuards, Sse, MessageEvent, Query, ForbiddenException } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtService } from '@nestjs/jwt';
import { LogsEmitterService } from './logs-emitter.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Controller('logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly logsEmitter: LogsEmitterService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('project/:projectId')
  findAllByProject(
    @CurrentUser() user: { sub: string; email: string },
    @Param('projectId') projectId: string,
  ) {
    return this.logsService.findAllByProject(user.sub, projectId);
  }

  @UseGuards(AuthGuard)
  @Get('endpoint/:endpointId')
  findAllByEndpoint(
    @CurrentUser() user: { sub: string; email: string },
    @Param('endpointId') endpointId: string,
  ) {
    return this.logsService.findAllByEndpoint(user.sub, endpointId);
  }

  @UseGuards(AuthGuard)
  @Delete('project/:projectId')
  clearProjectLogs(
    @CurrentUser() user: { sub: string; email: string },
    @Param('projectId') projectId: string,
  ) {
    return this.logsService.clearProjectLogs(user.sub, projectId);
  }

  @Sse('sse/:projectId')
  subscribeToLogs(
    @Param('projectId') projectId: string,
    @Query('token') token: string,
  ): Observable<MessageEvent> {
    if (!token) {
      throw new ForbiddenException('Missing query parameter token');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Verify project ownership
      this.logsService.verifyProjectOwnership(userId, projectId);
    } catch (err) {
      throw new ForbiddenException('Invalid token or access denied');
    }

    return this.logsEmitter.getObservable().pipe(
      filter((event) => event.projectId === projectId),
      map((event) => ({ data: event.log } as MessageEvent)),
    );
  }
}
