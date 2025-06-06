export interface CommonResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
  members: User[];
}

export interface ChatroomResponse {
  code: number;
  message: string;
  data: Chatroom[];
}

export interface ApiError {
  code: number;
  message: string;
}

export interface FriendRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  reason: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestResponse {
  code: number;
  message: string;
  data: FriendRequest[];
}

export interface Favorite {
  id: number;
  userId: number;
  chatHistoryId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FavoriteResponse {
  code: number;
  message: string;
  data: Favorite[];
}
