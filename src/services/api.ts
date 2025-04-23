import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError, ChatroomResponse, CommonResponse, FavoriteResponse, FriendRequestResponse, FriendshipResponse, LoginResponse } from "../types/api";

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
  searchUsers: (keyword: string): Promise<CommonResponse<any[]>> => {
    return instance.get(`/user/search`, { params: { keyword } });
  },
};

export const friendshipApi = {
  getFriendList: (): Promise<FriendshipResponse> => {
    return instance.get(`/friendship/list`);
  },
  sendFriendRequest: ({ friendId, reason }: { friendId: number; reason: string }): Promise<ApiError> => {
    return instance.post(`/friendship/add`, { friendId, reason });
  },
  getFriendRequestList: (): Promise<FriendRequestResponse> => {
    return instance.get(`/friendship/request_list`);
  },
  updateFriendRequest: ({ friendId, status }: { friendId: number; status: number }): Promise<ApiError> => {
    return instance.post(`/friendship/update`, { friendId, status });
  },
};

export const chatroomApi = {
  getGroupList: (): Promise<ChatroomResponse> => {
    return instance.get(`/chatroom/list`);
  },
  findOneToOneChatroom: ({ userId1, userId2 }: { userId1: number; userId2: number }): Promise<CommonResponse<number>> => {
    return instance.get(`/chatroom/findOneToOneChatroom`, { params: { userId1, userId2 } });
  },
  createOneToOneChatroom: ({ friendId }: { friendId: number }): Promise<CommonResponse<string>> => {
    return instance.get(`/chatroom/createOneToOneChatroom`, { params: { friendId } });
  },
  createGroupChatroom: (name: string): Promise<CommonResponse<any>> => {
    return instance.get(`/chatroom/create-group`, { params: { name } });
  },
  getMembers: (chatroomId: number): Promise<CommonResponse<any[]>> => {
    return instance.get(`/chatroom/members`, { params: { chatroomId } });
  },
  joinChatroom: (chatroomId: number, id: number): Promise<ApiError> => {
    return instance.get(`/chatroom/join/${id}`, { params: { chatroomId } });
  },
};

export const chatHistoryApi = {
  getChatHistory: (chatroomId: number): Promise<CommonResponse<any[]>> => {
    return instance.get(`/chat-history/list`, { params: { chatroomId } });
  },
};

export const favoriteApi = {
  getFavoriteList: (): Promise<FavoriteResponse> => {
    return instance.get(`/favorite/list`);
  },
  deleteFavorite: (id: number): Promise<ApiError> => {
    return instance.get(`/favorite/del`, { params: { id } });
  },
  addFavorite: (chatHistoryId: number): Promise<ApiError> => {
    return instance.get(`/favorite/add`, { params: { chatHistoryId } });
  },
};

// 导出axios实例供其他模块使用
export default instance;
