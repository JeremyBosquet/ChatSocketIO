import {
	Body,
	Res,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
	} from '@nestjs/common';
import { AuthenticatedGuard } from '../login/guards/authenticated.guard';
	import { CreateUserDto } from './users.dto';
	import { UsersService } from './users.service';
	
	@Controller('users')
	export class UsersController {
	  constructor(private readonly userService: UsersService) {}
	  
	  @Get()
	  @UseGuards(AuthenticatedGuard)
	  async getUsers(@Res() res : any) {
		const User = await this.userService.getUsers();
		res.json(User);
	  }
	  
	  @Get('id/:id')
	  @UseGuards(AuthenticatedGuard)
	  async findUsersById(@Res() res : any, @Param('id', ParseUUIDPipe) id: number) {
		const UserId = await this.userService.findUsersById(id);
		res.json(UserId);
	  }
	  
	  @Post('create')
	  @UseGuards(AuthenticatedGuard)
	  @UsePipes(ValidationPipe)
	  async createUsers(@Res() res : any, @Body() createUserDto: CreateUserDto) {
		const CreateUser = await this.userService.createUser(createUserDto);
		res.json(CreateUser);
	  }
	}