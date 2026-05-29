import { Injectable } from '@nestjs/common';
import { CreateMasterDto } from 'src/dto/master/create-master.dto';
import { UpdateMasterDto } from 'src/dto/master/update-master.dto';
import { CreateMasterEntryDto } from 'src/dto/master/create-master-entry.dto';
import { UpdateMasterEntryDto } from 'src/dto/master/update-master-entry.dto';
import { CreateClientDto } from 'src/dto/master/create-client.dto';
import { UpdateClientDto } from 'src/dto/master/update-client.dto';
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

    // ── Client Masters ────────────────────────────────────────

    async createClient(body: CreateClientDto) {
        await this.prismaService.client.create({
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
        return { message: "Created client successfully" };
    }

    async getClients() {
        const clients = await this.prismaService.client.findMany();
        return { status: 200, data: clients };
    }

    async getClient(id: string) {
        const client = await this.prismaService.client.findUnique({
            where: { id }
        });
        return { status: 200, data: client };
    }

    async updateClient(id: string, body: UpdateClientDto) {
        await this.prismaService.client.update({
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
        return { message: "Updated client successfully" };
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
