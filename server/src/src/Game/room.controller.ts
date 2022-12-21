import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { JwtTwoFactorGuard } from 'src/2auth/jwt-two-factor.guard';
import { RoomService } from './room.service';

@Controller('api/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }
  @Get('getRoomSpectates')
  @UseGuards(JwtTwoFactorGuard)
  async getRoomSpectates(@Res() res) {
    const channels = await this.roomService.getRoomSpectates();
    res.json(channels);
  }

  @Get('getGameOfUser/:uuid')
  @UseGuards(JwtTwoFactorGuard)
  async getGameOfUser(@Res() res, @Param('uuid') uuid) {
    const channels = await this.roomService.getGameOfUser(uuid);
    res.json(channels);
  }

  @Get('checkGame/:uuid')
  @UseGuards(JwtTwoFactorGuard)
  async checkgame(@Res() res, @Param('uuid') uuid) {
    if (isUUID(uuid)) {
      const room = await this.roomService.getRoom(uuid);
      if (room.status == 'playing') {
        res.json(room);
      }
    }
    res.json(undefined);
  }
}
