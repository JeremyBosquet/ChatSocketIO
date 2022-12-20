import axios from "axios";

const instance = axios.create({
    baseURL: 'http://90.66.199.176:7000/api/',
    headers: {
		Authorization: "Bearer " + localStorage.getItem("token"),
    },
});

export default instance;