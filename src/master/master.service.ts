import { Injectable } from '@nestjs/common';
import { CreateMasterDto } from 'src/dto/master/create-master.dto';
import { UpdateMasterDto } from 'src/dto/master/update-master.dto';
import { CreateMasterEntryDto } from 'src/dto/master/create-master-entry.dto';
import { UpdateMasterEntryDto } from 'src/dto/master/update-master-entry.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MasterService {
    constructor(private readonly prismaService: PrismaService) { }

    // ── Supplier Masters ──────────────────────────────────────

    async createMaster(body: CreateMasterDto) {
        await this.prismaService.supplier.create({
            data: {
                name: body.name,
                email: body.email,
                phoneNumber: body.phoneNumber,
                altPhoneNumber: body.altPhoneNumber,

                address: body.address,
                city: body.city,
                state: body.state,
                pincode: body.pincode,

                gstNumber: body.gstNumber,
                panNumber: body.panNumber,
                bankName: body.bankName,
                accountNumber: body.accountNumber,
                ifscCode: body.ifscCode,

                remarks: body.remarks,
            }
        });
        return { message: "Created master successfully" };
    }

    async getAllMasters(){
        const masters = await this.prismaService.supplier.findMany();

        return {status: 200, data: masters}
    }

    async updateMaster(id: string, body: UpdateMasterDto) {
        await this.prismaService.supplier.update({
            where: { id },
            data: {
                name: body.name,
                email: body.email,
                phoneNumber: body.phoneNumber,
                altPhoneNumber: body.altPhoneNumber,
                address: body.address,
                city: body.city,
                state: body.state,
                pincode: body.pincode,
                gstNumber: body.gstNumber,
                panNumber: body.panNumber,
                bankName: body.bankName,
                accountNumber: body.accountNumber,
                ifscCode: body.ifscCode,
                remarks: body.remarks,
            }
        });
        return { message: "Updated master successfully" };
    }

    // ── Generic Master Entries (Yarn Count, Yarn Quality, DIA, etc.) ──

    async createMasterEntry(body: CreateMasterEntryDto) {
        await this.prismaService.masterEntry.create({
            data: {
                category: body.category,
                name: body.name,
                description: body.description,
            }
        });
        return { message: "Created master entry successfully" };
    }

    async getMasterEntries(category: string) {
        const entries = await this.prismaService.masterEntry.findMany({
            where: { category },
            orderBy: { name: 'asc' },
        });
        return { status: 200, data: entries };
    }

    async updateMasterEntry(id: string, body: UpdateMasterEntryDto) {
        await this.prismaService.masterEntry.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
            }
        });
        return { message: "Updated master entry successfully" };
    }
}
