import {IsNotEmpty, MinLength} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  uuid: string;

  image: string;

  createdAt: Date;

  id: number;
}