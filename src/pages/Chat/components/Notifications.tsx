import { List } from "antd";
import { BellOutlined } from "@ant-design/icons";

const Notifications = () => {
  const notifications = [
    { id: 1, title: "系统通知", description: "新版本已发布" },
    { id: 2, title: "好友请求", description: "张三请求添加你为好友" },
    { id: 3, title: "群聊邀请", description: "李四邀请你加入前端开发群" },
  ];

  return (
    <div className="p-6 bg-white">
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta avatar={<BellOutlined />} title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Notifications;
