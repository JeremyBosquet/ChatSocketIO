import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { AppService } from '../app.service';
import { RoomService } from './room.service';

@Controller('api/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Get('getRoomSpectates')
  async getRoomSpectates(@Res() res) {
    const channels = await this.roomService.getRoomSpectates();
    res.json(channels);
  }
  @Post('createRoom')
  async createRoom(@Res() res, @Body() body) {
    const channels = await this.roomService.createRoom(body);
    res.json(channels);
  }
  @Get('getGameOfUser/:uuid')
  async getGameOfUser(@Res() res, @Param('uuid') uuid) {
    const channels = await this.roomService.getGameOfUser(uuid);
    res.json(channels);
  }
  @Get('checkGame/:uuid')
  async checkgame(@Res() res, @Param('uuid') uuid) {
    if (isUUID(uuid)) {
      const room = await this.roomService.getRoom(uuid);
      if (room.status == 'playing') {
        res.json(room);
      }
  }
  res.json(undefined);
}
//@Get('getRooms')
//async getRooms(@Res() res) {
//  const channels = await this.roomService.getRooms();
//  res.json(channels);
//}
}
