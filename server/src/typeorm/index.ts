import { Channel } from 'src/Chat/Entities/channel.entity';
import { Room } from 'src/Game/Entities/room.entity';
import { User } from 'src/Chat/Entities/user.entity';
import { UserModel } from './user.entity';
import { DM } from 'src/Chat/Entities/dm.entity';

const entities = [UserModel, Channel, User, Room, DM];

//export const secret = 's038-pwpppwpeok-dffMjfjriru44030423-edmmfvnvdmjrp4l4k';

export { UserModel };
export default entities;
