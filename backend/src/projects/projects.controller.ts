import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string; email: string },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.sub, createProjectDto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string; email: string }) {
    return this.projectsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.projectsService.findOne(user.sub, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.sub, id, updateProjectDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.projectsService.remove(user.sub, id);
  }

  @Post(':id/regenerate-key')
  regenerateApiKey(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.projectsService.regenerateApiKey(user.sub, id);
  }

  @Post('import')
  importProject(
    @CurrentUser() user: { sub: string; email: string },
    @Body() data: any,
  ) {
    return this.projectsService.importProject(user.sub, data);
  }

  @Get(':id/export')
  exportProject(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.projectsService.exportProject(user.sub, id);
  }
}
