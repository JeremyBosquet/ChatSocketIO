import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { getSelectedChannel, getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './Ban.scss'

interface props {
    user: IuserDb;
}

function Ban(props : props) {
  const [selected, setSelected] = useState<Date>();
  const socket = useSelector(getSocket);
  const selectedChannel = useSelector(getSelectedChannel);
  const me = useSelector(getUser);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [banMenu, setBanMenu] = useState(false);

  const handleBan = async (targetId: string) => {
    let duration = new Date().toISOString();
    let permanent = false;

    await axios.post(`http://localhost:4000/api/chat/channel/ban/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.id,
      time: duration.toString(),
      isPermanent: permanent
    }).then(res => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId, type: "ban"});
    });
  }

  return (
    <>
      { banMenu ?
          <div className="banMenu">
            <div className="banContainer">
              <button onClick={() => setPickerOpen(!pickerOpen)}>{!selected ? "Duration" : selected?.toLocaleDateString()}</button>
              {
                pickerOpen ?
                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  fromDate={new Date()}
                  modifiersClassNames={{
                    selected: 'my-selected',
                    today: 'my-today'
                  }}              
                  />
                  : null
              }
            </div>
          </div>
      : null
      }
      <button className="actionButton" onClick={() => setBanMenu(!banMenu)}>Ban</button>
    </>
  );
}

export default Ban;