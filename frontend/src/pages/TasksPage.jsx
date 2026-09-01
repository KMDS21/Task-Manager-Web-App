import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { fetchAdminUsers } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Filter, Calendar, User, FileText, Trash2, Edit3, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Task Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const loadTasksData = async () => {
    setLoading(true);
    try {
      const response = await fetchTasks({
        search,
        status: statusFilter,
        page,
        limit: 6,
      });

      setTasks(response.tasks || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksData();
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminUsers().then((res) => setUsersList(res.users || []));
    }
  }, [isAdmin]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await createTask({
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate || null,
        assigneeId: newAssigneeId || user.id,
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewAssigneeId('');
      loadTasksData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadTasksData();
    } catch (error) {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      loadTasksData();
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">Manage, search, and track work assignments</p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-muted/40 p-4 rounded-xl border border-border/80">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full sm:w-44 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center border rounded-xl bg-card">
          <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Tasks Found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filter or create a new task.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border-border/80">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={task.status} className="capitalize">
                    {task.status.replace('_', ' ')}
                  </Badge>
                  {task.files && task.files.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      📁 {task.files.length} attachment{task.files.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold line-clamp-1">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{task.description || 'No description provided.'}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-xs text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Assignee: <strong className="text-foreground">{task.assignee?.name || 'Unassigned'}</strong></span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>Due Date: {task.dueDate}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t bg-muted/20 p-4">
                {/* Quick Status Change */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <div className="flex items-center gap-1">
                  <Link to={`/tasks/${task.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Details
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 p-0 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total tasks)
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Task Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg shadow-2xl bg-background border">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Fill in task details and assign to a team member</CardDescription>
            </CardHeader>

            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Title *</label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title..." required />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Task details..."
                    className="w-full min-h-[90px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                  </div>

                  {isAdmin && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Assign To</label>
                      <select
                        value={newAssigneeId}
                        onChange={(e) => setNewAssigneeId(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select User...</option>
                        {usersList.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? 'Saving...' : 'Create Task'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
