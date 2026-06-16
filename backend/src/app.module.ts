import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { EndpointsModule } from './endpoints/endpoints.module';
import { LogsModule } from './logs/logs.module';
import { ResolverModule } from './resolver/resolver.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    EndpointsModule,
    LogsModule,
    ResolverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
