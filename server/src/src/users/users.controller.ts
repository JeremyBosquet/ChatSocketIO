import {
	Body,
	Res,
	Req,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
	HttpStatus,
	Query,
	UseInterceptors,
	UploadedFile,
	UnsupportedMediaTypeException,
	MaxFileSizeValidator,
	ParseFilePipe,
	FileTypeValidator,
	ParseFilePipeBuilder,
	BadRequestException,
} from '@nestjs/common';
import { ExpDto, FriendsDto, SearchDto, SendUserDto, TokenDto } from './users.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/login/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { JwtTwoFactorGuard } from 'src/2auth/jwt-two-factor.guard';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { fileTypeFromFile } from 'file-type';
import got from 'got';
import { fileTypeFromStream } from 'file-type';
// import { Express } from 'express';
import axios from 'axios';
import { JwtTwoFactorStrategy } from 'src/2auth/auth.strategy';

@Controller('api/user')
export class UsersController {
	constructor(
		private readonly userService: UsersService,
		private jwtService: JwtService,
	) { }

	@Get()
	@UseGuards(JwtTwoFactorGuard)
	async getUser(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				User: plainToClass(SendUserDto, User, {
					excludeExtraneousValues: true,
				}),
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('getProfilePicture/:uuid')
	async getProfilePicture(@Param() param: any, @Res() res: any) {
		const User = await this.userService.findUserByUuid(param?.uuid);
		if (User) {
			if (User.image) {
				res.setHeader('Content-Type', 'image/webp');
				console.log(process.env.BACK + User.image);
				const response = await axios.get(process.env.BACK + User.image, {
					responseType: 'arraybuffer',
				});
				return res.status(HttpStatus.OK).send(response.data);
			}
			return res.status(HttpStatus.NO_CONTENT).json({
				statusCode: HttpStatus.NO_CONTENT,
				message: 'No profile picture',
				error: 'NO_CONTENT',
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}
	@Get('getExp/:uuid')
	@UseGuards(JwtTwoFactorGuard)
	async getExp(@Req() req: any, @Res() res: any, @Param(ValidationPipe) param: FriendsDto,) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const exp = await this.userService.getExp(param.uuid);
			if (exp !== undefined)
				return res.status(HttpStatus.OK).json({
					statusCode: HttpStatus.OK,
					message: 'succes',
					Exp: exp,
				});
			return res.status(HttpStatus.NO_CONTENT).json({
				statusCode: HttpStatus.NO_CONTENT,
				message: 'Uuid invalid',
				error: 'NO_CONTENT',
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('getLoggedInfo')
	@UseGuards(JwtAuthGuard)
	async getLoggedInfo(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				isTwoFactorAuthenticationEnabled: User.isTwoFactorAuthenticationEnabled,
				isSecondFactorAuthenticated: User.isSecondFactorAuthenticated,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('CompareToken')
	@UseGuards(JwtTwoFactorGuard)
	async CompareToken(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			for (let i = 0; i < User.isLoggedIn.length; i++) {
				if (await bcrypt.compare(req.headers.authorization.split(' ')[1], User.isLoggedIn[i].token)) {
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message: 'succes'
					});
				}
			}
			return res.status(HttpStatus.FORBIDDEN).json({
				statusCode: HttpStatus.FORBIDDEN,
				message: 'Token invalid',
				error: 'FORBIDDEN',
			});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('CompareTokenTwoAuth')
	@UseGuards(JwtAuthGuard)
	async CompareTokenTwoAuth(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			for (let i = 0; i < User.isLoggedIn.length; i++) {
				if (await bcrypt.compare(req.headers.authorization.split(' ')[1], User.isLoggedIn[i].token)) {
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message: 'succes'
					});
				}
			}
			return res.status(HttpStatus.FORBIDDEN).json({
				statusCode: HttpStatus.FORBIDDEN,
				message: 'Token invalid',
				error: 'FORBIDDEN',
			});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('SearchFriend/:username')
	@UseGuards(JwtTwoFactorGuard)
	async SearchFriendsByUsername(
		@Req() req: any,
		@Res() res: any,
		@Param(ValidationPipe) param: SearchDto,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		function onlyLettersAndNumbers(str: string) {
			return Boolean(str.match(/^[A-Za-z0-9]*$/));
		}
		if (User) {
			if (onlyLettersAndNumbers(param.username)) {
				const find = await this.userService.findUsersByUsername(
					param.username,
					User.uuid,
				);
				if (find) {
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message: 'succes',
						searchResult: find,
					});
				}
			}
			return res.status(HttpStatus.NO_CONTENT).json({
				statusCode: HttpStatus.NO_CONTENT,
				message: 'Friend not found',
				error: 'NO_CONTENT',
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('SearchProfile/:username')
	@UseGuards(JwtTwoFactorGuard)
	async SearchProfileByUsername(
		@Req() req: any,
		@Res() res: any,
		@Param(ValidationPipe) param: SearchDto,) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const find = await this.userService.findUserByUsername(param.username, User.uuid);
			if (find) {
				switch (find) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't access the profile of someone who blocked you",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't access the profile of someoneyou blocked",
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
							User: plainToClass(SendUserDto, find, {
								excludeExtraneousValues: true,
							})
						});
				}
			}
			return res.status(HttpStatus.NO_CONTENT).json({
				statusCode: HttpStatus.NO_CONTENT,
				message: 'Friend not found',
				error: 'NO_CONTENT',
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('IsFriend/:uuid')
	@UseGuards(JwtTwoFactorGuard)
	async IsFriendByUuid(
		@Req() req: any,
		@Res() res: any,
		@Param(ValidationPipe) param: FriendsDto,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const find = await this.userService.IsFriendByUuid(param.uuid, User.uuid);
			if (find) {
				return res.status(HttpStatus.OK).json({
					statusCode: HttpStatus.OK,
					message: 'succes',
					IsFriend: true,
				});
			}
			return res.status(HttpStatus.NO_CONTENT).json({
				statusCode: HttpStatus.NO_CONTENT,
				message: 'Friend not found',
				error: 'NO_CONTENT',
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Post('AddFriend')
	@UseGuards(JwtTwoFactorGuard)
	async AddFriendByUuid(@Req() req: any, @Res() res: any, @Body() body: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const FriendUuid = body['uuid'];
		if (User && FriendUuid) {
			const add = await this.userService.addUserByUuid(FriendUuid, User);
			if (add) {
				switch (add) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't add yourself as a friend",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'Already friend',
							error: 'BAD_REQUEST',
						});
					case 4:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'Already requested to be friend with this user',
							error: 'BAD_REQUEST',
						});
					case 5:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message:
								"You can't request to be friend with someone you blocked or someone who blocked you",
							error: 'BAD_REQUEST',
						});
					case 6:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message:
								"You can't request to be friend with someone who already asked you as a friend",
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't add friend",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Post('AcceptFriend')
	@UseGuards(JwtTwoFactorGuard)
	async acceptUserByUuid(@Req() req: any, @Res() res: any, @Body() body: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const FriendUuid = body['uuid'];
		if (User && FriendUuid) {
			const add = await this.userService.acceptUserByUuid(FriendUuid, User);
			if (add) {
				switch (add) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "this user didn't request you to be his friend",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'You dont have any friend request',
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't add friend",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Post('RemoveFriend')
	@UseGuards(JwtTwoFactorGuard)
	async removeFriendByUuid(
		@Req() req: any,
		@Res() res: any,
		@Body() body: any,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const RemoveUuid = body['uuid'];
		if (User && RemoveUuid) {
			const remove = await this.userService.removeFriendByUuid(
				RemoveUuid,
				User,
			);
			if (remove) {
				switch (remove) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't remove yourself from your friends",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'You are not friends with this user',
							error: 'BAD_REQUEST',
						});
					case 4:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'You dont have any friends',
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't remove friend",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Post('CancelFriendAdd')
	@UseGuards(JwtTwoFactorGuard)
	async cancelFriendAddByUuid(
		@Req() req: any,
		@Res() res: any,
		@Body() body: any,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const RemoveUuid = body['uuid'];
		if (User && RemoveUuid) {
			const remove = await this.userService.cancelFriendAddByUuid(
				RemoveUuid,
				User,
			);
			if (remove) {
				switch (remove) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You didn't request to be your own friend",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You didn't request to be friend with this user",
							error: 'BAD_REQUEST',
						});
					case 4:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You didn't request to be friend with anyone",
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't cancel friend add",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Post('DeclineFriendAdd')
	@UseGuards(JwtTwoFactorGuard)
	async refuseFriendAddByUuid(
		@Req() req: any,
		@Res() res: any,
		@Body() body: any,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const RemoveUuid = body['uuid'];
		if (User && RemoveUuid) {
			const remove = await this.userService.refuseFriendAddByUuid(
				RemoveUuid,
				User,
			);
			if (remove) {
				switch (remove) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message:
								"You can't refuse to be your own friend, love yourself :)",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "this user didn't request to be your friend",
							error: 'BAD_REQUEST',
						});
					case 4:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'Nobody requested to be your friend :(',
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't refuse friend add",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Post('BlockUser')
	@UseGuards(JwtTwoFactorGuard)
	async blockUserByUuid(@Req() req: any, @Res() res: any, @Body() body: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const BlockUuid = body['uuid'];
		if (User && BlockUuid) {
			const block = await this.userService.blockUserByUuid(BlockUuid, User);
			if (block) {
				switch (block) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't block yourself",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'Already blocked',
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't block user",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Post('UnblockUser')
	@UseGuards(JwtTwoFactorGuard)
	async unblockUserByUuid(@Req() req: any, @Res() res: any, @Body() body: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		const UnblockUuid = body['uuid'];
		if (User && UnblockUuid) {
			const block = await this.userService.unblockUserByUuid(UnblockUuid, User);
			if (block) {
				switch (block) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: 'why try to unblock yourself ?',
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "This user isn't blocked",
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: "Couldn't unblock user",
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}

	@Get('ListFriends')
	@UseGuards(JwtTwoFactorGuard)
	async ListFriendsWithUuid(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.ListFriendsWithUuid(User.uuid);
			const friends = await this.userService.GetProfilesWithUuidTab(add);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				friendList: friends,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('ListFriendRequested')
	@UseGuards(JwtTwoFactorGuard)
	async ListFriendsRequestedWithUuid(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.ListFriendsRequestedWithUuid(
				User.uuid,
			);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				ListFriendsRequested: add,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('ListFriendRequest')
	@UseGuards(JwtTwoFactorGuard)
	async ListFriendsRequestWithUuid(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const uuidList = await this.userService.ListFriendsRequestWithUuid(
				User.uuid,
			);
			const usernameList =
				await this.userService.ListUsernameFriendsRequestWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				ListFriendsRequest: uuidList,
				usernameList: usernameList,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('ListUsersBlocked')
	@UseGuards(JwtTwoFactorGuard)
	async ListBlockedWithUuid(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.ListBlockedWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				ListUsersblocked: add,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('ListBlockedBy')
	@UseGuards(JwtTwoFactorGuard)
	async ListBlockedByWithUuid(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.ListBlockedByWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				ListBlockedBy: add,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('Leaderboard')
	@UseGuards(JwtTwoFactorGuard)
	async Leaderboard(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.Leaderboard();
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				Leaderboard: add,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('Ranking')
	@UseGuards(JwtTwoFactorGuard)
	async Ranking(@Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.Ranking(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				Rank : add,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('RankingByUuid/:uuid')
	@UseGuards(JwtTwoFactorGuard)
	async RankingByUuid(@Req() req: any, @Res() res: any, @Param(ValidationPipe) param: FriendsDto) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User) {
			const add = await this.userService.Ranking(param.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
				Rank : add,
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Post('changeUsername')
	@UseGuards(JwtTwoFactorGuard)
	async ChangeUsername(
		@Req() req: any,
		@Res() res: any,
		@Body() Name: SearchDto,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		function onlyLettersAndNumbers(str: string) {
			return Boolean(str.match(/^[A-Za-z0-9]*$/));
		}
		if (User) {
			const newName = Name['newName'];
			if (
				!Name ||
				!newName ||
				/^\s*$/.test(newName) ||
				newName.length < 2 ||
				newName.length > 10 ||
				!onlyLettersAndNumbers(newName)
			) {
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST,
					message:
						'Username is invalid , check the length or the characters that make up the username',
					error: 'BAD_REQUEST',
				});
			}
			if (!(await this.userService.ChangeUsername(User.uuid, newName))) {
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST,
					test: 'yolo',
					message: 'Username already exist',
					error: 'BAD_REQUEST',
				});
			}
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

	@Post('changeAvatar')
	@UseGuards(JwtTwoFactorGuard)
	@UseInterceptors(FileInterceptor('file', {
		fileFilter: function fileFilter(req, file: Express.Multer.File, cb) {
			const whitelist = [
				'image/png',
				'image/jpeg',
				'image/jpg',
			]
			if (!file)
				return cb( new BadRequestException('No file provided'), false);
			if (!whitelist.includes(file.mimetype))
				return cb(
					new UnsupportedMediaTypeException('No files other than jpg/png/jpeg are accepted'), false);
			cb(null, true);
		},
		limits: {
			fileSize: 1e7,
		},
	}),
	)
	async ChangeAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any, @Res() res: any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		console.log(file);
		if (!file)
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'No file',
				error: 'BAD_REQUEST',
			});
		if (file.mimetype === 'image/png') {
			if (file.buffer[0] !== 0x89 || file.buffer[1] !== 0x50 || file.buffer[2] !== 0x4E || file.buffer[3] !== 0x47 || file.buffer[4] !== 0x0D || file.buffer[5] !== 0x0A || file.buffer[6] !== 0x1A || file.buffer[7] !== 0x0A)
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'ivalid png',
					error: 'BAD_REQUEST',
				});
		} else if (file.mimetype === 'image/jpeg') {
			if (file.buffer[0] !== 0xFF || file.buffer[1] !== 0xD8 || file.buffer[2] !== 0xFF)
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'ivalid jpeg',
					error: 'BAD_REQUEST',
				});
		} else if (file.mimetype === 'image/jpg') {
			if (file.buffer[0] !== 0xFF || file.buffer[1] !== 0xD8 || file.buffer[2] !== 0xFF)
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'ivalid jpg',
					error: 'BAD_REQUEST',
				});
		} else {
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'ivalid image file',
				error: 'BAD_REQUEST',
			});
		}
		if (User) {
			const nb = (await this.userService.ChangeAvatar(User.uuid, file.buffer, file.mimetype));
			if (!nb) {
				return res.status(HttpStatus.NOT_FOUND).json({
					statusCode: HttpStatus.NOT_FOUND,
					message: 'User not found',
					error: 'NOT_FOUND',
				});
			}
			if (nb === 1)
				return res.status(HttpStatus.OK).json({
					statusCode: HttpStatus.OK,
					message: 'succes',
				});
			else
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'failed to change avatar',
					error: 'BAD_REQUEST',
				});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'User not found',
			error: 'NOT_FOUND',
		});
	}

	@Get('findUser/:uuid')
	@UseGuards(JwtTwoFactorGuard)
	async findUserByUuid(
		@Res() res: any,
		@Req() req: any,
		@Param(ValidationPipe) param: FriendsDto,
	) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(Jwt['uuid']);
		if (User && param.uuid) {
			const UserUuid = await this.userService.findFriendByUuid(User.uuid, param.uuid);
			if (UserUuid) {
				switch (UserUuid) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't access the profile of someone who blocked you",
							error: 'BAD_REQUEST',
						});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't access the profile of someoneyou blocked",
							error: 'BAD_REQUEST',
						});
					default:
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
							User: plainToClass(SendUserDto, UserUuid, {
								excludeExtraneousValues: true,
							})
						});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'no user uses this uuid',
				error: 'BAD_REQUEST',
			});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: 'User not found',
				error: 'NOT_FOUND',
			});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'uuid invalid or not found in body',
			error: 'BAD_REQUEST',
		});
	}
}
