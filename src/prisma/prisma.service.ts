import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL is missing');
        }

        const pool = new Pool({ 
            connectionString, 
            max: 15,
            idleTimeoutMillis: 600000, // keep alive for 10 minutes
            connectionTimeoutMillis: 20000 // 20s timeout
        });
        const adapter = new PrismaPg(pool as any); // using any in case of type mismatch

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}