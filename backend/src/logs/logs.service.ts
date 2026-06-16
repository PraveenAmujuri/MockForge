import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  private async verifyProjectOwnership(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      throw new ForbiddenException('Access denied');
    }
  }

  async findAllByProject(userId: string, projectId: string) {
    await this.verifyProjectOwnership(userId, projectId);

    return this.prisma.requestLog.findMany({
      where: {
        endpoint: {
          projectId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        endpoint: {
          select: {
            name: true,
            path: true,
            method: true,
          },
        },
      },
    });
  }

  async findAllByEndpoint(userId: string, endpointId: string) {
    const endpoint = await this.prisma.mockEndpoint.findUnique({
      where: { id: endpointId },
      include: { project: true },
    });
    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }
    if (endpoint.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.requestLog.findMany({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async clearProjectLogs(userId: string, projectId: string) {
    await this.verifyProjectOwnership(userId, projectId);

    return this.prisma.requestLog.deleteMany({
      where: {
        endpoint: {
          projectId,
        },
      },
    });
  }
}
