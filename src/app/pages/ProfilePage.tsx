import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { User, Mail, Building, Shield, Activity, Bell } from "lucide-react";
import { Switch } from "../components/ui/switch";

export function ProfilePage() {
  const recentActivity = [
    { action: "Submitted incident report", id: "INC-2026-001298", time: "2 hours ago" },
    { action: "Updated vessel information", id: "INC-2026-001234", time: "5 hours ago" },
    { action: "Exported analytics data", id: "CSV Report", time: "1 day ago" },
    { action: "Reviewed incident", id: "INC-2026-001189", time: "2 days ago" },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarFallback className="bg-blue-600 text-white text-2xl">AD</AvatarFallback>
              </Avatar>
              <h2 className="text-xl text-slate-900 mb-1">Admin User</h2>
              <p className="text-sm text-slate-600 mb-3">admin@marina.gov.ph</p>
              <Badge className="bg-blue-600">Administrator</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Reports Submitted</span>
                <span className="text-sm text-slate-900">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Reports Reviewed</span>
                <span className="text-sm text-slate-900">187</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Member Since</span>
                <span className="text-sm text-slate-900">Jan 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last Login</span>
                <span className="text-sm text-slate-900">Today, 9:32 AM</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="text-sm">
                  <div className="text-slate-900">{activity.action}</div>
                  <div className="text-xs text-slate-500">
                    {activity.id} • {activity.time}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="col-span-2">
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account Details</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input placeholder="Juan" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input placeholder="Dela Cruz" />
                    </div>
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="admin@marina.gov.ph" />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" placeholder="+63 912 345 6789" />
                  </div>

                  <div>
                    <Label>Agency</Label>
                    <Input placeholder="MARINA" disabled className="bg-slate-50" />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Input placeholder="Administrator" disabled className="bg-slate-50" />
                  </div>

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what updates you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">New Incident Reports</div>
                      <div className="text-xs text-slate-600">Get notified when new incidents are submitted</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">Review Assignments</div>
                      <div className="text-xs text-slate-600">Alerts when reports are assigned to you</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">Safety Alerts</div>
                      <div className="text-xs text-slate-600">Important safety bulletins and advisories</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">Weekly Summary</div>
                      <div className="text-xs text-slate-600">Statistical summary every Monday</div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">System Updates</div>
                      <div className="text-xs text-slate-600">Platform maintenance and new features</div>
                    </div>
                    <Switch />
                  </div>

                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>

                  <div>
                    <Label>New Password</Label>
                    <Input type="password" />
                  </div>

                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" />
                  </div>

                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">Enable 2FA</div>
                      <div className="text-xs text-slate-600">Require code from authenticator app</div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage where you're logged in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-slate-900 mb-1">Windows PC • Chrome</div>
                      <div className="text-xs text-slate-600">Manila, Philippines • Current session</div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <Button variant="outline" size="sm">Sign Out All Other Sessions</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
