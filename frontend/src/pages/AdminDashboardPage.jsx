import React, { useState, useEffect } from 'react';
import { fetchAdminStats, fetchAdminUsers, updateUserRole, updateUserDepartment, deleteUser } from '../api/admin';
import { fetchDepartments } from '../api/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Users, CheckCircle2, Clock, ListTodo, Shield, Trash2, Search, AlertCircle, Building2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, deptsRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(search),
        fetchDepartments(),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setDepartments(deptsRes.data.departments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAdminData();
  };

  const handleRoleChange = async (user, newRole) => {
    setActionLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      await updateUserRole(user.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleDepartmentChange = async (user, departmentId) => {
    setActionLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      await updateUserDepartment(user.id, departmentId || null);
      const selectedDept = departments.find((d) => d.id === departmentId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, departmentId: departmentId || null, department: selectedDept ? { id: selectedDept.id, name: selectedDept.name } : null }
            : u
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update department');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Manage employees, department assignments, and platform metrics</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">In Progress</CardTitle>
              <ListTodo className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stats.rejectedTasks}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm col-span-2 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User & Department Management Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div>
            <CardTitle className="text-lg sm:text-xl">Employee & Department Management</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Assign employees to departments and manage roles</p>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assigned Tasks</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{u.name}</span>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">(You)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && u.id !== currentUser?.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold focus-visible:outline-none"
                          disabled={actionLoading[u.id]}
                        >
                          <option value="employee">EMPLOYEE</option>
                          <option value="admin">ADMIN</option>
                          <option value="super_admin">SUPER ADMIN</option>
                        </select>
                      ) : (
                        <Badge variant={u.role}>
                          {u.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'super_admin' ? (
                        <Badge variant="super_admin" className="text-[10px]">
                          ALL DEPARTMENTS
                        </Badge>
                      ) : u.role === 'admin' && !isSuperAdmin ? (
                        <Badge variant="outline" className="text-xs font-medium border-purple-500/30 text-purple-600 dark:text-purple-400">
                          {u.department?.name || 'ADMIN (ENROLLED)'}
                        </Badge>
                      ) : (
                        <select
                          value={u.departmentId || ''}
                          onChange={(e) => handleDepartmentChange(u, e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none max-w-[160px]"
                          disabled={actionLoading[u.id]}
                        >
                          <option value="">-- No Dept --</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {u.assignedTasks?.length || 0} tasks
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSuperAdmin && u.id !== currentUser?.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading[u.id]}
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted-foreground">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
