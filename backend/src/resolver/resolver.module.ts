import { Module } from '@nestjs/common';
import { ResolverService } from './resolver.service';
import { ResolverController } from './resolver.controller';

@Module({
  controllers: [ResolverController],
  providers: [ResolverService],
  exports: [ResolverService],
})
export class ResolverModule {}
