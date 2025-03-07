import axios from "axios";

const user_api = axios.create({
    baseURL: '/user',
    headers: {'Content-Type': 'application/json'},
});

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await user_api.get('/profile', {
    headers: { Authorization: `${token}` },
  });
  const user = response.data.data;
  return user;
};

