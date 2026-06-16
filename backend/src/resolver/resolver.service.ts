import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';

@Injectable()
export class ResolverService {
  constructor(private prisma: PrismaService) {}

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

  async resolve(projectSlug: string, req: Request, res: Response) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (!project) {
      return res.status(404).json({ error: `Project with slug '${projectSlug}' not found` });
    }

    if (!project.isPublic) {
      const apiKeyHeader = req.headers['x-api-key'];
      if (!apiKeyHeader || apiKeyHeader !== project.apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key in X-API-Key header' });
      }
    }

    const prefix = `/mock/${projectSlug}`;
    const subPath = req.path.substring(prefix.length) || '/';
    const targetPath = this.normalizePath(subPath);
    const targetMethod = req.method.toUpperCase();

    const endpoint = await this.prisma.mockEndpoint.findFirst({
      where: {
        projectId: project.id,
        path: targetPath,
        method: targetMethod,
      },
    });

    if (!endpoint) {
      return res.status(404).json({
        error: `Mock endpoint not found for method ${targetMethod} and path '${targetPath}'`,
      });
    }

    try {
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ipAddress = rawIp.includes(',') ? rawIp.split(',')[0].trim() : rawIp;
      
      let requestBody = req.body;
      if (typeof requestBody === 'string') {
        try {
          requestBody = JSON.parse(requestBody);
        } catch {
          // Keep as string if parsing fails
        }
      }

      await this.prisma.requestLog.create({
        data: {
          endpointId: endpoint.id,
          method: targetMethod,
          headers: req.headers as any,
          body: requestBody ?? null,
          ipAddress,
        },
      });
    } catch (logError) {
      console.error('Failed to log request:', logError);
    }

    if (endpoint.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, endpoint.delayMs));
    }

    return res.status(endpoint.statusCode).json(endpoint.responseJson);
  }
}
