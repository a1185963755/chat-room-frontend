import { useState, useEffect } from "react";
import { Button, List } from "antd";
import { TeamOutlined, PlusOutlined } from "@ant-design/icons";
import { chatroomApi } from "../../../services/api";
import { Chatroom } from "../../../types/api";

const Groups = () => {
  const [groupList, setGroupList] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await chatroomApi.getGroupList();
        setGroupList(response.data);
      } catch (error) {
        console.error("获取群聊列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    console.log("创建群聊");
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex items-center justify-end mb-6">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateGroup}>
          创建群聊
        </Button>
      </div>
      <List
        dataSource={groupList}
        renderItem={(item) => (
          <List.Item key={item.id} actions={[<a key="list-enter">进入</a>]}>
            <List.Item.Meta avatar={<TeamOutlined />} title={item.name} description={`成员: ${item.membersCount}`} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Groups;
