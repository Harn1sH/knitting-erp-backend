import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    
    constructor(private readonly prisma:PrismaService){}
    
    async getDashboard(){
        const totalCount = await this.prisma.jobCard.count();
        
        const activeJobCount = await this.prisma.jobCard.count({
            where: {
                status: {
                    equals: "IN_PROGRESS"
                }
            }
        });
        
        const recentJobCard = await this.prisma.jobCard.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc"
            },
            include: {
                fabricItems: true
            }
        });

        const formattedRecentJobCards = recentJobCard.map(job => ({
            ...job,
            gsm: job.fabricItems.map(f => f.gsm).filter(Boolean).join(', '),
            orderQuantity: job.fabricItems.reduce((acc, f) => acc + (f.orderQuantity || 0), 0),
            machine: job.machine && job.brand ? `${job.machine} (${job.brand})` : (job.machine || job.brand || ''),
        }));

        return {
            totalCount,
            activeJob: activeJobCount,
            recentJobCard: formattedRecentJobCards
        }
    }

}
