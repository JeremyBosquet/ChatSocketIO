import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UsersService } from '../Users/users.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly usersService: UsersService,
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
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
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
