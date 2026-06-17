import { Module } from '@nestjs/common';
import { ResolverService } from './resolver.service';
import { ResolverController } from './resolver.controller';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [LogsModule],
  controllers: [ResolverController],
  providers: [ResolverService],
  exports: [ResolverService],
})
export class ResolverModule {}
