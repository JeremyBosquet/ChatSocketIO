import { Channel } from 'diagnostics_channel';
import { Chat } from 'src/Chat/Entities/chat.entity';
import { Room } from 'src/Game/Entities/room.entity';
import { User } from 'src/Chat/Entities/user.entity';
import { UserModel } from './user.entity';

const entities = [UserModel, Chat, Channel, User, Room];

//export const secret = 's038-pwpppwpeok-dffMjfjriru44030423-edmmfvnvdmjrp4l4k';

export { UserModel };
export default entities;
