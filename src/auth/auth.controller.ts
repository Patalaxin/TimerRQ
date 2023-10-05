import {Body, Controller, HttpCode, HttpException, HttpStatus, Post, Req, Res} from '@nestjs/common';
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/signIn.dto";
import { Response } from "express";
import { Request } from "express";
import {ExceptionHandler} from "@nestjs/core/errors/exception-handler";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Res({ passthrough: true }) res: Response, @Body() signInDto: SignInDto){

            const tokens =  await this.authService.signIn(signInDto.email, signInDto.password)
            res.cookie('refreshToken', tokens.refreshToken,  {
                httpOnly: true,
                secure: true,
                maxAge: 2678400000
                // 2 678 400 000 = 31 day in milliseconds
            })
            return tokens


    }

    @HttpCode(HttpStatus.OK)
    @Post('exchangeRefresh')
    exchangeRefresh(@Req() req: Request, @Body('email') email: string){
            return this.authService.exchangeRefresh(email, req.cookies['refreshToken'])
        
    }
}