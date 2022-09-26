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
	} from '@nestjs/common';
	import { AuthenticatedGuard } from '../login/guards/authenticated.guard';
	import { CreateUserDto } from './users.dto';
	import { UsersService } from './users.service';
	import { JwtService } from '@nestjs/jwt';
	
@Controller('users')
	export class UsersController {
	constructor(private readonly userService: UsersService ,
	private jwtService: JwtService) {}
	
	@Get()
	@UseGuards(AuthenticatedGuard)
	async getUsers(@Res() res : any) {
		const User = await this.userService.getUsers();
		return res.status(HttpStatus.OK).json(User);
	}
	
	@Get('id/:id')
	@UseGuards(AuthenticatedGuard)
	async findUsersById(@Res() res : any, @Param('id', ParseUUIDPipe) id: number) {
		const UserId = await this.userService.findUsersById(id);
		return res.status(HttpStatus.OK).json(UserId);
	}
	
	@Post('create')
	@UseGuards(AuthenticatedGuard)
	@UsePipes(ValidationPipe)
	async createUsers(@Res() res : any, @Body() createUserDto: CreateUserDto) {
		const CreateUser = await this.userService.createUser(createUserDto);
		return res.status(HttpStatus.CREATED).json(CreateUser);
	}

}