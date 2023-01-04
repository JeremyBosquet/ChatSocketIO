import { IsNotEmpty, IsUUID } from "class-validator";

export class uuidDto {
    @IsUUID()
    uuid: string;
}