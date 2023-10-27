import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { EliteTypes, Locations, Servers } from '../../schemas/bosses.enum';

export class CreateEliteDtoRequest {
  @IsEnum(EliteTypes)
  @IsNotEmpty()
  eliteName: EliteTypes;

  @IsEnum(Locations)
  @IsNotEmpty()
  location: Locations;

  @IsNumber()
  @IsNotEmpty()
  willResurrect: number;

  @IsNumber()
  @IsOptional()
  cooldown: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @IsOptional()
  cooldownTime: number;

  @IsEnum(Servers)
  @IsNotEmpty()
  server: Servers;
}

export class CreateEliteDtoResponse {
  @IsEnum(EliteTypes)
  @IsNotEmpty()
  eliteName: EliteTypes;

  @IsEnum(Locations)
  @IsNotEmpty()
  location: Locations;

  @IsNumber()
  @IsNotEmpty()
  willResurrect: number;

  @IsNumber()
  @IsOptional()
  cooldown: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @IsOptional()
  cooldownTime: number;

  @IsEnum(Servers)
  @IsNotEmpty()
  server: Servers;

  @IsString()
  @IsNotEmpty()
  _id: string;
}
