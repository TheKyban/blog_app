"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PenTool, FileText, Home, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      current: pathname === "/admin",
    },
    {
      name: "All Posts",
      href: "/admin/posts",
      icon: FileText,
      current: pathname === "/admin/posts",
    },
    {
      name: "Create Post",
      href: "/admin/posts/create",
      icon: Plus,
      current: pathname === "/admin/posts/create",
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/admin/login");
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 relative bg-white shadow-sm border-r border-slate-200 min-h-screen">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Blog Admin</h1>
            </div>
          </div>

          <nav className="px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <Button
                        variant={item.current ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start transition-all duration-200",
                          item.current
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                            : "hover:bg-slate-100"
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-4 right-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
