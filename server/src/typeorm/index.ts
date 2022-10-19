
import { Channel } from "diagnostics_channel";
import { Chat } from "src/Chat/Entities/chat.entity";
import { User } from "src/login/user.decorator";
import { UserModel } from "./user.entity";

const entities = [UserModel, Chat, Channel, User];

export const secret = 's038-pwpppwpeok-dffMjfjriru44030423-edmmfvnvdmjrp4l4k';

export {UserModel};
export default entities;