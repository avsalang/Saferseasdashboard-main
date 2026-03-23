import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Switch } from "../components/ui/switch";
import { Users, Settings, Database, Activity, Shield, Edit2, Trash2 } from "lucide-react";

export function AdminPortalPage() {
  const users = [
    { id: 1, name: "Juan dela Cruz", email: "juan.delacruz@marina.gov.ph", role: "Administrator", agency: "MARINA", status: "Active" },
    { id: 2, name: "Maria Santos", email: "maria.santos@pcg.gov.ph", role: "Reviewer", agency: "PCG", status: "Active" },
    { id: 3, name: "Pedro Reyes", email: "pedro.reyes@marina.gov.ph", role: "Reporter", agency: "MARINA", status: "Active" },
    { id: 4, name: "Ana Garcia", email: "ana.garcia@ppa.gov.ph", role: "Viewer", agency: "PPA", status: "Inactive" },
  ];

  const systemLogs = [
    { timestamp: "2026-03-23 14:32:15", user: "Juan dela Cruz", action: "Updated incident INC-2026-001234", status: "Success" },
    { timestamp: "2026-03-23 13:45:22", user: "Maria Santos", action: "Reviewed incident INC-2026-001189", status: "Success" },
    { timestamp: "2026-03-23 12:18:45", user: "Pedro Reyes", action: "Created incident INC-2026-001298", status: "Success" },
    { timestamp: "2026-03-23 11:05:33", user: "System", action: "Automated data backup completed", status: "Success" },
    { timestamp: "2026-03-23 09:22:11", user: "Ana Garcia", action: "Login attempt failed", status: "Error" },
  ];

  const taxonomyCategories = [
    { category: "Incident Type", values: ["Collision", "Grounding", "Sinking", "Fire/Explosion", "Capsizing"], count: 5 },
    { category: "Vessel Type", values: ["Ferry", "Cargo", "Tanker", "Fishing", "Passenger"], count: 5 },
    { category: "Severity", values: ["Very Serious", "Serious", "Less Serious", "Near Miss"], count: 4 },
    { category: "Casualty Type", values: ["Fatality", "Injury", "Pollution", "Property Damage", "None"], count: 5 },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Admin Portal</h1>
        <p className="text-slate-600">System administration and configuration</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="taxonomy" className="gap-2">
            <Database className="w-4 h-4" />
            Taxonomy Editor
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <Activity className="w-4 h-4" />
            Workflow Manager
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Shield className="w-4 h-4" />
            System Logs
          </TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Accounts</CardTitle>
                  <CardDescription>Manage user access and roles</CardDescription>
                </div>
                <Button>Add New User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-sm">{user.name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{user.agency}</TableCell>
                      <TableCell>
                        <Badge className={user.status === "Active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-slate-900 mb-1">Administrator</div>
                  <div className="text-xs text-slate-600">Full system access and user management</div>
                </div>
                <div>
                  <div className="text-sm text-slate-900 mb-1">Reviewer</div>
                  <div className="text-xs text-slate-600">Review and verify incident reports</div>
                </div>
                <div>
                  <div className="text-sm text-slate-900 mb-1">Reporter</div>
                  <div className="text-xs text-slate-600">Submit and edit own reports</div>
                </div>
                <div>
                  <div className="text-sm text-slate-900 mb-1">Viewer</div>
                  <div className="text-xs text-slate-600">Read-only access to data</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agency Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">MARINA</span>
                  <Badge>12 users</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">PCG</span>
                  <Badge>8 users</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">PPA</span>
                  <Badge>5 users</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">DENR</span>
                  <Badge>3 users</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-blue-600 mb-1">24</div>
                <div className="text-sm text-slate-600 mb-4">Currently logged in</div>
                <Button variant="outline" size="sm" className="w-full">View All Sessions</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Taxonomy Editor */}
        <TabsContent value="taxonomy" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Taxonomy</CardTitle>
                  <CardDescription>Manage dropdown values and classifications</CardDescription>
                </div>
                <Button>Add New Category</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {taxonomyCategories.map((taxonomy, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-slate-900">{taxonomy.category}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{taxonomy.count} values</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {taxonomy.values.map((value, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Manager */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow States</CardTitle>
              <CardDescription>Incident report lifecycle management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-slate-900 mb-1">Draft</h3>
                    <p className="text-xs text-slate-600">Initial report creation, editable by reporter</p>
                  </div>
                  <Badge>45 reports</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-slate-900 mb-1">Under Review</h3>
                    <p className="text-xs text-slate-600">Submitted for verification, assigned to reviewer</p>
                  </div>
                  <Badge>18 reports</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-slate-900 mb-1">Verified</h3>
                    <p className="text-xs text-slate-600">Approved by reviewer, ready for publication</p>
                  </div>
                  <Badge>32 reports</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-slate-900 mb-1">Published</h3>
                    <p className="text-xs text-slate-600">Finalized and available in public database</p>
                  </div>
                  <Badge>234 reports</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm text-slate-900 mb-1">Auto-assign Very Serious incidents</div>
                  <div className="text-xs text-slate-600">Automatically assign to senior reviewers</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm text-slate-900 mb-1">Email notifications</div>
                  <div className="text-xs text-slate-600">Send alerts on status changes</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm text-slate-900 mb-1">Data quality validation</div>
                  <div className="text-xs text-slate-600">Check for missing required fields</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Activity Logs</CardTitle>
                  <CardDescription>Audit trail and system events</CardDescription>
                </div>
                <Button variant="outline">Export Logs</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs font-mono">{log.timestamp}</TableCell>
                      <TableCell className="text-sm">{log.user}</TableCell>
                      <TableCell className="text-sm">{log.action}</TableCell>
                      <TableCell>
                        <Badge className={log.status === "Success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
