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
	import { SendUserDto } from './users.dto';
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
		const User = await this.userService.findUserById(Jwt["id"]);
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
		const User = await this.userService.findUserById(Jwt["id"]);
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

	
	@Post('changeUsername')
	@UseGuards(JwtTwoFactorGuard)
	async ChangeUsername(@Req() req: any , @Res() res : any, @Body() Name : string) {
		const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
		const User = await this.userService.findUserById(Jwt["id"]);
		const newName = Name["newName"]
		if (!Name["newName"] || /^\s*$/.test(Name["newName"]) || Name["newName"].length < 2 || Name["newName"].length > 12)
		{
			return res.status(HttpStatus.NOT_MODIFIED).json({
				statusCode: HttpStatus.NOT_MODIFIED, 
				message: "Username is either too short , too long or made of only space char", 
				error: "NOT_MODIFIED"});
		}
		if (User)
		{
			// const d = 
			// console.log();
			if (! (await this.userService.ChangeUsername(User.id, newName)))
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
		const User = await this.userService.findUserById(Jwt["id"]);
		//const newAvatar = Avatar["newAvatar"]
		console.log(file);
		if (User)
		{
			const type = '.' + file.mimetype.split('/')[1];
			if (! (await this.userService.ChangeAvatar(User.id, `${process.env.BACK}`.concat(nameAvatar)) + type))
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

	@Get('id/:id')
	@UseGuards(JwtTwoFactorGuard)
	//@UseGuards(AuthenticatedGuard)
	async findUsersById(@Res() res : any, @Param('id', ParseUUIDPipe) id: number) {
		const UserId = await this.userService.findUserById(id);
		return res.status(HttpStatus.OK).json(UserId);
	}

}