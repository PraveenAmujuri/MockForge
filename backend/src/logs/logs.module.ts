import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LogsEmitterService } from './logs-emitter.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LogsController],
  providers: [LogsService, LogsEmitterService],
  exports: [LogsService, LogsEmitterService],
})
export class LogsModule {}
