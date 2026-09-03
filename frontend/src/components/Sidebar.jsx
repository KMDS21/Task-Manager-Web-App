import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LayoutDashboard, CheckSquare, Shield, Building2, LogOut, CheckCircle2, Menu, X, User } from 'lucide-react';

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Departments', path: '/departments', icon: Building2, color: 'text-blue-500' },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: Shield, color: 'text-purple-500' });
  }

  return (
    <>
      {/* ================= MOBILE TOP BAR (< 768px) ================= */}
      <div className="md:hidden sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span>Task Manager</span>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-card border-r flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span>Task Manager</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-primary-foreground' : item.color || ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <Badge variant={user?.role} className="text-[9px] px-1.5 py-0">
                {user?.role?.replace('_', ' ')?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* ================= DESKTOP LEFT SIDEBAR (≥ 768px) ================= */}
      <aside className="hidden md:flex w-64 shrink-0 border-r bg-card h-screen sticky top-0 flex-col justify-between p-4 shadow-sm z-30">
        <div className="space-y-6">
          {/* App Header Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1 font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-foreground font-bold">TaskManager</span>
              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">Enterprise Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md translate-x-0.5'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-primary-foreground' : item.color || ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout at Bottom */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1 bg-muted/40 rounded-lg border border-border/50">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate leading-snug">{user?.name}</p>
              <Badge variant={user?.role} className="text-[9px] px-1.5 py-0 mt-0.5">
                {user?.role?.replace('_', ' ')?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
    </>
  );
}

