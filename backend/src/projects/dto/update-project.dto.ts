import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsString({ message: 'Project name must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Project name cannot exceed 50 characters' })
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
