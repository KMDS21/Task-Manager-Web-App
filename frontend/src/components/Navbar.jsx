import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LayoutDashboard, CheckSquare, Shield, Building2, LogOut, CheckCircle2, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span>Task Manager</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tasks')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              Tasks
            </Link>
            <Link
              to="/departments"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/departments')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Building2 className="h-4 w-4 text-blue-500" />
              Departments
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Shield className="h-4 w-4 text-purple-500" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.name}</span>
            <Badge variant={user?.role}>
              {user?.role?.replace('_', ' ')?.toUpperCase()}
            </Badge>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 pt-2 pb-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between py-2 border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{user?.name}</span>
              <Badge variant={user?.role} className="text-[10px]">
                {user?.role?.replace('_', ' ')?.toUpperCase()}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs">
              <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
            </Button>
          </div>

          <nav className="flex flex-col space-y-1 pt-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                isActive('/tasks')
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <CheckSquare className="h-4 w-4 text-primary" />
              Tasks
            </Link>
            <Link
              to="/departments"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                isActive('/departments')
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <Building2 className="h-4 w-4 text-blue-500" />
              Departments
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive('/admin')
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <Shield className="h-4 w-4 text-purple-500" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
