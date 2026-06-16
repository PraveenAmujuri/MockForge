import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private generateApiKey(): string {
    const randomHex = crypto.randomBytes(16).toString('hex');
    return `mf_live_${randomHex}`;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async getUniqueSlug(name: string): Promise<string> {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.project.findUnique({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(userId: string, dto: CreateProjectDto) {
    const slug = await this.getUniqueSlug(dto.name);
    const apiKey = this.generateApiKey();

    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        slug,
        apiKey,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { endpoints: true },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        endpoints: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const data: any = { ...dto };
    if (dto.name && dto.name !== project.name) {
      data.slug = await this.getUniqueSlug(dto.name);
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async regenerateApiKey(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const newApiKey = this.generateApiKey();
    return this.prisma.project.update({
      where: { id },
      data: { apiKey: newApiKey },
      select: { apiKey: true },
    });
  }
}
