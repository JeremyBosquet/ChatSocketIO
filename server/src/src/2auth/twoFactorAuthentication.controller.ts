import {
  ClassSerializerInterceptor,
  Controller,
  Header,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  Get,
  HttpCode,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
//   import { AuthenticationService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../login/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtTwoFactorGuard } from './jwt-two-factor.guard';

@Controller('api/2fa')
//@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() res: Response, @Req() req: any) {
    const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
    const User = await this.userService.findUserByUuid(Jwt['uuid']);
    if (User) {
      const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(User.uuid, User.trueUsername);
      return this.twoFactorAuthenticationService.pipeQrCodeStream(
        res,
        otpauthUrl,
      );
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      error: 'NOT_FOUND',
    });

    //   res.status(HttpStatus.OK).json({
    // 	statusCode: HttpStatus.OK,
    // 	message : "succes"});
  }

  @Post('turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() req: any,
    @Body() body: string,
    @Res() res: any,
  ) {
    const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
    const User = await this.userService.findUserByUuid(Jwt['uuid']);
    if (User) {
      console.log(body['twoFactorAuthenticationCode']);
      console.log(User.twoFactorAuthenticationSecret);
      if (
        !body['twoFactorAuthenticationCode'] ||
        body['twoFactorAuthenticationCode'].length != 6
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'two auth code should have a length of 6',
          error: 'BAD_REQUEST',
        });
      }
      const isCodeValid =
        this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          body['twoFactorAuthenticationCode'],
          User.twoFactorAuthenticationSecret,
        );
      if (!isCodeValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'two auth code not valid',
          error: 'BAD_REQUEST',
        });
      }
      await this.userService.turnOnTwoFactorAuthentication(User.uuid);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'succes',
      });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      error: 'NOT_FOUND',
    });
  }

  @Post('turn-off')
  @UseGuards(JwtTwoFactorGuard)
  async turnOffTwoFactorAuthentication(
    @Req() req: any,
    @Body() body: string,
    @Res() res: any,
  ) {
    const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
    const User = await this.userService.findUserByUuid(Jwt['uuid']);
    if (User) {
      console.log(body['twoFactorAuthenticationCode']);
      console.log(User.twoFactorAuthenticationSecret);
      if (
        !body['twoFactorAuthenticationCode'] ||
        body['twoFactorAuthenticationCode'].length != 6
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'two auth code should have a length of 6',
          error: 'BAD_REQUEST',
        });
      }
      const isCodeValid =
        this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          body['twoFactorAuthenticationCode'],
          User.twoFactorAuthenticationSecret,
        );
      if (!isCodeValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'two auth code not valid',
          error: 'BAD_REQUEST',
        });
      }
      await this.userService.turnOffTwoFactorAuthentication(User.uuid);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'succes desac',
      });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      error: 'NOT_FOUND',
    });
  }

  @Post('authenticate')
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() req: any, @Body() body: string, @Res() res: any) {
    const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
    const User = await this.userService.findUserByUuid(Jwt['uuid']);
    if (User) {
      if (
        !body['twoFactorAuthenticationCode'] ||
        body['twoFactorAuthenticationCode'].length != 6
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'two auth code should have a length of 6',
          error: 'BAD_REQUEST',
        });
      }
      const isCodeValid =
        this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          body['twoFactorAuthenticationCode'],
          User.twoFactorAuthenticationSecret,
        );
      if (!isCodeValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'two auth code not valid',
          error: 'BAD_REQUEST',
        });
      }

      // const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(User.id, true);

      // req.res.setHeader('Set-Cookie', [accessTokenCookie]);
      await this.userService.IsAuthenticated(User.uuid);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'succes',
      });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      error: 'NOT_FOUND',
    });
  }
}
