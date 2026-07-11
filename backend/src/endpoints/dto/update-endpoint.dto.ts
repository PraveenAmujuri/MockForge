import { IsString, IsIn, IsInt, IsOptional, Min, Max, IsArray } from 'class-validator';

export class UpdateEndpointDto {
  @IsString({ message: 'Endpoint name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Path must be a string' })
  @IsOptional()
  path?: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    message: 'Method must be one of: GET, POST, PUT, PATCH, DELETE',
  })
  @IsOptional()
  method?: string;

  @IsOptional()
  responseJson?: any;

  @IsInt()
  @Min(100)
  @Max(599)
  @IsOptional()
  statusCode?: number;

  @IsInt()
  @Min(0)
  @Max(10000, { message: 'Delay cannot exceed 10000ms' })
  @IsOptional()
  delayMs?: number;

  @IsArray({ message: 'Rules must be an array' })
  @IsOptional()
  rules?: any[];

  @IsOptional()
  headers?: any;

  @IsString()
  @IsOptional()
  responseBodyType?: string;

  @IsString()
  @IsOptional()
  responseBodyText?: string;

  @IsString()
  @IsOptional()
  tags?: string;
}
