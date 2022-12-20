import axios from "axios";

const instance = axios.create({
    baseURL: process.env?.URL + ':7000/api/',
    headers: {
		Authorization: "Bearer " + localStorage.getItem("token"),
    },
});

export default instance;