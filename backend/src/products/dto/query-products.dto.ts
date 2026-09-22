import { IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
