import axios from "axios";
import { API_URL } from "../config";


const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,//para que restablesca las cookies alli
});

export default instance;
https://vercel.com/eduardoryts-projects/proyecto-estadia/ERxh3t5SBh7Yj2SSR7E3Yg5BV3qX