import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    
    constructor(private readonly prisma:PrismaService){}
    
    async getDashboard(){
        const totalCount = await this.prisma.jobCard.count()
        const activeJob = await this.prisma.jobCard.findMany({
            where:{
                status:{
                    equals:"IN_PROGRESS"
                }
            }
        })
        const recentJobCard = await this.prisma.jobCard.findMany({
            take:5,
            orderBy:{
                createdAt:"desc"
            }
        })

        return {
            totalCount,
            activeJob: activeJob.length,
            recentJobCard
        }
    }

}
