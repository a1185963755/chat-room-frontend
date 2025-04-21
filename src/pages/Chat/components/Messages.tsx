import { useState, useEffect, useRef } from "react";
import { List, Input, Avatar } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { getSocket } from "../../../services/socket";
import { chatroomApi } from "../../../services/api";

interface Message {
  id: number;
  message: {
    content: string;
    type: number;
  };
  senderId: number;
  time: string;
  type?: string; // 消息类型，joinRoom表示加入群聊的系统消息
  chatroomId?: number; // 群聊ID
}

interface Chatroom {
  id: number;
  name: string;
  membersCount: number;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [groupList, setGroupList] = useState<Chatroom[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Chatroom | null>(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await chatroomApi.getGroupList();
        setGroupList(response.data);
        if (response.data.length > 0) {
          setSelectedGroup(response.data[0]);
        }
      } catch (error) {
        console.error("获取群聊列表失败:", error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;

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
      const newMessage = {
        senderId: userInfo.id,
        chatroomId: selectedGroup.id,
        message: {
          content: inputValue,
          type: 0,
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

  return (
    <div className="flex h-full">
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
                      >
                        <div className="text-sm">{item.message.content}</div>
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
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="输入消息..."
            className="mt-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
