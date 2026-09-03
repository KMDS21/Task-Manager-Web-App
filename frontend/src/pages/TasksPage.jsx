import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks, createTask, deleteTask } from '../api/tasks';
import { fetchAdminUsers } from '../api/admin';
import { fetchDepartments } from '../api/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Search, Filter, Trash2, Calendar, User as UserIcon, Shield, Building2, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TasksPage() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [adminViewTab, setAdminViewTab] = useState('my_assigned'); // 'my_assigned' | 'department' | 'all'
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Assign Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalDeptFilter, setModalDeptFilter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchDepartments().then((res) => {
        const depts = res.data.departments || [];
        setDepartments(depts);
      }).catch(() => {});
    }
  }, [isAdmin, user]);

  useEffect(() => {
    loadTasks();
  }, [page, statusFilter]);

  useEffect(() => {
    if (isAdmin && isModalOpen) {
      Promise.all([fetchAdminUsers(), fetchDepartments()])
        .then(([usersRes, deptsRes]) => {
          setUsers(usersRes.data.users || []);
          const depts = deptsRes.data.departments || [];
          setDepartments(depts);
          if (user?.departmentId) {
            setModalDeptFilter(user.departmentId);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin, isModalOpen, user]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetchTasks({ page, search, status: statusFilter, limit: 100 });
      setTasks(res.data.tasks || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadTasks();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!assigneeId) return alert('Please select an employee to assign this task.');

    setCreateLoading(true);
    try {
      await createTask({
        title,
        description,
        dueDate: dueDate || null,
        assigneeId,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Filter tasks based on view tab & department for Admin
  let displayedTasks = tasks;
  if (isAdmin) {
    if (adminViewTab === 'my_assigned') {
      displayedTasks = tasks.filter((t) => t.assigneeId === user?.id);
    } else if (adminViewTab === 'department') {
      displayedTasks = user?.departmentId
        ? tasks.filter((t) => t.assignee?.departmentId === user.departmentId || t.createdById === user.id)
        : tasks;
    } else if (departmentFilter !== 'all') {
      displayedTasks = tasks.filter((t) => t.assignee?.departmentId === departmentFilter);
    }
  }

  // Count my assigned tasks for badge
  const myAssignedCount = tasks.filter((t) => t.assigneeId === user?.id).length;

  // Filter users in assignment modal based on modal department filter
  const filteredModalUsers = modalDeptFilter
    ? users.filter((u) => u.departmentId === modalDeptFilter)
    : users;

  const unassignedUsers = users.filter((u) => !u.departmentId);
  const selectedModalDept = departments.find((d) => d.id === modalDeptFilter);
  const userAdminDeptName = departments.find((d) => d.id === user?.departmentId)?.name || 'Admin';

  return (
    <div className="w-full px-4 sm:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isAdmin ? 'Tasks Management' : 'My Assigned Tasks'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {isAdmin
              ? 'View tasks assigned to you or manage department task assignments'
              : 'View, accept, and complete your assigned tasks'}
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Assign New Task
          </Button>
        )}
      </div>

      {/* Admin Task Category Switcher Tabs */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          <Button
            variant={adminViewTab === 'my_assigned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAdminViewTab('my_assigned')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs"
          >
            <UserIcon className="h-3.5 w-3.5 text-emerald-500" />
            My Assigned Tasks
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.2 text-[10px]">
              {myAssignedCount}
            </Badge>
          </Button>

          <Button
            variant={adminViewTab === 'department' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAdminViewTab('department')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs"
          >
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
            My Department Tasks
          </Button>

          <Button
            variant={adminViewTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAdminViewTab('all')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs"
          >
            <Shield className="h-3.5 w-3.5 text-purple-500" />
            All Department Overview
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="shrink-0">Search</Button>
          </form>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Department Filter for Admins (visible on 'all' tab) */}
            {isAdmin && adminViewTab === 'all' && (
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <span className="text-xs font-medium text-muted-foreground shrink-0">Dept:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-9 w-full sm:w-auto rounded-md border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {user?.departmentId === d.id ? '(My Department)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-full sm:w-auto rounded-md border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : displayedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {displayedTasks.map((task) => (
            <Card key={task.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={task.status} className="text-[10px]">{task.status.replace('_', ' ').toUpperCase()}</Badge>
                    {task.assignee?.department && (
                      <Badge variant="outline" className="text-[10px]">
                        {task.assignee.department.name}
                      </Badge>
                    )}
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="line-clamp-1 text-base sm:text-lg">
                  <Link to={`/tasks/${task.id}`} className="hover:underline">{task.title}</Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-4">{task.description || 'No description provided.'}</p>

                <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                  {task.creator && (
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">Created by {task.creator.name} ({task.creator.department?.name || 'Admin'})</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">Assigned to: {task.assignee.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t p-3 sm:p-4 flex items-center justify-end">
                <Link to={`/tasks/${task.id}`}>
                  <Button variant="default" size="sm" className="text-xs">View Details & Response</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 sm:p-12 text-center border-dashed">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? adminViewTab === 'my_assigned'
                ? 'You have no tasks assigned directly to you.'
                : 'No tasks found matching your filter criteria.'
              : 'You have no assigned tasks currently.'}
          </p>
        </Card>
      )}

      {/* Assign Task Modal */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-xl border-border my-8">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Assign New Task</CardTitle>
              {/* Creator Admin & Department Information */}
              <div className="mt-2 p-3 rounded-lg bg-muted/60 border border-border text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created by Admin:</span>
                  <span className="font-semibold text-foreground">
                    {user?.name} ({userAdminDeptName})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Employee Dept:</span>
                  <span className="font-semibold text-primary">
                    {selectedModalDept ? selectedModalDept.name : 'All Departments'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Task Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sales Report / Software Bug Fix" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide task instructions for the employee..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>

                {/* Target Department Selection */}
                <div className="space-y-1 border-t pt-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Target Employee Department
                  </label>
                  <select
                    value={modalDeptFilter}
                    onChange={(e) => {
                      setModalDeptFilter(e.target.value);
                      setAssigneeId('');
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {user?.departmentId === d.id ? '(My Department)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Select Employee to Assign</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {departments.map((dept) => {
                      const deptUsers = filteredModalUsers.filter((u) => u.departmentId === dept.id);
                      if (deptUsers.length === 0) return null;
                      return (
                        <optgroup key={dept.id} label={dept.name}>
                          {deptUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role.replace('_', ' ')}) — {u.email}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                    {unassignedUsers.length > 0 && (!modalDeptFilter || modalDeptFilter === 'unassigned') && (
                      <optgroup label="Unassigned Employees">
                        {unassignedUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role.replace('_', ' ')})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-4 sm:p-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createLoading}>{createLoading ? 'Assigning...' : 'Assign Task'}</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
