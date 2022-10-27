import {IsBoolean, IsNotEmpty, IsString, MinLength} from 'class-validator';
import { Expose } from 'class-transformer';

export class SendUserDto {
	@IsNotEmpty()
	@IsString()
	@Expose()
	username: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	trueUsername: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	uuid: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	image: string;

	@IsNotEmpty()
	@Expose()
	id: number;

	// @IsNotEmpty()
	// @IsBoolean()
	// @Expose()
	// isTwoFactorAuthenticationEnabled: boolean;

	// @IsNotEmpty()
	// @IsBoolean()
	// @Expose()
	// isSecondFactorAuthenticated: boolean;

	@IsNotEmpty()
	@IsBoolean()
	@Expose()
	isLoggedIn : boolean;
}

export class FriendsDto {

	@IsNotEmpty()
	@IsString()
	@Expose()
	uuid: string;
}