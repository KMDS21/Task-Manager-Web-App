import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckSquare, LayoutDashboard, ListTodo, Shield, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span>TaskManager</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 transition-colors hover:text-primary ${
              isActive('/dashboard') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            to="/tasks"
            className={`flex items-center gap-1.5 transition-colors hover:text-primary ${
              isActive('/tasks') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Tasks
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 transition-colors hover:text-primary ${
                isActive('/admin') ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Admin Center
            </Link>
          )}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-muted/60 text-xs">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{user.name}</span>
            <Badge variant={user.role === 'admin' ? 'admin' : 'user'} className="capitalize text-[10px] px-2 py-0">
              {user.role}
            </Badge>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

