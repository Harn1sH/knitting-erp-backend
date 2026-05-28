import { Body, Controller, Get, Post, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { MasterService } from './master.service';
import { CreateMasterDto } from 'src/dto/master/create-master.dto';
import { UpdateMasterDto } from 'src/dto/master/update-master.dto';
import { CreateMasterEntryDto } from 'src/dto/master/create-master-entry.dto';
import { UpdateMasterEntryDto } from 'src/dto/master/update-master-entry.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('master')
export class MasterController {

    constructor(private readonly masterService: MasterService){}

    // ── Supplier Masters ──────────────────────────────────────

    @Post("create-master")
    createMaster(@Body() body: CreateMasterDto){
        return this.masterService.createMaster(body)
    }

    @Get("get-all-masters")
    getAllMasters(){
        return this.masterService.getAllMasters()
    }

    @Patch("update-master/:id")
    updateMaster(@Param('id') id: string, @Body() body: UpdateMasterDto){
        return this.masterService.updateMaster(id, body)
    }

    // ── Generic Master Entries ──────────────────────────────────

    @Post("create-master-entry")
    createMasterEntry(@Body() body: CreateMasterEntryDto){
        return this.masterService.createMasterEntry(body)
    }

    @Get("get-master-entries")
    getMasterEntries(@Query('category') category: string){
        return this.masterService.getMasterEntries(category)
    }

    @Patch("update-master-entry/:id")
    updateMasterEntry(@Param('id') id: string, @Body() body: UpdateMasterEntryDto){
        return this.masterService.updateMasterEntry(id, body)
    }
}
