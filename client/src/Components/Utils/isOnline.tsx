import React from "react";
import { useSelector } from "react-redux";

export const isOnline = (uuid: string, ConnectedList : any) => {
	ConnectedList?.forEach((user: any) => {
		if (user.uuid === uuid)
			return true;
  	});
 	return false;
}
