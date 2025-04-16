import { List } from "antd";
import { StarOutlined } from "@ant-design/icons";

const Favorites = () => {
  const favorites = [
    { id: 1, title: "重要消息" },
    { id: 2, title: "项目文档" },
    { id: 3, title: "学习资料" },
  ];

  return (
    <div className="p-6 bg-white">
      <List
        dataSource={favorites}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta avatar={<StarOutlined />} title={item.title} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Favorites;
