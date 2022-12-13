import { IsUUID } from 'class-validator';

export class DmIdDTO {
    @IsUUID()
    dmId: string;
}

export class DmCheckDTO {
    // @IsUUID()
    user1: string;

    // @IsUUID()
    user2: string;
}

export class UserIdDTO {
    @IsUUID()
    userId: string;
}

export class GetMessagesDmDTO {
    @IsUUID()
    dmId: string;
  
    @IsUUID()
    userId: string;
}
