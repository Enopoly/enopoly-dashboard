import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export const Layout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
