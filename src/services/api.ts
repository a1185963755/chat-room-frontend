import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ChatroomResponse, FriendshipResponse, LoginResponse } from "../types/api";

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => {
    console.log("🚀 ~ response:", response);
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        default:
          console.error("API请求错误:", error);
      }
    }
    return Promise.reject(error.response.data.message);
  }
);

// API接口
export const userApi = {
  login: (data: { username: string; password: string }): Promise<LoginResponse> => {
    return instance.post("/user/login", data);
  },
};

export const friendshipApi = {
  getFriendList: (): Promise<FriendshipResponse> => {
    return instance.get(`/friendship/list`);
  },
};

export const chatroomApi = {
  getGroupList: (): Promise<ChatroomResponse> => {
    return instance.get(`/chatroom/list`);
  },
};

// 导出axios实例供其他模块使用
export default instance;
