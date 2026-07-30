import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateFabricItemDto {
  @IsString()
  @IsNotEmpty()
  gsm: string;

  @IsNumber()
  rate: number;

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
  orderQuantity: number;


  @IsNumber()
  @Min(0)
  gg: number;

  @IsNumber()
  @Min(0)
  ll: number;
}
