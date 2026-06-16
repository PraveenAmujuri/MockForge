import { IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name is required' })
  @MaxLength(50, { message: 'Project name cannot exceed 50 characters' })
  name: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
