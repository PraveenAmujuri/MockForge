import { IsNotEmpty, IsString, IsIn, IsInt, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateEndpointDto {
  @IsString({ message: 'Project ID must be a string' })
  @IsNotEmpty({ message: 'Project ID is required' })
  projectId: string;

  @IsString({ message: 'Endpoint name must be a string' })
  @IsNotEmpty({ message: 'Endpoint name is required' })
  name: string;

  @IsString({ message: 'Path must be a string' })
  @IsNotEmpty({ message: 'Path is required' })
  path: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    message: 'Method must be one of: GET, POST, PUT, PATCH, DELETE',
  })
  method: string;

  @IsNotEmpty({ message: 'Response JSON is required' })
  responseJson: any;

  @IsInt()
  @Min(100)
  @Max(599)
  @IsOptional()
  statusCode?: number;

  @IsInt()
  @Min(0)
  @Max(10000, { message: 'Delay cannot exceed 10000ms (10 seconds)' })
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
