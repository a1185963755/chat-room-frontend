import { useState } from "react";
import { List, Input } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const Messages = () => {
  const [messages, setMessages] = useState([
    { id: 1, content: "你好！" },
    { id: 2, content: "最近怎么样？" },
    { id: 3, content: "有空一起吃饭吗？" },
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { id: messages.length + 1, content: inputValue }]);
      setInputValue("");
    }
  };

  return (
    <div className="p-6 bg-white flex flex-col h-full">
      <List
        dataSource={messages}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta avatar={<MessageOutlined />} title={item.content} />
          </List.Item>
        )}
        className="flex-1 overflow-y-auto"
      />
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={handleSendMessage}
        placeholder="输入消息..."
        className="mt-4"
      />
    </div>
  );
};

export default Messages;
