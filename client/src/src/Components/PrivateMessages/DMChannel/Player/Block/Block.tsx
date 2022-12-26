

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getBlockList, getFriendList, getRequestedList, getRequestList, getSocketSocial, getUser, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../../../../Redux/userSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { Iuser, IuserDb } from "../../interfaces/users";
import React, { useEffect, useState } from 'react';
import { createNotification } from "../../../../notif/Notif";
import instance from "../../../../../API/Instance";

interface props {
    user: IuserDb;
}

function Block(props : props) {
  const [blocked, setBlocked] = useState<boolean>(false);
  const socketSocial = useSelector(getSocketSocial);
  const friendList = useSelector(getFriendList);
  const requestList = useSelector(getRequestList);
  const requestedList = useSelector(getRequestedList);
  const me = useSelector(getUser);
  const params = useParams();
  // const selectedChannel = params.id || "";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const blockedUsers = useSelector(getBlockList);

  useEffect(() => {
    async function isBlocked(user: IuserDb) {
      let userFinded = blockedUsers.find((userBlocked : any) => userBlocked.uuid === user.uuid);
      if (userFinded)
      {
        setBlocked(true);
        return (true);
      }
      setBlocked(false);
      return (false);
    }

    isBlocked(props.user);
  }, [blockedUsers]);

  const handleBlock = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    if (!blocked) {
      await instance.post(`user/BlockUser`, {uuid : targetId}, {
          headers: ({
              Authorization: 'Bearer ' + localStorage.getItem('token'),
          })
      }).then(() => {
          const users : any[] = friendList.filter((element : any) => element.uuid !== targetId);
          const request : any[] = requestList.filter((element : any) => element.uuid !== targetId);
          const requested : any[] = requestedList.filter((element : any) => element.uuid !== targetId);
          dispatch(setFriendList(users));
          dispatch(setBlockList([...blockedUsers, {uuid : targetId}]));
          dispatch(setRequestList(request));
          dispatch(setRequestedList(requested));
          socketSocial?.emit('removeOrBlock', {uuid : targetId, myUUID : me.uuid})
          socketSocial?.emit('CancelFriendAdd', {uuid : targetId, myUUID : me.uuid});
          socketSocial?.emit('DeclineFriendAdd', {uuid : targetId, myUUID : me.uuid});
		  socketSocial?.emit('Block', {uuid : targetId, myUUID : me.uuid});
          setBlocked(true);
          
          createNotification('success', 'You have successfully blocked the player.');
        }).catch((err) => {
          console.log(err.response.data.message);
        });
      } else {
        await instance.post(`user/UnblockUser`, {uuid : targetId}, {
          headers: ({
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          })
        }).then((res) => {
          const users : any[] = friendList.filter((element : any) => element.uuid !== targetId);
          dispatch(setFriendList(users));
          dispatch(setBlockList(blockedUsers.filter((user : any) => user.uuid !== targetId)));
		      socketSocial?.emit('Unblock', {uuid : targetId, myUUID : me.uuid});
          setBlocked(false);

            createNotification('success', 'You have successfully unblocked the player.');
        }).catch((err) => {
            console.log(err.response.data.message);
        });
    }
  }

  return (
    <>
      { blocked ?
        <button className="actionButton" onClick={() => handleBlock(props.user.uuid)}>Unblock</button>
        :
        <button className="actionButton" onClick={() => handleBlock(props.user.uuid)}>Block</button>
      }
    </>
  );
}

export default Block;