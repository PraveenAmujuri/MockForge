import { Controller, All, Req, Res, Param } from '@nestjs/common';
import { ResolverService } from './resolver.service';
import * as express from 'express';

@Controller('mock')
export class ResolverController {
  constructor(private readonly resolverService: ResolverService) {}

  @All(':projectSlug/*')
  async resolveWildcard(
    @Param('projectSlug') projectSlug: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.resolverService.resolve(projectSlug, req, res);
  }

  @All(':projectSlug')
  async resolveRoot(
    @Param('projectSlug') projectSlug: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return this.resolverService.resolve(projectSlug, req, res);
  }
}
