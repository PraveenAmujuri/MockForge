import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';

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

  private getNestedProperty(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    // Normalize brackets: e.g. "items[0].id" -> "items.0.id"
    const cleanPath = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
    const parts = cleanPath.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private getFakerValue(path: string): any {
    switch (path.toLowerCase()) {
      case 'name':
      case 'person.fullname':
      case 'name.findname':
        return faker.person.fullName();
      case 'email':
      case 'internet.email':
        return faker.internet.email();
      case 'uuid':
      case 'string.uuid':
      case 'datatype.uuid':
        return faker.string.uuid();
      case 'phone':
      case 'phone.number':
      case 'phone.phonenumber':
        return faker.phone.number();
      case 'avatar':
      case 'image.avatar':
      case 'internet.avatar':
        return faker.image.avatar();
      case 'company':
      case 'company.name':
      case 'company.companyname':
        return faker.company.name();
      case 'lorem':
      case 'lorem.sentence':
        return faker.lorem.sentence();
      case 'lorem.paragraph':
        return faker.lorem.paragraph();
      case 'number':
      case 'number.int':
      case 'datatype.number':
        return faker.number.int();
      case 'boolean':
      case 'datatype.boolean':
        return faker.datatype.boolean();
      case 'date':
      case 'date.recent':
        return faker.date.recent().toISOString();
      default:
        try {
          const parts = path.split('.');
          let current: any = faker;
          for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }
          if (typeof current === 'function') {
            return current();
          }
          if (current !== undefined) {
            return current;
          }
        } catch {
          // Fallback
        }
        return `{{faker.${path}}}`;
    }
  }

  private parseFakerTokens(jsonStr: string): string {
    // 1. First, replace string placeholders matching with surrounding quotes e.g. "{{faker.person.fullName}}"
    let processed = jsonStr.replace(/"\{\{\s*faker\.([a-zA-Z0-9_\.]+)\s*\}\}"/g, (match, path) => {
      const value = this.getFakerValue(path);
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value); // Strip quotes for primitives
      }
      return JSON.stringify(value); // Stringify for string variables
    });

    // 2. Fallback to replace placeholders without quotes e.g. {{faker.number.int}}
    processed = processed.replace(/\{\{\s*faker\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, path) => {
      return String(this.getFakerValue(path));
    });

    return processed;
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

    let requestBody = req.body;
    try {
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ipAddress = rawIp.includes(',') ? rawIp.split(',')[0].trim() : rawIp;
      
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

    // Rules evaluation
    const rules = Array.isArray(endpoint.rules)
      ? endpoint.rules
      : typeof endpoint.rules === 'string'
      ? JSON.parse(endpoint.rules)
      : [];

    let matchedRule: any = null;

    for (const rule of rules) {
      if (!rule || typeof rule !== 'object') continue;
      const { target, parameter, operator, value } = rule;
      if (!target || !parameter || !operator) continue;

      let actualValue: any;
      if (target === 'query') {
        actualValue = this.getNestedProperty(req.query, parameter);
      } else if (target === 'header') {
        actualValue = req.headers[parameter.toLowerCase()];
      } else if (target === 'body') {
        actualValue = this.getNestedProperty(requestBody, parameter);
      }

      let isMatch = false;

      switch (operator.toUpperCase()) {
        case 'EQUALS':
          isMatch = actualValue !== undefined && actualValue !== null && String(actualValue) === String(value);
          break;
        case 'CONTAINS':
          isMatch = actualValue !== undefined && actualValue !== null && String(actualValue).includes(String(value));
          break;
        case 'EXISTS':
          isMatch = actualValue !== undefined && actualValue !== null;
          break;
        case 'NOT_EQUALS':
          isMatch = actualValue === undefined || actualValue === null || String(actualValue) !== String(value);
          break;
        case 'REGEX':
          if (actualValue !== undefined && actualValue !== null) {
            try {
              const regex = new RegExp(value);
              isMatch = regex.test(String(actualValue));
            } catch (err) {
              console.error(`Invalid regex rule: ${value}`, err);
            }
          }
          break;
        default:
          break;
      }

      if (isMatch) {
        matchedRule = rule;
        break;
      }
    }

    let finalStatusCode = endpoint.statusCode;
    let finalResponseJson = endpoint.responseJson;
    let finalDelayMs = endpoint.delayMs;

    if (matchedRule) {
      finalStatusCode = matchedRule.statusCode ?? 200;
      finalResponseJson = matchedRule.responseJson ?? {};
      if (matchedRule.delayMs !== undefined && matchedRule.delayMs !== null) {
        finalDelayMs = Number(matchedRule.delayMs);
      }
    }

    if (finalDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, finalDelayMs));
    }

    let processedJson = finalResponseJson;
    try {
      const jsonStr = JSON.stringify(finalResponseJson);
      const parsedStr = this.parseFakerTokens(jsonStr);
      processedJson = JSON.parse(parsedStr);
    } catch (err) {
      console.error('Failed to parse faker tokens in mock response:', err);
    }

    return res.status(finalStatusCode).json(processedJson);
  }
}
