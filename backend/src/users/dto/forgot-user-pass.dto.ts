import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ForgotUserPassDtoRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgotUserPassDtoResponse {
  @ApiProperty({
    example: 'Password successfully changed',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: 200,
  })
  @IsNumber()
  status: number;
}