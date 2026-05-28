import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorator';
import { CreateUserDto } from 'src/dto/auth/create-user.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log('wporks');
        
        const result = await this.authService.login(body.email, body.password);

        res.cookie('token', result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200)

        // res.redirect('/dashboard')

        return { message: 'Login successful', statusCode: 200 };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req) {
        return {
            user: req.user,
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('register')
    register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('token');

        return { message: 'Logged out' };
    }
}