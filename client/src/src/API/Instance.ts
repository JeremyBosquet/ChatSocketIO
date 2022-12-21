import axios from "axios";

// const instance = axios.create({
//     baseURL: import.meta.env.VITE_URL_API + ':7000/api/',
//     headers: {
// 		  Authorization: "Bearer " + localStorage.getItem("token"),
//     },
// });


//   // Set the AUTH token for any request
//   instance.interceptors.request.use(function (config) {
//     const token = localStorage.getItem('token');
// 	if (config.headers)
//     	config.headers.Authorization =  token ? `Bearer ${token}` : '';
//     return config;
//   });

//   return instance;




// const fetchClient = () => {
const defaultOptions = {
	baseURL: import.meta.env.VITE_URL_API + ':7000/api/',
	headers: {
	'Content-Type': 'application/json',
	},
};

// Create instance
let instance = axios.create(defaultOptions);

// Set the AUTH token for any request
instance.interceptors.request.use(function (config) {
	const token = localStorage.getItem('token');
	if (config.headers)
	config.headers.Authorization =  token ? `Bearer ${token}` : '';
	return config;
});
  
  
//   export default fetchClient();

export default instance;