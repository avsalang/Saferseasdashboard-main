import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  BarChart3, 
  Search, 
  Shield,
  Settings,
  GraduationCap,
  User,
  Plus,
  Database
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Submit Incident", href: "/submit-incident", icon: FileText },
    { name: "Incident Explorer", href: "/incident-explorer", icon: Database },
    { name: "GIS Map", href: "/gis-map", icon: Map },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Policy Insights", href: "/policy-insights", icon: Shield },
    { name: "Admin", href: "/admin", icon: Settings },
    { name: "Training", href: "/training", icon: GraduationCap },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <header className="h-16 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 flex items-center px-6 gap-6 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl text-white font-semibold tracking-tight">SAFERSEAS</h1>
            <p className="text-xs text-blue-200">Maritime Safety Platform</p>
          </div>
        </Link>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search incidents, vessels, or reports..." 
              className="pl-10 bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/submit-incident">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              Submit Incident
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Only show on non-landing pages */}
        {!isLanding && (
          <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-900 font-medium' 
                        : 'text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
