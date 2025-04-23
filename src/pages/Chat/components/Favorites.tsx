import { useEffect, useState } from "react";
import { List, Button, message, Spin, Popconfirm } from "antd";
import { StarOutlined, DeleteOutlined } from "@ant-design/icons";
import { favoriteApi } from "../../../services/api";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteApi.getFavoriteList();
      setFavorites(response.data);
    } catch (error) {
      messageApi.error("获取收藏列表失败，请检查网络连接");
      console.error("获取收藏列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await favoriteApi.deleteFavorite(id);

      messageApi.success("删除收藏成功");
      // 更新列表，移除已删除的收藏
      fetchFavorites();
    } catch (error) {
      messageApi.error("删除收藏失败，请检查网络连接");
      console.error("删除收藏错误:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="p-6 bg-white">
      {contextHolder}
      <Spin spinning={loading}>
        {favorites.length > 0 ? (
          <List
            dataSource={favorites}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Popconfirm title="确定要删除这个收藏吗？" onConfirm={() => handleDelete(item.id)} okText="确定" cancelText="取消">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={item.chatHistory.content}
                  description={
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>{new Date(item.chatHistory.createdAt).toLocaleString()}</span>
                      <span>-</span>
                      <span>来自群聊: {item.chatroom?.name || "未知群聊"}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">{loading ? "" : "暂无收藏内容"}</div>
        )}
      </Spin>
    </div>
  );
};

export default Favorites;
