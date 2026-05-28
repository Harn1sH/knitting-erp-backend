import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: (req: Request) => {
                return req?.cookies?.token;
            },
            secretOrKey: process.env.JWT_SECRET || 'secret',
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            role: payload.role,
        };
    }
}