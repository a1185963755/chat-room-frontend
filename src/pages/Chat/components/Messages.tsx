import { useState, useEffect, useRef } from "react";
import { List, Input, Avatar, Popover, Button, message } from "antd";
import { UserOutlined, TeamOutlined, SmileOutlined } from "@ant-design/icons";
import { getSocket } from "../../../services/socket";
import { chatroomApi, chatHistoryApi, favoriteApi } from "../../../services/api";
import { useLocation } from "react-router-dom";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
interface Message {
  id: number;
  message: {
    content: string;
    type: number; // 0: 文本消息, 1: 图片消息
  };
  senderId: number;
  time: string;
  type?: string; // 消息类型，joinRoom表示加入群聊的系统消息
  chatroomId?: number; // 群聊ID
  content?: string;
  createdAt?: string;
}

interface Chatroom {
  id: number;
  name: string;
  membersCount: number;
}

const Messages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [groupList, setGroupList] = useState<Chatroom[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Chatroom | null>(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();
  useEffect(() => {
    setSelectedGroup(location.state?.chatroomId);
  }, [location.state?.chatroomId]);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await chatroomApi.getGroupList();
        setGroupList(response.data);

        if (response.data.length > 0) {
          if (location.state?.chatRoomId) {
            const chatRoomId = location.state?.chatRoomId;
            const foundgroup = response.data.find((group) => group.id === chatRoomId);
            setSelectedGroup(foundgroup!);
          } else {
            setSelectedGroup(response.data[0]);
          }
        }
      } catch (error) {
        console.error("获取群聊列表失败:", error);
      }
    };

    fetchGroups();
  }, []);

  // 当selectedGroup变化时，获取聊天历史记录
  useEffect(() => {
    if (!selectedGroup) return;

    // 获取该群聊的历史消息
    fetchChatHistory(selectedGroup.id);

    const socket = getSocket();
    socket.emit("joinRoom", {
      chatroomId: selectedGroup.id,
      userId: userInfo.nickname,
    });

    socket.on("message", (newMessage: Message) => {
      const { type } = newMessage;
      if (type === "joinRoom") {
        const joinMessage: Message = {
          id: Date.now(),
          message: {
            content: `${newMessage.senderId} 加入了群聊`,
            type: 0,
          },
          senderId: 0, // 系统消息发送者ID为0
          time: newMessage.time,
          type: "joinRoom",
        };
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages, joinMessage];
          return newMessages;
        });
        return;
      }
      if (type === "leaveRoom") {
        if (newMessage.chatroomId !== selectedGroup.id) {
          return;
        }
        const joinMessage: Message = {
          id: Date.now(),
          message: {
            content: `${newMessage.senderId} 退出了群聊`,
            type: 0,
          },
          senderId: 0, // 系统消息发送者ID为0
          time: newMessage.time,
          type: "leaveRoom",
        };
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages, joinMessage];
          return newMessages;
        });
        return;
      }
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, newMessage];
        setTimeout(() => scrollToBottom(), 100);
        return newMessages;
      });
    });

    return () => {
      socket.emit("leaveRoom", {
        chatroomId: selectedGroup.id,
        userId: userInfo.nickname,
      });
      socket.off("message");
    };
  }, [selectedGroup]);

  const handleSendMessage = () => {
    if (inputValue.trim() && selectedGroup) {
      const socket = getSocket();

      // 检查消息是否包含base64图片数据
      const isImageMessage = inputValue.includes("data:image");

      const newMessage = {
        senderId: userInfo.id,
        chatroomId: selectedGroup.id,
        message: {
          content: inputValue,
          type: isImageMessage ? 1 : 0, // 1: 图片类型, 0: 文本类型
        },
      };

      socket.emit("sendMessage", newMessage);
      setInputValue("");
    }
  };

  const handleGroupSelect = (group: Chatroom) => {
    setSelectedGroup(group);
    setMessages([]);
  };

  // 获取聊天历史记录
  const fetchChatHistory = async (chatroomId: number) => {
    try {
      const response = await chatHistoryApi.getChatHistory(chatroomId);
      if (response.data && response.data.length > 0) {
        const transformedMessages = response.data.map((message: Message) => {
          return {
            ...message,
            message: {
              content: message.content,
              type: message.type, // 确保正确处理图片类型消息
            },
            time: message.createdAt,
          };
        });
        setMessages(transformedMessages);
        // 使用requestAnimationFrame确保DOM已更新后滚动到底部
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    } catch (error) {
      console.error("获取聊天记录失败:", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // 当消息列表变化时，滚动到底部
  useEffect(() => {
    // 使用requestAnimationFrame确保DOM已更新
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages]);

  const handleAddFavorite = async (chatHistoryId: number) => {
    try {
      await favoriteApi.addFavorite(chatHistoryId);
      messageApi.success("收藏成功");
    } catch (error) {
      messageApi.error("收藏失败");
    }
  };
  return (
    <div className="flex h-full">
      {contextHolder}
      <div className="w-[240px] border-r border-gray-200 bg-white overflow-y-auto">
        <List
          dataSource={groupList}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              onClick={() => handleGroupSelect(item)}
              className={`cursor-pointer hover:bg-gray-50 ${selectedGroup?.id === item.id ? "bg-gray-100" : ""}`}
            >
              <List.Item.Meta avatar={<TeamOutlined style={{ fontSize: "24px" }} />} title={item.name} description={`${item.membersCount}个成员`} />
            </List.Item>
          )}
        />
      </div>
      <div className="flex-1 flex flex-col h-full">
        {selectedGroup && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-medium">{selectedGroup.name}</h2>
          </div>
        )}
        <div className="flex-1 p-6 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4" id="messages-container">
            <List
              dataSource={messages}
              renderItem={(item) =>
                item.type === "joinRoom" || item.type === "leaveRoom" ? (
                  // 加入群聊的系统消息显示在中间
                  <List.Item key={item.id} className="w-fit mx-auto !border-none">
                    <div className="inline-block px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                      {item.message.content}
                      <span className="ml-2 text-gray-400">{new Date(item.time).toLocaleTimeString()}</span>
                    </div>
                  </List.Item>
                ) : (
                  // 普通聊天消息
                  <List.Item key={item.id} className={`flex ${item.senderId === userInfo.id ? "!justify-end" : "!justify-start"} !border-none`}>
                    <div className={`flex ${item.senderId === userInfo.id ? "flex-row-reverse" : "flex-row"} items-start max-w-[70%] gap-2`}>
                      <Avatar icon={<UserOutlined />} />
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          item.senderId === userInfo.id ? "bg-blue-500 text-white rounded-tr-none" : "bg-gray-100 rounded-tl-none"
                        }`}
                        onDoubleClick={() => handleAddFavorite(item.id)}
                      >
                        {item.message.type === 1 ? (
                          <div className="text-sm">
                            <img src={item.message.content} alt="图片消息" className="max-w-full rounded" style={{ maxHeight: "200px" }} />
                          </div>
                        ) : (
                          <div className="text-sm">{item.message.content}</div>
                        )}
                        <div className="text-xs mt-1">{new Date(item.time).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </List.Item>
                )
              }
              className="space-y-4"
            />
            <div ref={messagesEndRef} />
          </div>
          <div className="flex mt-auto">
            <Popover
              content={
                <EmojiPicker
                  data={data}
                  onEmojiSelect={(emoji: any) => {
                    setInputValue((inputText) => inputText + emoji.native);
                  }}
                />
              }
              title="表情"
              trigger="click"
            >
              <Button icon={<SmileOutlined />} className="mr-2" />
            </Popover>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="输入消息..."
              className="flex-1"
            />
            <Button type="primary" onClick={handleSendMessage} className="ml-2">
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
