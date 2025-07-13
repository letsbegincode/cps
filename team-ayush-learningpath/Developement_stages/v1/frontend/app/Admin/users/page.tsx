"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, X, Edit, Mail, Shield, Ban, Users, Calendar, Save, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string }>({ name: "", email: "", role: "" })
  const [editError, setEditError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch users from backend (now using User model)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { credentials: "include" })
      const data = await res.json()
      setUsers(data.data || [])
    } catch {
      setUsers([])
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Inline edit handlers
  const startEdit = (user: any) => {
    setEditId(user._id)
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user"
    })
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditError(null)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const saveEdit = async (userId: string) => {
    setEditError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to update user")
      }
      setEditId(null)
      fetchUsers()
    } catch (err: any) {
      setEditError(err.message || "Failed to update user")
    }
  }

  // Delete user handler
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    })
    fetchUsers()
  }

  // Suspend user handler (example)
  const handleSuspend = async (userId: string) => {
    alert("Suspend user feature not implemented.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/emergency-contacts")}>
            Go to Emergency Contacts
          </Button>
          <Button onClick={() => router.push("/admin")}>Return to Dashboard</Button>
        </div>
      </div>
      <div className="space-y-4">
        {users.map((user: any) => (
          <Card
            key={user._id}
            className="relative border-2 hover:shadow-lg transition-shadow"
            style={{
              borderColor:
                user.role === "admin"
                  ? "#a21caf"
                  : user.role === "user"
                  ? "#2563eb"
                  : "#d1d5db",
            }}
          >
            <CardHeader
              className="flex flex-row items-center justify-between cursor-pointer rounded-t-lg px-6 py-4 bg-white dark:bg-gray-800"
              onClick={() => setExpanded(expanded === user._id ? null : user._id)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {user.name}
                  </CardTitle>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <Badge
                  className={
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }
                >
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
              </div>
              <div>{expanded === user._id ? <ChevronUp /> : <ChevronDown />}</div>
            </CardHeader>
            {expanded === user._id && (
              <CardContent className="bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                {editId === user._id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Email:</span>
                      <Input
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="w-64"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Name:</span>
                      <Input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-64"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Role:</span>
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    {editError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <XCircle className="w-4 h-4" /> {editError}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="success"
                        onClick={() => saveEdit(user._id)}
                        className="flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex items-center gap-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Email:</span> {user.email}
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Joined:</span>{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Role:</span> {user.role}
                    </div>
                    {/* Add more user details as needed */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => startEdit(user)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Delete
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleSuspend(user._id)}
                        className="flex items-center gap-1"
                      >
                        <Ban className="w-4 h-4" /> Suspend
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        ))}
        {users.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            No users found.
          </div>
        )}
      </div>
    </div>
  )
}
