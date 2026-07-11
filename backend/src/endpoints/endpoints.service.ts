import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(private prisma: PrismaService) {}

  private async verifyProjectOwnership(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      throw new ForbiddenException('You do not have permission for this project');
    }
    return project;
  }

  private normalizePath(path: string): string {
    let normalized = path.trim();
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    if (normalized.endsWith('/') && normalized.length > 1) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  async create(userId: string, dto: CreateEndpointDto) {
    await this.verifyProjectOwnership(userId, dto.projectId);
    const path = this.normalizePath(dto.path);

    const existing = await this.prisma.mockEndpoint.findFirst({
      where: {
        projectId: dto.projectId,
        path,
        method: dto.method,
      },
    });
    if (existing) {
      throw new BadRequestException(`An endpoint with method ${dto.method} and path ${path} already exists.`);
    }

    return this.prisma.mockEndpoint.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        path,
        method: dto.method,
        responseJson: dto.responseJson ?? {},
        statusCode: dto.statusCode ?? 200,
        delayMs: dto.delayMs ?? 0,
        rules: dto.rules ?? [],
        headers: dto.headers ?? [],
        responseBodyType: dto.responseBodyType ?? 'JSON',
        responseBodyText: dto.responseBodyText ?? '',
        tags: dto.tags ?? '',
      },
    });
  }

  async findAllByProject(userId: string, projectId: string) {
    await this.verifyProjectOwnership(userId, projectId);
    return this.prisma.mockEndpoint.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const endpoint = await this.prisma.mockEndpoint.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }
    if (endpoint.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return endpoint;
  }

  async update(userId: string, id: string, dto: UpdateEndpointDto) {
    const endpoint = await this.prisma.mockEndpoint.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }
    if (endpoint.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const data: any = { ...dto };
    if (dto.path) {
      data.path = this.normalizePath(dto.path);
      const newMethod = dto.method || endpoint.method;
      if (data.path !== endpoint.path || newMethod !== endpoint.method) {
        const conflict = await this.prisma.mockEndpoint.findFirst({
          where: {
            projectId: endpoint.projectId,
            path: data.path,
            method: newMethod,
            id: { not: id },
          },
        });
        if (conflict) {
          throw new BadRequestException(`An endpoint with method ${newMethod} and path ${data.path} already exists.`);
        }
      }
    }

    return this.prisma.mockEndpoint.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    const endpoint = await this.prisma.mockEndpoint.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }
    if (endpoint.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.mockEndpoint.delete({
      where: { id },
    });
  }

  async duplicate(userId: string, id: string) {
    const endpoint = await this.prisma.mockEndpoint.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }
    if (endpoint.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    let count = 1;
    let newPath = `${endpoint.path}-copy`;
    let newName = `Copy of ${endpoint.name}`;

    while (true) {
      const conflict = await this.prisma.mockEndpoint.findFirst({
        where: {
          projectId: endpoint.projectId,
          path: newPath,
          method: endpoint.method,
        },
      });
      if (!conflict) {
        break;
      }
      newPath = `${endpoint.path}-copy-${count}`;
      newName = `Copy of ${endpoint.name} (${count})`;
      count++;
    }

    return this.prisma.mockEndpoint.create({
      data: {
        projectId: endpoint.projectId,
        name: newName,
        path: newPath,
        method: endpoint.method,
        responseJson: endpoint.responseJson ?? {},
        statusCode: endpoint.statusCode,
        delayMs: endpoint.delayMs,
        rules: endpoint.rules ?? [],
        headers: endpoint.headers ?? [],
        responseBodyType: endpoint.responseBodyType ?? 'JSON',
        responseBodyText: endpoint.responseBodyText ?? '',
        tags: endpoint.tags ?? '',
      },
    });
  }
}
