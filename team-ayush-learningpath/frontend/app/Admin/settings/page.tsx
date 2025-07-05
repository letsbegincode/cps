"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCircle, Loader2, CheckCircle2, XCircle, ArrowLeft, Edit, Save, X } from "lucide-react";
import Image from "next/image";

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "", 
    avatarUrl: "" 
  });
  const [originalForm, setOriginalForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "", 
    avatarUrl: "" 
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, { credentials: "include" })
      .then(async res => {
        if (res.status === 200) {
          const data = await res.json();
          setAdmin(data);
          const formData = {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            avatarUrl: data.avatarUrl || "",
          };
          setForm(formData);
          setOriginalForm(formData);
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!edit) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEdit(true);
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setForm(originalForm);
    setEdit(false);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!edit) return;
    
    setSaving(true);
    setSuccess(null);
    setError(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      // Fix: Check for 401/403 and show a proper error
      if (res.status === 401 || res.status === 403) {
        setError("Session expired. Please login again.");
        setSaving(false);
        return;
      }
      
      if (res.ok) {
        const updated = await res.json();
        setAdmin(updated);
        const newFormData = {
          firstName: updated.firstName || "",
          lastName: updated.lastName || "",
          email: updated.email || "",
          phone: updated.phone || "",
          avatarUrl: updated.avatarUrl || "",
        };
        setForm(newFormData);
        setOriginalForm(newFormData);
        setSuccess("Profile updated successfully!");
        setEdit(false);
      } else {
        const err = await res.json();
        setError(err.message || "Failed to update profile.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return (
      form.firstName !== originalForm.firstName ||
      form.lastName !== originalForm.lastName ||
      form.phone !== originalForm.phone ||
      form.avatarUrl !== originalForm.avatarUrl
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          
          {!edit ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges()}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <div className="relative">
              {form.avatarUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={form.avatarUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <UserCircle className="w-24 h-24 text-gray-400" />
              )}
              {edit && (
                <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
                  <Edit className="w-4 h-4 text-purple-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl font-bold text-center mt-4">
              {form.firstName} {form.lastName}
            </CardTitle>
            <CardDescription className="text-center">
              Administrator Profile Settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <Input 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange} 
                    disabled={!edit || saving}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <Input 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={handleChange} 
                    disabled={!edit || saving}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    disabled
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <Input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    disabled={!edit || saving}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
                  <Input 
                    name="avatarUrl" 
                    value={form.avatarUrl} 
                    onChange={handleChange} 
                    disabled={!edit || saving}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              
              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
                  <XCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}