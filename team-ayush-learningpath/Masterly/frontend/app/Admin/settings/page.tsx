"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", avatarUrl: "" });
  const [originalForm, setOriginalForm] = useState({ firstName: "", lastName: "", email: "", phone: "", avatarUrl: "" });
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-2xl flex flex-col">
        <Button
          variant="outline"
          className="mb-6 self-start"
          onClick={() => router.push("/admin")}
        >
          ← Back to Dashboard
        </Button>
        <Card className="w-full shadow-xl">
          <CardHeader className="flex flex-col items-center">
            <UserCircle className="w-20 h-20 text-gray-400 mb-2" />
            <CardTitle className="text-3xl font-bold text-center">Admin Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="firstName" label="First Name" placeholder="First Name" value={form.firstName} onChange={handleChange} disabled={!edit || saving} />
                <Input name="lastName" label="Last Name" placeholder="Last Name" value={form.lastName} onChange={handleChange} disabled={!edit || saving} />
                <Input name="email" label="Email" placeholder="Email" value={form.email} onChange={handleChange} disabled />
                <Input name="phone" label="Phone" placeholder="Phone" value={form.phone} onChange={handleChange} disabled={!edit || saving} />
                <Input name="avatarUrl" label="Avatar URL" placeholder="Avatar URL" value={form.avatarUrl} onChange={handleChange} disabled={!edit || saving} />
              </div>
              
              {success && (
                <div className="flex items-center text-green-600 text-sm font-medium gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {success}
                </div>
              )}
              {error && (
                <div className="flex items-center text-red-500 text-sm font-medium gap-2">
                  <XCircle className="w-5 h-5" /> {error}
                </div>
              )}
              
              <div className="flex gap-2">
                {!edit ? (
                  <Button type="button" className="flex-1" onClick={handleEdit}>
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={saving || !hasChanges()}
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </span>
                      ) : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}