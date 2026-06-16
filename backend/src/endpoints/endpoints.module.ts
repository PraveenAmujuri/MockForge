import { Module } from '@nestjs/common';
import { EndpointsService } from './endpoints.service';
import { EndpointsController } from './endpoints.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EndpointsController],
  providers: [EndpointsService],
  exports: [EndpointsService],
})
export class EndpointsModule {}
