import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { EndpointsService } from './endpoints.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string; email: string },
    @Body() createEndpointDto: CreateEndpointDto,
  ) {
    return this.endpointsService.create(user.sub, createEndpointDto);
  }

  @Get('project/:projectId')
  findAllByProject(
    @CurrentUser() user: { sub: string; email: string },
    @Param('projectId') projectId: string,
  ) {
    return this.endpointsService.findAllByProject(user.sub, projectId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.endpointsService.findOne(user.sub, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
    @Body() updateEndpointDto: UpdateEndpointDto,
  ) {
    return this.endpointsService.update(user.sub, id, updateEndpointDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.endpointsService.remove(user.sub, id);
  }

  @Post(':id/duplicate')
  duplicate(
    @CurrentUser() user: { sub: string; email: string },
    @Param('id') id: string,
  ) {
    return this.endpointsService.duplicate(user.sub, id);
  }
}
