export interface User {
  id: number;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface Friendship {
  email: string;
  id: number;
  nickname: string;
  username: string;
}
export interface FriendshipResponse {
  code: number;
  message: string;
  data: Friendship[];
}

export interface Chatroom {
  id: number;
  name: string;
  type: number;
  membersCount: number;
  membersIds: number[];
}

export interface ChatroomResponse {
  code: number;
  message: string;
  data: Chatroom[];
}
