import { useState } from "react";
import { Menu, Button } from "antd";
import { UserOutlined, TeamOutlined, MessageOutlined, StarOutlined, BellOutlined, PlusOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("1");

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
    navigate(key);
  };

  const menuItems = [
    { key: "1", icon: <UserOutlined />, label: "好友" },
    { key: "2", icon: <TeamOutlined />, label: "群聊" },
    { key: "3", icon: <MessageOutlined />, label: "聊天" },
    { key: "4", icon: <StarOutlined />, label: "收藏" },
    { key: "5", icon: <BellOutlined />, label: "通知" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[200px] bg-white flex flex-col h-full">
        <Menu mode="inline" selectedKeys={[selectedKey]} onClick={handleMenuClick} items={menuItems} className="flex-1 overflow-y-auto" />
      </div>
      <div className="flex-1 bg-white h-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Chat;
