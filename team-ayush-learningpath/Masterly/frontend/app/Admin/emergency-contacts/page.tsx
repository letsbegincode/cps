"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X, Check, AlertTriangle, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const fetchContacts = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emergency-contacts`, { credentials: "include" });
    const data = await res.json();
    setContacts(data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emergency-contacts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    fetchContacts();
  };

  const deleteContact = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emergency-contacts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchContacts();
  };

  const statusColor = (status: string) => {
    if (status === "pending") return "bg-red-500 text-white";
    if (status === "abated") return "bg-yellow-400 text-black";
    if (status === "resolved") return "bg-green-500 text-white";
    return "";
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            Go to User Management
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {contacts.map((c) => (
          <Card key={c._id} className="relative border-2"
            style={{
              borderColor:
                c.status === "pending"
                  ? "#ef4444"
                  : c.status === "abated"
                  ? "#facc15"
                  : "#22c55e"
            }}
          >
            <CardHeader
              className={`flex flex-row items-center justify-between cursor-pointer rounded-t-lg px-6 py-4 ${statusColor(c.status)}`}
              onClick={() => setExpanded(expanded === c._id ? null : c._id)}
            >
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    c.status === "pending"
                      ? "bg-red-600 text-white"
                      : c.status === "abated"
                      ? "bg-yellow-400 text-black"
                      : "bg-green-600 text-white"
                  }
                >
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </Badge>
                <CardTitle className="text-lg">{c.subject}</CardTitle>
              </div>
              <div>
                {expanded === c._id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expanded === c._id && (
              <CardContent className="bg-white dark:bg-gray-900 rounded-b-lg">
                <div className="mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">From:</span> {c.name} ({c.email})
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Message:</span>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-1">{c.message}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  {c.status !== "resolved" && (
                    <Button
                      variant="success"
                      onClick={() => updateStatus(c._id, "resolved")}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Mark as Resolved
                    </Button>
                  )}
                  {c.status !== "abated" && (
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(c._id, "abated")}
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="w-4 h-4" /> Mark as Abated
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => deleteContact(c._id)}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        {contacts.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            No emergency contacts found.
          </div>
        )}
      </div>
    </div>
  );
}
