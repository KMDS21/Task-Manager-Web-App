import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../api/tasks';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ListTodo, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await fetchTasks({ limit: 100 });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;

  const chartData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [pendingCount, inProgressCount, completedCount],
        backgroundColor: ['rgba(245, 158, 11, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: ['rgba(245, 158, 11, 1)', 'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your assigned task metrics and progress</p>
        </div>
        <Link to="/tasks">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Assigned tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Marked finished</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            {totalCount > 0 ? (
              <div className="w-56 h-56">
                <Doughnut data={chartData} options={{ maintainAspectRatio: true }} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12">No tasks available to graph</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tasks</CardTitle>
            <Link to="/tasks" className="text-xs text-primary font-semibold flex items-center hover:underline">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link to={`/tasks/${task.id}`} className="font-medium hover:underline block truncate">
                      {task.title}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{task.description || 'No description'}</p>
                  </div>
                  <Badge variant={task.status}>{task.status.replace('_', ' ').toUpperCase()}</Badge>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No tasks assigned yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
