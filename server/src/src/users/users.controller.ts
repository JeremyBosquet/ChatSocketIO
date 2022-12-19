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
} from '@nestjs/common';
import { ExpDto, FriendsDto, SearchDto, SendUserDto, TokenDto } from './users.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/login/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtTwoFactorGuard } from 'src/2auth/jwt-two-factor.guard';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';

let nameAvatar: string;
@Controller('user')
export class UsersController {
  constructor(
	private readonly userService: UsersService,
	private jwtService: JwtService,
  ) {}

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

//   @Post('addExp')
//   @UseGuards(JwtTwoFactorGuard)
//   async addExp(@Req() req: any,@Res() res: any,@Body() Exp : ExpDto) {
// 	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
// 	const User = await this.userService.findUserByUuid(Jwt['uuid']);
// 	if (User) {
// 	  const expToAdd = Exp['exp'];
// 	  if (!Exp || !expToAdd) {
// 		return res.status(HttpStatus.NOT_MODIFIED).json({
// 		  statusCode: HttpStatus.NOT_MODIFIED,
// 		  message: 'Exp invalid',
// 		  error: 'NOT_MODIFIED',
// 		});
// 	  }
// 	  if (!(await this.userService.addExp(User.uuid, expToAdd))) {
// 		return res.status(HttpStatus.NOT_MODIFIED).json({
// 		  statusCode: HttpStatus.NOT_MODIFIED,
// 		  message: 'Failed to add exp',
// 		  error: 'NOT_MODIFIED',
// 		});
// 	  }
// 	  return res.status(HttpStatus.OK).json({
// 		statusCode: HttpStatus.OK,
// 		message: 'succes',
// 	  });
// 	}
// 	return res.status(HttpStatus.NOT_FOUND).json({
// 	  statusCode: HttpStatus.NOT_FOUND,
// 	  message: 'User not found',
// 	  error: 'NOT_FOUND',
// 	});
//   }

  @Get('getExp/:uuid')
  @UseGuards(JwtAuthGuard)
  async getExp(@Req() req: any,@Res() res: any,@Param(ValidationPipe) param: FriendsDto,) {
	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
	const User = await this.userService.findUserByUuid(Jwt['uuid']);
	if (User) {
	  const exp = await this.userService.getExp(param.uuid);
	  if (exp !== undefined)
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'succes',
			Exp : exp,
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
		IsLoggedIn: User.isLoggedIn,
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
  @UseGuards(JwtAuthGuard)
  async CompareToken(@Req() req: any, @Res() res: any) {
	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
	const User = await this.userService.findUserByUuid(Jwt['uuid']);
	if (User) {
		for (let i = 0; i < User.isLoggedIn.length; i++)
		{
			if (await bcrypt.compare(req.headers.authorization.split(' ')[1], User.isLoggedIn[i].token)) {
				return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes'});
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
  @UseGuards(JwtAuthGuard)
  async SearchFriendsByUsername(
	@Req() req: any,
	@Res() res: any,
	@Param(ValidationPipe) param: SearchDto,
  ) {
	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
	const User = await this.userService.findUserByUuid(Jwt['uuid']);
	if (User) {
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
  @UseGuards(JwtAuthGuard)
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
					default :
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message: 'succes',
							User: plainToClass(SendUserDto, find, {
							excludeExtraneousValues: true,
							}) });
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  @Post('changeUsername')
  @UseGuards(JwtTwoFactorGuard)
  async ChangeUsername(
	@Req() req: any,
	@Res() res: any,
	@Body() Name: SearchDto,
  ) {
	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
	const User = await this.userService.findUserByUuid(Jwt['uuid']);
	if (User) {
	  const newName = Name['newName'];
	  if (
		!Name ||
		!newName ||
		/^\s*$/.test(newName) ||
		newName.length < 2 ||
		newName.length > 10
	  ) {
		return res.status(HttpStatus.BAD_REQUEST).json({
		  statusCode: HttpStatus.BAD_REQUEST,
		  message:
			'Username is either too short , too long or made of only space char',
		  error: 'BAD_REQUEST',
		});
	  }
	  if (!(await this.userService.ChangeUsername(User.uuid, newName))) {
		return res.status(HttpStatus.BAD_REQUEST).json({
		  statusCode: HttpStatus.BAD_REQUEST,
		  test : 'yolo',
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

  // @Post('changeAvatar')
  // @UseGuards(JwtAuthGuard)
  // async ChangeAvatar(@Req() req: any , @Res() res : any, @Body() Avatar : string) {
  // 	const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
  // 	const User = await this.userService.findUserById(Jwt["id"]);
  // 	const newAvatar = Avatar["newAvatar"]
  // 	if (User)
  // 	{
  // 		if (! (await this.userService.ChangeAvatar(User.id, newAvatar)))
  // 		{
  // 			return res.status(HttpStatus.NOT_FOUND).json({
  // 				statusCode: HttpStatus.NOT_FOUND,
  // 				message: "User not found",
  // 				error: "NOT_FOUND"});
  // 		}
  // 		return res.status(HttpStatus.OK).json({
  // 			statusCode: HttpStatus.OK,
  // 			message : "succes"});
  // 	}
  // 	return res.status(HttpStatus.NOT_FOUND).json({
  // 		statusCode: HttpStatus.NOT_FOUND,
  // 		message: "User not found",
  // 		error: "NOT_FOUND"});
  // }

  @Post('changeAvatar')
  @UseGuards(JwtTwoFactorGuard)
  @UseInterceptors(
	FileInterceptor('file', {
	  limits: {
		fileSize: 1e6,
	  },
	  fileFilter: function fileFilter(req, file, cb) {
		if (
		  file.mimetype !== 'image/jpg' &&
		  file.mimetype !== 'image/png' &&
		  file.mimetype !== 'image/jpeg'
		) {
		  return cb(
			new UnsupportedMediaTypeException(
			  'No files other than jpg/png/jpeg are accepted',
			),
			false,
		  );
		}
		cb(null, true);
	  },
	  storage: diskStorage({
		destination: 'src/uploads/avatar',
		filename: async function (req, file, cb) {
		  const type = '.' + file.mimetype.split('/')[1];
		  cb(null, (nameAvatar = Date().replace(/ /g, '') + type));
		},
	  }),
	}),
  )
  async ChangeAvatar(
	@UploadedFile() file: Express.Multer.File,
	@Req() req: any,
	@Res() res: any,
  ) {
	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
	const User = await this.userService.findUserByUuid(Jwt['uuid']);
	//const newAvatar = Avatar["newAvatar"]
	if (User) {
	  const type = '.' + file.mimetype.split('/')[1];
	  if (
		!(
		  (await this.userService.ChangeAvatar(
			User.uuid,
			`${process.env.BACK}`.concat(nameAvatar),
		  )) + type
		)
	  ) {
		return res.status(HttpStatus.NOT_FOUND).json({
		  statusCode: HttpStatus.NOT_FOUND,
		  message: 'User not found',
		  error: 'NOT_FOUND',
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

  @Get('findUser/:uuid')
  @UseGuards(JwtTwoFactorGuard)
  //@UseGuards(AuthenticatedGuard)
  async findUserByUuid(
	@Res() res: any,
	@Req() req: any,
	@Param(ValidationPipe) param: FriendsDto,
  ) {
	const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
	const User = await this.userService.findUserByUuid(Jwt['uuid']);
	//console.log(req)
	//const uuid = param["uuid"];
	if (User && param.uuid) {
	  const UserUuid = await this.userService.findFriendByUuid(User.uuid, param.uuid);
	  if (UserUuid) {
		switch(UserUuid)
		{
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
			default :
				return res.status(HttpStatus.OK).json({
					statusCode: HttpStatus.OK,
					message: 'succes',
					User: plainToClass(SendUserDto, UserUuid, {
					excludeExtraneousValues: true,
					}) });
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
