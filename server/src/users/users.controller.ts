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
	import { FriendsDto, SendUserDto } from './users.dto';
	import { UsersService } from './users.service';
	import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/login/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtTwoFactorGuard } from 'src/2auth/jwt-two-factor.guard';
import { plainToClass } from 'class-transformer';

let nameAvatar : string;
@Controller('user')
	export class UsersController {
	constructor(private readonly userService: UsersService ,
	private jwtService: JwtService) {}
	

	@Get()
	@UseGuards(JwtTwoFactorGuard)
	async getUser(@Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		if (User)
		{
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes" ,
				User : plainToClass(SendUserDto, User, {excludeExtraneousValues: true})});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	@Get('getLoggedInfo')
	@UseGuards(JwtAuthGuard)
	async getLoggedInfo(@Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		if (User)
		{
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes" ,
				IsLoggedIn : User.isLoggedIn,
				isTwoFactorAuthenticationEnabled : User.isTwoFactorAuthenticationEnabled,
				isSecondFactorAuthenticated : User.isSecondFactorAuthenticated
			});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	
	@Get('SearchFriend')
	@UseGuards(JwtAuthGuard)
	async SearchFriendByUsername(@Req() req: any , @Res() res : any, @Body() body : string) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);	
		if (User)
		{
			const username = body["username"];
			if (!body || !username || /^\s*$/.test(username) || username.length < 1 || username.length > 12)
			{
				return res.status(HttpStatus.BAD_REQUEST).json({
					statusCode: HttpStatus.BAD_REQUEST, 
					message: "Username is either too short , too long or made of only space char", 
					error: "BAD_REQUEST"});
			}
			const find = await this.userService.findUserByUsername(username, User.uuid);
			if (find)
			{
				return res.status(HttpStatus.OK).json({
					statusCode: HttpStatus.OK,
					message : "succes" ,
					searchResult : find,
				});
			}
			return res.status(HttpStatus.NO_CONTENT).json({
				statusCode: HttpStatus.NO_CONTENT, 
				message: "Friend not found", 
				error: "NO_CONTENT"});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	@Post('AddFriend')
	@UseGuards(JwtAuthGuard)
	async AddFriendByUuid(@Req() req: any , @Res() res : any, @Body() body : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		const FriendUuid = body["uuid"];
		if (User && FriendUuid)
		{
			const add = await this.userService.addUserByUuid(FriendUuid, User);
			if (add)
			{
				switch (add) {
					case 2:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You can't add yourself as a friend",
							error: "BAD_REQUEST"});
					case 3:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "Already friend",
							error: "BAD_REQUEST"});
					case 4:
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "Already requested to be friend with this user",
							error: "BAD_REQUEST"});
					default :
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message : "succes",});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "Couldn't add friend", 
				error: "BAD_REQUEST"});

		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

	@Post('AcceptFriend')
	@UseGuards(JwtAuthGuard)
	async acceptUserByUuid(@Req() req: any , @Res() res : any, @Body() body : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		const FriendUuid = body["uuid"];
		if (User && FriendUuid)
		{
			const add = await this.userService.acceptUserByUuid(FriendUuid, User);
			if (add)
			{
				switch (add) {
					case 2 :
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "this user didn't request you to be his friend",
							error: "BAD_REQUEST"});
					case 3 :
						return res.status(HttpStatus.BAD_REQUEST).json({
							statusCode: HttpStatus.BAD_REQUEST,
							message: "You dont have any friend request",
							error: "BAD_REQUEST"});
					default :
						return res.status(HttpStatus.OK).json({
							statusCode: HttpStatus.OK,
							message : "succes",});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "Couldn't add friend", 
				error: "BAD_REQUEST"});

		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

	@Post('RemoveFriend')
	@UseGuards(JwtAuthGuard)
	async removeFriendByUuid(@Req() req: any , @Res() res : any, @Body() body : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		const RemoveUuid = body["uuid"];
		if (User && RemoveUuid)
		{
			const remove = await this.userService.removeFriendByUuid(RemoveUuid, User);
			if (remove)
			{
				switch (remove) {
				case 2 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You can't remove yourself from your friends",
						error: "BAD_REQUEST"});
				case 3 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You are not friends with this user",
						error: "BAD_REQUEST"});
				case 4 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You dont have any friends",
						error: "BAD_REQUEST"});
				default :
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message : "succes",});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "Couldn't remove friend", 
				error: "BAD_REQUEST"});

		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

	@Post('CancelFriendAdd')
	@UseGuards(JwtAuthGuard)
	async cancelFriendAddByUuid(@Req() req: any , @Res() res : any, @Body() body : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		const RemoveUuid = body["uuid"];
		if (User && RemoveUuid)
		{
			const remove = await this.userService.cancelFriendAddByUuid(RemoveUuid, User);
			if (remove)
			{
				switch (remove) {
				case 2 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You didn't request to be your own friend",
						error: "BAD_REQUEST"});
				case 3 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You didn't request to be friend with this user",
						error: "BAD_REQUEST"});
				case 4 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You didn't request to be friend with anyone",
						error: "BAD_REQUEST"});
				default :
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message : "succes",});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "Couldn't cancel friend add", 
				error: "BAD_REQUEST"});

		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

	@Post('BlockUser')
	@UseGuards(JwtAuthGuard)
	async blockUserByUuid(@Req() req: any , @Res() res : any, @Body() body : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		const BlockUuid = body["uuid"];
		if (User && BlockUuid)
		{
			const block = await this.userService.blockUserByUuid(BlockUuid, User);
			if (block)
			{
				switch (block) {
				case 2 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "You can't block yourself",
						error: "BAD_REQUEST"});
				case 3 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "Already blocked",
						error: "BAD_REQUEST"});
				default :
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message : "succes",});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "Couldn't block user", 
				error: "BAD_REQUEST"});

		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

	@Post('UnblockUser')
	@UseGuards(JwtAuthGuard)
	async unblockUserByUuid(@Req() req: any , @Res() res : any, @Body() body : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		const UnblockUuid = body["uuid"];
		if (User && UnblockUuid)
		{
			const block = await this.userService.unblockUserByUuid(UnblockUuid, User);
			if (block)
			{
				switch (block) {
				case 2 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "why try to unblock yourself ?",
						error: "BAD_REQUEST"});
				case 3 :
					return res.status(HttpStatus.BAD_REQUEST).json({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "This user isn't blocked",
						error: "BAD_REQUEST"});
				default :
					return res.status(HttpStatus.OK).json({
						statusCode: HttpStatus.OK,
						message : "succes",});
				}
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "Couldn't unblock user", 
				error: "BAD_REQUEST"});

		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

	@Get('ListFriends')
	@UseGuards(JwtAuthGuard)
	async ListFriendsWithUuid(@Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		if (User)
		{
			const add = await this.userService.ListFriendsWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes",
				friendList : add,
			});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	@Get('ListFriendRequested')
	@UseGuards(JwtAuthGuard)
	async ListFriendsRequestedWithUuid(@Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		if (User)
		{
			const add = await this.userService.ListFriendsRequestedWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes",
				ListFriendsRequested : add,
			});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	@Get('ListFriendRequest')
	@UseGuards(JwtAuthGuard)
	async ListFriendsRequestWithUuid(@Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		if (User)
		{
			const add = await this.userService.ListFriendsRequestWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes",
				ListFriendsRequest : add,
			});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	@Get('ListUsersBlocked')
	@UseGuards(JwtAuthGuard)
	async ListBlockedWithUuid(@Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		if (User)
		{
			const add = await this.userService.ListBlockedWithUuid(User.uuid);
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes",
				ListUsersblocked : add,
			});

		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}
	
	@Post('changeUsername')
	@UseGuards(JwtTwoFactorGuard)
	async ChangeUsername(@Req() req: any , @Res() res : any, @Body() Name : string) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);	
		if (User)
		{
			const newName = Name["newName"]
			if (!Name || !newName || /^\s*$/.test(newName) || newName.length < 2 || newName.length > 12)
			{
				return res.status(HttpStatus.NOT_MODIFIED).json({
					statusCode: HttpStatus.NOT_MODIFIED, 
					message: "Username is either too short , too long or made of only space char", 
					error: "NOT_MODIFIED"});
			}
			if (! (await this.userService.ChangeUsername(User.uuid, newName)))
			{
				return res.status(HttpStatus.NOT_MODIFIED).json({
					statusCode: HttpStatus.NOT_MODIFIED, 
					message: "Username already exist", 
					error: "NOT_MODIFIED"});
			}
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes"});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
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
	@UseInterceptors(FileInterceptor('file', {
		fileFilter: function fileFilter(req, file, cb) {
			if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
				return cb(new UnsupportedMediaTypeException('No files other than jpg/png/jpeg are accepted'), false);
			}
			cb(null, true);
		},
        storage: diskStorage({
            destination: 'src/uploads/avatar',
            filename: async function (req , file, cb) {
				const type = '.' + file.mimetype.split('/')[1];
                cb(null, nameAvatar = Date().replace(/ /g,'') + type);
            }
        }),
        limits: {
			fileSize: 1e7},
    }))
	async ChangeAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any , @Res() res : any) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);
		//const newAvatar = Avatar["newAvatar"]
		if (User)
		{
			const type = '.' + file.mimetype.split('/')[1];
			if (! (await this.userService.ChangeAvatar(User.uuid, `${process.env.BACK}`.concat(nameAvatar)) + type))
			{
				return res.status(HttpStatus.NOT_FOUND).json({
					statusCode: HttpStatus.NOT_FOUND, 
					message: "User not found", 
					error: "NOT_FOUND"});
			}
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message : "succes"});
		}
		return res.status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND, 
			message: "User not found", 
			error: "NOT_FOUND"});
	}

	@Get('findUser/:uuid')
	@UseGuards(JwtTwoFactorGuard)
	//@UseGuards(AuthenticatedGuard)
	async findUserByUuid(@Res() res : any, @Req() req : any, @Param(ValidationPipe) param: FriendsDto) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserByUuid(Jwt["uuid"]);	
		//console.log(req)
		//const uuid = param["uuid"];
		if (User && param.uuid)
		{
			const UserUuid = await this.userService.findUserByUuid(param.uuid);
			if (UserUuid)
			{
				return res.status(HttpStatus.OK).json({
					statusCode: HttpStatus.OK,
					message : "succes",
					User : plainToClass(SendUserDto, UserUuid, {excludeExtraneousValues: true})
				});
			}
			return res.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST, 
				message: "no user use this uuid", 
				error: "BAD_REQUEST"});
		}
		if (!User)
			return res.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND, 
				message: "User not found", 
				error: "NOT_FOUND"});
		return res.status(HttpStatus.BAD_REQUEST).json({
			statusCode: HttpStatus.BAD_REQUEST, 
			message: "uuid invalid or not found in body", 
			error: "BAD_REQUEST"});
	}

}