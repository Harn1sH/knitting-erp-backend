import { Injectable } from '@nestjs/common';
import { CreateYarnInwardDto } from 'src/dto/yarnInwards/create-yarn-inwards.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class YarnInwardsService {
    constructor(private readonly prismaService: PrismaService){}

    async createYarnInward(yarnInwardData: CreateYarnInwardDto) {
        console.log(yarnInwardData.jobCardId);
        
        const jobCard = await this.prismaService.jobCard.findUnique({
            where: { jobNumber: yarnInwardData.jobCardId },
        });

        if (!jobCard) {
            throw new Error('Job Card not found');
        }

         await this.prismaService.yarnInward.create({
            data: {
                jobCardId: jobCard.id,
                supplierId: yarnInwardData.supplierId,
                yarnName: yarnInwardData.yarnName,
                color: yarnInwardData.color,
                bags: yarnInwardData.bags,
                cones: yarnInwardData.cones,
                netWeight: yarnInwardData.netWeight,
                entryDate: yarnInwardData.entryDate,
                weightPerBag: yarnInwardData.weightPerBag,
                remarks: yarnInwardData.remarks,    
            },
        });

        return {status: 201, message: "Saved yarn inward successfully"}
    }
}
