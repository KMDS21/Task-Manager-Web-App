import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTasks } from '../api/tasks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle2, Clock, ListTodo, Plus, ArrowRight, Activity, Calendar } from 'lucide-react';

// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetchTasks({ limit: 100 });
        const tasks = response.tasks || [];

        const pending = tasks.filter((t) => t.status === 'pending').length;
        const in_progress = tasks.filter((t) => t.status === 'in_progress').length;
        const completed = tasks.filter((t) => t.status === 'completed').length;

        setStats({
          total: response.total || tasks.length,
          pending,
          in_progress,
          completed,
        });

        setRecentTasks(tasks.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [stats.pending, stats.in_progress, stats.completed],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
        borderColor: ['#D97706', '#2563EB', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 16, font: { family: 'inherit', size: 12 } },
      },
    },
  };

  if (loading) {
    return (
      <div className="container p-8 flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>! Here is your daily task progress summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/tasks">
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Create New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Counter Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/70 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned & active tasks</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/70 hover:border-amber-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/70 hover:border-blue-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/70 hover:border-emerald-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visuals Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Visual Chart Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
            <CardDescription>Visual breakdown of task statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex justify-center items-center">
            {stats.total > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-sm text-muted-foreground">No task data to display</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks List Card */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Assigned Tasks</CardTitle>
              <CardDescription>Your latest 5 tasks</CardDescription>
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No recent tasks found. Create your first task!
              </div>
            ) : (
              <div className="divide-y border rounded-lg">
                {recentTasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm leading-none">{task.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {task.dueDate}
                          </span>
                        )}
                        <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                    <Badge variant={task.status} className="capitalize">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
