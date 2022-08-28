import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { AppService } from '../app.service';
import { RoomService } from './room.service';

@Controller('api/room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService
    ) {}
    @Get('getRooms')
    async getRooms(@Res() res) {
        const channels = await this.roomService.getRooms();
        res.json(channels);
    }
    @Post('createRoom')
    async createRoom(@Res() res, @Body() body) {
        const channels = await this.roomService.createRoom(body);
        res.json(channels);
    }
}
