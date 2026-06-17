import { Outlet, Link, useLocation } from "react-router";
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
    { name: "Dashboard", href: "/dashboard" },
    { name: "Submit Incident", href: "/submit-incident" },
    { name: "Incident Explorer", href: "/incident-explorer" },
    { name: "GIS Map", href: "/gis-map" },
    { name: "Analytics", href: "/analytics" },
    { name: "Risk Assessment", href: "/risk-assessment" },
    { name: "Policy Review", href: "/policy-insights" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <header className="h-16 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 flex items-center px-6 gap-6 flex-shrink-0">
        <Link to="/" className="flex items-center">
          <div>
            <h1 className="text-xl text-white font-semibold tracking-tight">SAFERSEAS</h1>
            <p className="text-xs text-blue-200">Maritime Safety Platform</p>
          </div>
        </Link>

        <div className="flex-1 max-w-xl">
          <Input 
            placeholder="Search incidents, vessels, or reports..." 
            className="bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link to="/submit-incident">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Submit Incident</Button>
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
                <Link to="/incident-explorer">Incident Explorer</Link>
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
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-900 font-medium' 
                        : 'text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
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
