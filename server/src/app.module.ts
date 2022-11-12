import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './Chat/chat.module';
import { Channel } from './Chat/Entities/channel.entity';
import { User } from './Chat/Entities/user.entity';
import { DM } from './Chat/Entities/dm.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: 'jeremy',
      password: 'jeremy',
      database: 'chat',
      entities: [Channel, User, DM],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Channel, User, DM]),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
