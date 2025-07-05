"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Trophy,
  Target,
  BookOpen,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Camera,
  Edit,
  Save,
  Github,
  Linkedin,
  Globe,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    github: "",
    linkedin: "",
    joinDate: "",
    timezone: "PST",
    language: "English",
  })

  // Populate from real user data when available
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        github: user.githubId || "",
      }))
    }
  }, [user])

  const achievements = [
    { title: "First Course Completed", date: "March 2024", icon: Trophy, color: "text-yellow-500" },
    { title: "7-Day Streak", date: "April 2024", icon: Target, color: "text-blue-500" },
    { title: "Quiz Master", date: "May 2024", icon: BookOpen, color: "text-purple-500" },
    { title: "Speed Demon", date: "June 2024", icon: Trophy, color: "text-green-500" },
  ]

  const learningStats = [
    { label: "Courses Completed", value: "8", icon: BookOpen },
    { label: "Total Study Hours", value: "156", icon: Calendar },
    { label: "Concepts Mastered", value: "234", icon: Target },
    { label: "Current Streak", value: "15 days", icon: Trophy },
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Manage your personal details and public profile
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" />
                          <AvatarFallback className="text-lg">AJ</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profileData.name}</h3>
                        <p className="text-muted-foreground">Premium Member</p>
                        <Badge className="mt-1 bg-gradient-to-r from-blue-500 to-purple-500">Level 12 Learner</Badge>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={isEditing ? profileData.name : (profileData.name || 'Not set')}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? profileData.email : (profileData.email || 'Not set')}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={isEditing ? profileData.phone : (profileData.phone || 'Not set')}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={isEditing ? profileData.location : (profileData.location || 'Not set')}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? profileData.bio : (profileData.bio || 'Not set')}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Social Links</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website" className="flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            value={isEditing ? profileData.website : (profileData.website || 'Not set')}
                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github" className="flex items-center">
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                          </Label>
                          <Input
                            id="github"
                            value={isEditing ? profileData.github : (profileData.github || 'Not set')}
                            onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                            disabled={!isEditing}
                            placeholder="username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="flex items-center">
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={isEditing ? profileData.linkedin : (profileData.linkedin || 'Not set')}
                            onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                            disabled={!isEditing}
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Learning Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {learningStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <stat.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-gray-900 dark:text-white">{stat.label}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Account Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span className="text-gray-900 dark:text-white">{profileData.joinDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <Badge>Premium</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Current Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-900 dark:text-white">Complete DSA Course</span>
                        <span className="text-gray-900 dark:text-white">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-900 dark:text-white">30-Day Streak</span>
                        <span className="text-gray-900 dark:text-white">50%</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-900 dark:text-white">System Design Mastery</span>
                        <span className="text-gray-900 dark:text-white">30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="dark:bg-gray-800/80 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Your Achievements</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Celebrate your learning milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
                    >
                      <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                        <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Email notifications", description: "Receive updates via email" },
                    { label: "Push notifications", description: "Get notified on your device" },
                    { label: "Course reminders", description: "Reminders for scheduled learning" },
                    { label: "Achievement alerts", description: "Celebrate your milestones" },
                    { label: "Weekly progress reports", description: "Summary of your learning" },
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch defaultChecked={index < 3} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Settings className="w-5 h-5 mr-2" />
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Customize your learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="english">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="pst">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Standard Time</SelectItem>
                        <SelectItem value="est">Eastern Standard Time</SelectItem>
                        <SelectItem value="cst">Central Standard Time</SelectItem>
                        <SelectItem value="mst">Mountain Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty Preference</Label>
                    <Select defaultValue="adaptive">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download My Data
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing tab and content removed as requested */}
        </Tabs>
      </div>
    </div>
  )
}
