import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/login.module';
import { UserModel } from './typeorm/user.entity';
import entities from './typeorm';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path/posix';
import { string } from 'joi';
import { UsersService } from './users/users.service';
import { AppService } from './app.service';


@Module({
  imports: [
	ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		useFactory: (configService: ConfigService) => ({
			type: 'postgres',
			host: configService.get('DB_HOST'),
			port: +configService.get<number>('DB_PORT'),
			username: configService.get('DB_USER'),
			password: configService.get('DB_PASS'),
			database: configService.get('DB_NAME'),
			entities: entities,
			synchronize: true,
			
		}),
		inject: [ConfigService],
	}),
	TypeOrmModule.forFeature([UserModel]),
	JwtModule.registerAsync({
		imports: [ConfigModule],
		useFactory: async (configService: ConfigService) => ({
			secret: configService.get('JWT_SECRET'),
			signOptions: { expiresIn: '1d' },
		}),
		inject: [ConfigService],
	}),
	LoginModule,
	UsersModule,
	HttpModule,
	UsersModule,
  ],
  controllers: [AppController],
  providers: [UsersService, AppService],
})

export class AppModule {}
