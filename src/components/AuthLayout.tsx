import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFDFD] to-[#F8F9FD] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[520px]">
        {/* The Outlet renders the child route (Login or Register) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
