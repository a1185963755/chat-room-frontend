import { Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo")!);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const items = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-white flex items-center justify-between px-6 ">
        <h1 className="text-xl font-bold">聊天室</h1>

        <Dropdown menu={{ items }} placement="bottomRight">
          <div className="flex gap-1 items-center">
            <Avatar icon={<UserOutlined />} className="cursor-pointer" />
            {userInfo?.nickname}
          </div>
        </Dropdown>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
