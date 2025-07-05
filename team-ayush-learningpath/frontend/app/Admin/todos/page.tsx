"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Plus, ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminTodosPage() {
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const router = useRouter();

  const fetchTodos = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, { credentials: "include" });
    const data = await res.json();
    setTodos(Array.isArray(data.todos) ? data.todos : []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim()) {
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
    }
  };

  const removeTodo = async (index: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/todos/${index}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      {/* Navbar with Return to Dashboard */}
      <div className="flex items-center justify-between mb-8">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/admin")}
        >
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage To-Do List</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Return to Dashboard
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Check className="w-5 h-5 text-green-600" />
            <span>All To-Do Tasks</span>
            <Badge className="bg-blue-100 text-blue-700 ml-2">{todos.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Add new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
            />
            <Button onClick={addTodo} className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {todos.length > 0 ? (
              todos.map((todo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 group hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-gray-800 dark:text-gray-200 truncate">{todo}</span>
                  </div>
                  <button
                    onClick={() => removeTodo(index)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">No tasks yet</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add tasks to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
