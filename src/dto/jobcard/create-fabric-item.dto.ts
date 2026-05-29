import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFabricItemDto {
  @IsString()
  @IsNotEmpty()
  gsm: string;

  @IsString()
  @IsNotEmpty()
  dia: string;

  @IsString()
  @IsNotEmpty()
  count: string;

  @IsString()
  @IsNotEmpty()
  composition: string;

  @IsString()
  @IsNotEmpty()
  quality: string;

  @IsString()
  @IsNotEmpty()
  mill: string;

  @IsNumber()
  rate: number;

  @IsNumber()
  orderQuantity: number;

  @IsNumber()
  totalYarnNeeded: number;
}
