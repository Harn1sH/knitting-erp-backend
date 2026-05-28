import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dto/auth/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        const payload = {
            sub: user.id,
            role: user.role,
        };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async register(createUserDto: CreateUserDto) {
        const { name, email, password, role } = createUserDto;

        // check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        // do NOT return password
        const { password: _, ...result } = user;

        return result;
    }
}