import Axios from 'axios';

const axios = Axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    // This header prevents the spring backend to add a header which will make a popup appear if the credentials are wrong.
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Configure to use auth every time bc node can not save cookies.
  auth: {
    username: 'admin',
    password: 'admin',
  },
});

export default axios;
