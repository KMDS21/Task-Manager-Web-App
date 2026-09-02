import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks, createTask, deleteTask } from '../api/tasks';
import { fetchAdminUsers } from '../api/admin';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Search, Filter, Trash2, Calendar, User as UserIcon, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [page, statusFilter]);

  useEffect(() => {
    if (isAdmin && isModalOpen) {
      fetchAdminUsers().then((res) => setUsers(res.data.users || [])).catch(() => {});
    }
  }, [isAdmin, isModalOpen]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetchTasks({ page, search, status: statusFilter, limit: 6 });
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
    setCreateLoading(true);
    try {
      await createTask({
        title,
        description,
        dueDate: dueDate || null,
        assigneeId: assigneeId || user.id,
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage and assign tasks across employees' : 'View and respond to your assigned tasks'}
          </p>
        </div>

        {/* Only Admin / Super Admin can see and create tasks */}
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Assign New Task
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-8 border-border/50">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full md:w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={task.status}>{task.status.replace('_', ' ').toUpperCase()}</Badge>
                    {task.assignee?.department && (
                      <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" /> {task.assignee.department.name}
                      </Badge>
                    )}
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="line-clamp-1">
                  <Link to={`/tasks/${task.id}`} className="hover:underline">{task.title}</Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{task.description || 'No description provided.'}</p>

                <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-primary" />
                      <span>Assigned to: {task.assignee.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t pt-3 flex items-center justify-end">
                <Link to={`/tasks/${task.id}`}>
                  <Button variant="default" size="sm">View Details & Response</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed mb-8">
          <p className="text-muted-foreground">No tasks found matching your filter criteria.</p>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Create Task Modal — Admin/Super Admin Only */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-xl border-border">
            <CardHeader>
              <CardTitle>Assign New Task</CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Task Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Prepare Q3 Financial Audit" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task details and instructions for the employee..."
                    className="flex min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>

                {users.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Assign Employee</label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">-- Select Employee --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')}) {u.department ? `[${u.department.name}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
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
