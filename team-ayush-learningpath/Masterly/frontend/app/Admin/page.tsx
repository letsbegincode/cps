"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, LogOut, Settings, User, 
  BookOpen, Users, BarChart2, Activity,
  Mail, Shield, Server, ArrowRight,
  ChevronDown, Check, Plus, X
} from "lucide-react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications] = useState<number>(3);
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
          credentials: "include"
        });

        if (res.status === 401 || res.status === 403) {
          if (!ignore) {
            setAdmin(null);
            setLoading(false);
            if (window.location.pathname !== "/admin/login") {
              window.location.href = "/admin/login";
            }
          }
          return;
        }

        const data = await res.json();
        if (!ignore) {
          setAdmin(data);
          setTodos(Array.isArray(data.todos) ? data.todos : []);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          setAdmin(null);
          setLoading(false);
          if (window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
      }
    };

    fetchAdminData();
    return () => { ignore = true; };
  }, []);

  // Add todo and sync with backend
  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/todos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ todo: newTodo.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          setTodos(data.todos);
          setNewTodo("");
        }
      } catch {}
    }
  };

  // Remove todo by index and sync with backend
  const removeTodo = async (index: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/todos/${index}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos);
      }
    } catch {}
  };

  const toggleTodo = (index: number) => {
    removeTodo(index);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setAdmin(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    router.push("/admin/settings");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-lg text-gray-500 dark:text-gray-400">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative text-gray-600 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-full h-10 w-10"
              >
                <Bell className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            </div>

            <div className="relative profile-dropdown">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200/50 dark:border-gray-600/50 group-hover:border-purple-500 transition-all">
                  <Image
                    src={admin.avatarUrl || "/avatar-placeholder.png"}
                    alt="Admin"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{admin?.firstName} {admin?.lastName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Admin</div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{admin?.firstName} {admin?.lastName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{admin?.email}</div>
                  </div>
                  <button
                    className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleSettings}
                  >
                    <Settings className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    <span>Settings</span>
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Banner */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="text-purple-600 dark:text-purple-400">{admin?.firstName}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your portal today.
          </p>
        </div>

        {/* Section 1: Admin Profile & Priority Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="space-y-5">
            <Card className="hover:shadow-lg transition-shadow group border-0 shadow-sm dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Profile</CardTitle>
                <User className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-200">
                    <Image
                      src={admin.avatarUrl || "/avatar-placeholder.png"}
                      alt="Admin"
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {admin?.firstName} {admin?.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{admin?.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin?.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group border-0 shadow-sm dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Stats</CardTitle>
                <BarChart2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pending Tasks</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">5</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">New Users</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">12</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>My To-Do List</span>
                  </CardTitle>
                  <Badge className="bg-purple-100 text-purple-700">
                    {todos.length} {todos.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="What needs to be done?"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="flex-1"
                  />
                  <Button onClick={addTodo} className="whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </Button>
                </div>

                {todos.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {todos.map((todo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 group hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleTodo(index)}
                            className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100" />
                          </button>
                          <span className="text-gray-800 dark:text-gray-200 truncate">{todo}</span>
                        </div>
                        <button
                          onClick={() => removeTodo(index)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Your to-do list is empty</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Add tasks to stay organized
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Priority Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Review Emergency Contacts</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">3 pending approvals</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/admin/emergency-contacts")}>
                      Review
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Approve New Users</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 pending requests</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/admin/user-approvals")}>
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        {/* Section 2: Quick Management */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Quick Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="hover:shadow-xl transition-all duration-300 group hover:scale-[1.03] border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <BookOpen className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">Courses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Manage all courses</p>
                <Button variant="link" size="sm" className="mt-3 text-purple-600 dark:text-purple-400 group-hover:underline">
                  View <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 group hover:scale-[1.03] border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">Users</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Manage all users</p>
                <Button variant="link" size="sm" className="mt-3 text-blue-600 dark:text-blue-400 group-hover:underline">
                  View <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 group hover:scale-[1.03] border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <BarChart2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">View portal stats</p>
                <Button variant="link" size="sm" className="mt-3 text-green-600 dark:text-green-400 group-hover:underline">
                  View <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 group hover:scale-[1.03] border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                  <Server className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">System</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Check system health</p>
                <Button variant="link" size="sm" className="mt-3 text-red-600 dark:text-red-400 group-hover:underline">
                  View <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}