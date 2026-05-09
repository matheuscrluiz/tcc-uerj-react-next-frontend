import axios from "axios";
export const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HOST_SISTEMA + "/tcc/api",
});
