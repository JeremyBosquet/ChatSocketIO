import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { Profile } from 'passport';
import { UserModel } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    usertwoauthsecret: string,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: usertwoauthsecret,
    });
  }

  public async generateTwoFactorAuthenticationSecret(
    userUuid: string,
    trueUsername: string,
  ) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      trueUsername,
      this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(secret, userUuid);

    return {
      secret,
      otpauthUrl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }
}
