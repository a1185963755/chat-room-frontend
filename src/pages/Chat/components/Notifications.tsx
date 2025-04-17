import { useState, useEffect } from "react";
import { Tabs, List, Avatar, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { friendshipApi } from "../../../services/api";

interface FriendRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  reason: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface FriendRequestResponse {
  code: number;
  message: string;
  data: FriendRequest[];
}

const Notifications = () => {
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = (await friendshipApi.getFriendRequestList()) as FriendRequestResponse;
      const requests = response.data;

      // 从本地存储获取用户信息
      const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
      const currentUserId = userInfo.id;
      const sent = requests.filter((req) => req.fromUserId === currentUserId);
      const received = requests.filter((req) => req.toUserId === currentUserId);

      setSentRequests(sent);
      setReceivedRequests(received);
    } catch (error: unknown) {
      console.error("获取好友请求列表失败:", error);
      messageApi.error("获取好友请求列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    // 每30秒刷新一次
    const timer = setInterval(fetchFriendRequests, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleAcceptRequest = async (friendId: number) => {
    try {
      await friendshipApi.updateFriendRequest({
        friendId,
        status: 1,
      });
      messageApi.success("已接受好友请求");
      fetchFriendRequests();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "操作失败";
      messageApi.error(errorMessage);
    }
  };

  const handleRejectRequest = async (friendId: number) => {
    try {
      await friendshipApi.updateFriendRequest({
        friendId,
        status: 2,
      });
      messageApi.success("已拒绝好友请求");
      fetchFriendRequests();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "操作失败";
      messageApi.error(errorMessage);
    }
  };

  const renderRequestItem = (item: FriendRequest, isSent: boolean) => {
    const userId = isSent ? item.toUserId : item.fromUserId;
    const actions = [];

    if (!isSent && item.status === 0) {
      actions.push(
        <Button key="accept" type="link" onClick={() => handleAcceptRequest(item.fromUserId)}>
          接受
        </Button>,
        <Button key="reject" type="link" danger onClick={() => handleRejectRequest(item.fromUserId)}>
          拒绝
        </Button>
      );
    }

    return (
      <List.Item key={item.id} actions={actions}>
        <List.Item.Meta
          avatar={<Avatar icon={<UserOutlined />} />}
          title={`用户ID: ${userId}`}
          description={
            <div className="space-y-2">
              <div className="text-base">{item.reason}</div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span>-</span>
                <span className={`${item.status === 0 ? "text-blue-500" : item.status === 1 ? "text-green-500" : "text-red-500"}`}>
                  {item.status === 0 ? "等待处理" : item.status === 1 ? "已接受" : item.status === 2 ? "已拒绝" : "未知状态"}
                </span>
              </div>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <div className="p-6 bg-white">
      {contextHolder}
      <Tabs
        items={[
          {
            key: "received",
            label: "收到的请求",
            children: (
              <List
                loading={loading}
                dataSource={receivedRequests}
                renderItem={(item) => renderRequestItem(item, false)}
                locale={{ emptyText: "暂无收到的好友请求" }}
              />
            ),
          },
          {
            key: "sent",
            label: "发出的请求",
            children: (
              <List
                loading={loading}
                dataSource={sentRequests}
                renderItem={(item) => renderRequestItem(item, true)}
                locale={{ emptyText: "暂无发出的好友请求" }}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Notifications;
