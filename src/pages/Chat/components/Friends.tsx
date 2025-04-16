import { useState, useEffect } from "react";
import { Button, Avatar, List, Pagination } from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { friendshipApi } from "../../../services/api";
import { Friendship } from "../../../types/api";

const Friends = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [friendList, setFriendList] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await friendshipApi.getFriendList();
        setFriendList(response.data);
      } catch (error) {
        console.error("获取好友列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleAddFriend = () => {
    console.log("添加好友");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex items-center justify-end mb-6">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFriend}>
          添加好友
        </Button>
      </div>
      <List
        dataSource={friendList}
        renderItem={(item) => (
          <List.Item key={item.id} actions={[<a key="list-delete">聊天</a>]}>
            <List.Item.Meta avatar={<Avatar icon={<UserOutlined />} />} title={item.nickname || item.username} />
          </List.Item>
        )}
      />
      <div className="mt-4 flex justify-center">
        <Pagination current={currentPage} total={5} pageSize={pageSize} onChange={handlePageChange} />
      </div>
    </div>
  );
};

export default Friends;
