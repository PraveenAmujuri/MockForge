import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static pool: Pool;
  private static adapter: PrismaPg;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    if (!PrismaService.pool) {
      PrismaService.pool = new Pool({
        connectionString,
      });
      PrismaService.adapter = new PrismaPg(PrismaService.pool);
    }
    super({ adapter: PrismaService.adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    // We don't necessarily end the pool on every disconnect if there are multiple service instances,
    // but in standard NestJS singleton lifecycle, this is safe when shutting down the app.
    await PrismaService.pool.end();
  }
}
