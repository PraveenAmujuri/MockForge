import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { LogsEmitterService } from '../logs/logs-emitter.service';

@Injectable()
export class ResolverService {
  constructor(
    private prisma: PrismaService,
    private logsEmitter: LogsEmitterService,
  ) {}

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

  private matchDynamicPath(endpointPath: string, requestPath: string): Record<string, string> | null {
    const epParts = this.normalizePath(endpointPath).split('/').filter(Boolean);
    const reqParts = this.normalizePath(requestPath).split('/').filter(Boolean);

    if (epParts.length !== reqParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < epParts.length; i++) {
      const epPart = epParts[i];
      const reqPart = reqParts[i];

      if (epPart.startsWith(':')) {
        const paramName = epPart.substring(1);
        params[paramName] = reqPart;
      } else if (epPart.startsWith('{') && epPart.endsWith('}')) {
        const paramName = epPart.substring(1, epPart.length - 1);
        params[paramName] = reqPart;
      } else if (epPart.toLowerCase() !== reqPart.toLowerCase()) {
        return null;
      }
    }

    return params;
  }

  private interpolateResponse(
    contentStr: string,
    project: any,
    req: Request,
    pathParams: Record<string, string>,
  ): string {
    let processed = contentStr;

    // 1. Interpolate request variables
    // {{request.body.*}}
    processed = processed.replace(/\{\{\s*request\.body\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, path) => {
      const val = this.getNestedProperty(req.body, path);
      return val !== undefined && val !== null ? String(val) : '';
    });

    // {{request.query.*}}
    processed = processed.replace(/\{\{\s*request\.query\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, path) => {
      const val = this.getNestedProperty(req.query, path);
      return val !== undefined && val !== null ? String(val) : '';
    });

    // {{request.headers.*}}
    processed = processed.replace(/\{\{\s*request\.headers\.([a-zA-Z0-9_\.-]+)\s*\}\}/g, (match, name) => {
      const val = req.headers[name.toLowerCase()];
      return val !== undefined && val !== null ? String(val) : '';
    });

    // {{request.params.*}}
    processed = processed.replace(/\{\{\s*request\.params\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, name) => {
      const val = pathParams[name];
      return val !== undefined && val !== null ? String(val) : '';
    });

    // 2. Interpolate project environment variables: {{project.VAR_NAME}}
    processed = processed.replace(/\{\{\s*project\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, key) => {
      const variables = Array.isArray(project.variables) ? project.variables : [];
      const variable = variables.find((v: any) => v && v.key === key);
      return variable ? String(variable.value) : '';
    });

    // 3. Helper tokens
    // {{uuid}}
    processed = processed.replace(/\{\{\s*uuid\s*\}\}/g, () => {
      try {
        const { randomUUID } = require('crypto');
        return randomUUID();
      } catch (err) {
        return Math.random().toString(36).substring(2, 15);
      }
    });

    // {{timestamp}} and {{now}}
    processed = processed.replace(/\{\{\s*(timestamp|now)\s*\}\}/g, () => {
      return String(Math.floor(Date.now() / 1000));
    });

    // {{randomInt(min,max)}}
    processed = processed.replace(/\{\{\s*randomInt\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\}\}/g, (match, minStr, maxStr) => {
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      return String(Math.floor(Math.random() * (max - min + 1)) + min);
    });

    // 4. Faker tokens
    processed = processed.replace(/"\{\{\s*faker\.([a-zA-Z0-9_\.]+)\s*\}\}"/g, (match, path) => {
      const value = this.getFakerValue(path);
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      return JSON.stringify(value);
    });

    processed = processed.replace(/\{\{\s*faker\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, path) => {
      return String(this.getFakerValue(path));
    });

    return processed;
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

    // Apply CORS Config
    const cors = project.corsConfig as any;
    if (cors && cors.enabled) {
      res.setHeader('Access-Control-Allow-Origin', cors.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', cors.methods || 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', cors.headers || '*');
      if (cors.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
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

    let endpoint = await this.prisma.mockEndpoint.findFirst({
      where: {
        projectId: project.id,
        path: targetPath,
        method: targetMethod,
      },
    });

    let pathParams: Record<string, string> = {};

    if (!endpoint) {
      const allEndpoints = await this.prisma.mockEndpoint.findMany({
        where: {
          projectId: project.id,
          method: targetMethod,
        },
      });

      for (const ep of allEndpoints) {
        const params = this.matchDynamicPath(ep.path, targetPath);
        if (params) {
          endpoint = ep;
          pathParams = params;
          break;
        }
      }
    }

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

      const requestLog = await this.prisma.requestLog.create({
        data: {
          endpointId: endpoint.id,
          method: targetMethod,
          headers: req.headers as any,
          body: requestBody ?? null,
          ipAddress,
        },
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

      this.logsEmitter.emit(project.id, requestLog);
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
    let finalHeaders = Array.isArray(endpoint.headers) ? (endpoint.headers as any[]) : [];
    let finalBodyType = endpoint.responseBodyType || 'JSON';
    let finalBodyText = endpoint.responseBodyText || '';

    if (matchedRule) {
      finalStatusCode = matchedRule.statusCode ?? 200;
      finalResponseJson = matchedRule.responseJson ?? {};
      if (matchedRule.delayMs !== undefined && matchedRule.delayMs !== null) {
        finalDelayMs = Number(matchedRule.delayMs);
      }
      if (Array.isArray(matchedRule.headers)) {
        finalHeaders = matchedRule.headers as any[];
      }
      if (matchedRule.responseBodyType) {
        finalBodyType = matchedRule.responseBodyType;
      }
      if (matchedRule.responseBodyText) {
        finalBodyText = matchedRule.responseBodyText;
      }
    }

    if (finalDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, finalDelayMs));
    }

    // Set custom headers
    for (const h of finalHeaders) {
      if (h && typeof h === 'object' && h.key && h.value) {
        res.setHeader(h.key, h.value);
      }
    }

    if (finalBodyType === 'JSON') {
      let processedJson = finalResponseJson;
      try {
        const jsonStr = JSON.stringify(finalResponseJson);
        const parsedStr = this.interpolateResponse(jsonStr, project, req, pathParams);
        processedJson = JSON.parse(parsedStr);
      } catch (err) {
        console.error('Failed to parse tokens in mock response:', err);
      }
      return res.status(finalStatusCode).json(processedJson);
    } else {
      let processedText = finalBodyText;
      try {
        processedText = this.interpolateResponse(finalBodyText, project, req, pathParams);
      } catch (err) {
        console.error('Failed to parse tokens in raw text response:', err);
      }

      // Set content-type header if not already set
      if (!res.getHeader('Content-Type')) {
        if (finalBodyType === 'XML') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        } else if (finalBodyType === 'HTML') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
      }

      return res.status(finalStatusCode).send(processedText);
    }
  }
}
