import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchTaskById, updateTask, deleteTask } from '../api/tasks';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Calendar, User as UserIcon, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const res = await fetchTaskById(id);
      setTask(res.data.task);
    } catch (err) {
      console.error('Failed to load task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      setTask((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Task Not Found</h2>
        <Link to="/tasks"><Button>Return to Tasks</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/tasks" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tasks
      </Link>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={task.status}>{task.status.replace('_', ' ').toUpperCase()}</Badge>
            </div>
            <CardTitle className="text-2xl">{task.title}</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {isAdmin && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div>
            <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2">Description</h4>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {task.description || 'No detailed description provided for this task.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None set'}</span>
            </div>

            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Assigned To:</span>
              <span className="font-medium">{task.assignee?.name || 'Unassigned'}</span>
            </div>

            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Created By:</span>
              <span className="font-medium">{task.creator?.name || 'Unknown'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Created On:</span>
              <span className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
