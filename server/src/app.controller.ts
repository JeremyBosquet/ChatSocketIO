import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Get('/api/chat/messages')
  async getMessages(@Res() res) {
    const messages = await this.appService.getMessages();
    res.json(messages);
  }

  @Get('/api/chat/messages/:room')
  async getMessagesFromRoom(@Res() res, @Param() params) {
    console.log(params.room);
    const messages = await this.appService.getMessageFromRoom(params.room);
    res.json(messages);
  }
}
