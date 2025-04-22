import { useState, useEffect } from "react";
import { Button, List, Modal, Avatar, message, Form, Select, Spin, Input } from "antd";
import { TeamOutlined, PlusOutlined, InfoCircleOutlined, UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { chatroomApi, userApi } from "../../../services/api";
import { Chatroom, User } from "../../../types/api";

const Groups = () => {
  const [groupList, setGroupList] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Chatroom | null>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [createGroupForm] = Form.useForm();
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await chatroomApi.getGroupList();
        setGroupList(response.data.filter((group) => group.type === 2));
      } catch (error) {
        console.error("获取群聊列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    setCreateGroupVisible(true);
  };

  const handleCreateGroupCancel = () => {
    setCreateGroupVisible(false);
    createGroupForm.resetFields();
  };

  const handleCreateGroupSubmit = async (values: { name: string }) => {
    try {
      setCreateGroupLoading(true);
      await chatroomApi.createGroupChatroom(values.name);
      messageApi.success("群聊创建成功");
      handleCreateGroupCancel();
      // 刷新群聊列表
      const groupResponse = await chatroomApi.getGroupList();
      setGroupList(groupResponse.data.filter((group) => group.type === 2));
    } catch (error) {
      messageApi.error("创建群聊失败：" + error);
    } finally {
      setCreateGroupLoading(false);
    }
  };

  const showGroupDetails = async (group: Chatroom) => {
    setCurrentGroup(() => group);
    setIsModalVisible(true);
    try {
      setMembersLoading(true);
      const id = group.id;
      const response = await chatroomApi.getMembers(id);
      setGroupMembers(response.data);
    } catch (error) {
      messageApi.error("获取群聊成员失败");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentGroup(null);
    setGroupMembers([]);
  };

  const showAddMemberModal = () => {
    setAddMemberVisible(true);
  };

  const handleAddMemberCancel = () => {
    setAddMemberVisible(false);
    form.resetFields();
  };

  const handleSearchUser = async (value: string) => {
    if (!value.trim()) {
      setSearchUsers([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await userApi.searchUsers(value);
      setSearchUsers(response.data);
    } catch (error) {
      messageApi.error("搜索用户失败");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async (values: { id: number }) => {
    if (!currentGroup) return;

    try {
      await chatroomApi.joinChatroom(currentGroup.id, values.id);
      messageApi.success("操作成功");
      handleAddMemberCancel();
      // 重新获取成员列表
      const response = await chatroomApi.getMembers(currentGroup.id);
      setGroupMembers(response.data);
    } catch (error) {
      messageApi.error("添加成员失败：" + error);
    }
  };

  return (
    <div className="p-6 bg-white">
      {contextHolder}
      <div className="flex items-center justify-end mb-6">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateGroup}>
          创建群聊
        </Button>
      </div>
      <List
        loading={loading}
        dataSource={groupList}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <a key="list-details" onClick={() => showGroupDetails(item)}>
                <InfoCircleOutlined /> 详情
              </a>,
              <a key="list-enter">进入</a>,
            ]}
          >
            <List.Item.Meta avatar={<TeamOutlined />} title={item.name} description={`成员: ${item.membersCount}`} />
          </List.Item>
        )}
      />

      <Modal
        title={currentGroup ? `${currentGroup.name} - 成员列表` : "群聊成员"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
      >
        <div className="flex justify-end mb-4">
          <Button type="primary" icon={<UserAddOutlined />} onClick={showAddMemberModal}>
            添加成员
          </Button>
        </div>
        <List
          loading={membersLoading}
          dataSource={groupMembers}
          renderItem={(member) => (
            <List.Item key={member.id}>
              <List.Item.Meta avatar={<Avatar icon={<UserOutlined />} />} title={member.nickname || member.username} />
            </List.Item>
          )}
        />
      </Modal>

      <Modal title="添加群聊成员" open={addMemberVisible} onCancel={handleAddMemberCancel} footer={null}>
        <Form form={form} onFinish={handleAddMember} layout="vertical">
          <Form.Item name="id" rules={[{ required: true, message: "请选择用户" }]}>
            <Select
              showSearch
              placeholder="搜索用户名"
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={handleSearchUser}
              notFoundContent={searchLoading ? <Spin size="small" /> : null}
              options={searchUsers.map((user) => ({
                value: user.id,
                label: (
                  <div className="flex items-center">
                    <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
                    <span>{user.nickname || user.username}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="创建群聊" open={createGroupVisible} onCancel={handleCreateGroupCancel} footer={null}>
        <Form form={createGroupForm} onFinish={handleCreateGroupSubmit} layout="vertical">
          <Form.Item name="name" label="群聊名称" rules={[{ required: true, message: "请输入群聊名称" }]}>
            <Input placeholder="请输入群聊名称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={createGroupLoading}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Groups;
