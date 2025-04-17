import { useState, useEffect } from "react";
import { Button, Avatar, List, Pagination, Modal, Form, Input, message } from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { friendshipApi } from "../../../services/api";
import { Friendship } from "../../../types/api";

const Friends = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [messageApi, contextHolder] = message.useMessage();

  const [friendList, setFriendList] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await friendshipApi.getFriendList();
      setFriendList(response.data);
    } catch (error) {
      console.error("获取好友列表失败:", error);
      messageApi.error("获取好友列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSendRequest = async (values: { friendId: number; reason: string }) => {
    try {
      await friendshipApi.sendFriendRequest({
        friendId: values.friendId,
        reason: values.reason,
      });
      messageApi.success("好友请求已发送");
      handleModalCancel();
    } catch (error: string | any) {
      messageApi.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-white">
      {contextHolder}
      <div className="flex items-center justify-end mb-6">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFriend}>
          添加好友
        </Button>
      </div>
      <List
        loading={loading}
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

      <Modal title="添加好友" open={isModalOpen} onCancel={handleModalCancel} footer={null}>
        <Form form={form} onFinish={handleSendRequest} layout="vertical">
          <Form.Item name="friendId" rules={[{ required: true, message: "请输入用户ID" }]}>
            <Input placeholder="请输入用户ID" />
          </Form.Item>
          <Form.Item name="reason" rules={[{ required: true, message: "请输入添加原因" }]}>
            <Input.TextArea placeholder="请输入添加原因" rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              发送请求
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Friends;
