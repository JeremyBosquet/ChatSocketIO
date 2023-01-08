import {  Controller, Get, HttpStatus, Param, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { JwtTwoFactorGuard } from 'src/TwoFactorAuth/guards/jwt-two-factor.guard';
import { uuidDto } from './Entities/dto';
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
  async getGameOfUser(@Res() res, @Param(ValidationPipe) param: uuidDto) {
    const channels = await this.roomService.getGameOfUser(param.uuid);
    res.json(channels);
  }

  @Get('checkGame/:uuid')
  @UseGuards(JwtTwoFactorGuard)
  async checkgame(@Res() res, @Param(ValidationPipe) param: uuidDto) {
    const room = await this.roomService.getRoom(param.uuid);
    if (room && room?.status === 'playing') {
      return res.status(HttpStatus.OK).json(room);
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
			error: 'NOT_FOUND',
			message: 'Game not found',
    });
  }
}
