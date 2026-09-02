import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../api/tasks';
import { fetchDepartments } from '../api/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ListTodo, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight, XCircle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { isAdmin, isSuperAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const tasksRes = await fetchTasks({ limit: 100 });
      setTasks(tasksRes.data.tasks || []);

      if (isAdmin) {
        const deptsRes = await fetchDepartments();
        const depts = deptsRes.data.departments || [];
        setDepartments(depts);
        // Default Department Admin to their assigned department
        if (!isSuperAdmin && user?.departmentId) {
          setSelectedDeptId(user.departmentId);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on selected department (for admins)
  const filteredTasks = isAdmin
    ? (selectedDeptId === 'all'
        ? tasks
        : tasks.filter((t) => t.assignee?.departmentId === selectedDeptId))
    : tasks; // Employees only get their own tasks from backend API

  const pendingCount = filteredTasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = filteredTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const rejectedCount = filteredTasks.filter((t) => t.status === 'rejected').length;
  const totalCount = filteredTasks.length;

  const chartData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Rejected'],
    datasets: [
      {
        data: [pendingCount, inProgressCount, completedCount, rejectedCount],
        backgroundColor: ['rgba(245, 158, 11, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(244, 63, 94, 0.8)'],
        borderColor: ['rgba(245, 158, 11, 1)', 'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(244, 63, 94, 1)'],
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
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? 'Management Dashboard' : `Welcome, ${user?.name || 'Employee'}`}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Overview of department task metrics and workload progress'
              : 'Your personal task dashboard — track and respond to your assigned work'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Department Selector for Admins */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">Department:</span>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
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

          {isAdmin ? (
            <Link to="/tasks">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Assign New Task
              </Button>
            </Link>
          ) : (
            <Link to="/tasks">
              <Button variant="default" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" /> View My Tasks <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isAdmin ? 'Total Tasks' : 'My Total Tasks'}
            </CardTitle>
            <ListTodo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'All department tasks' : 'Tasks assigned to you'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'Awaiting employee action' : 'Awaiting your response'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'Active work' : 'Tasks you accepted'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'Rejected by employee' : 'Tasks you rejected'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{isAdmin ? 'Department Status Breakdown' : 'My Status Breakdown'}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            {totalCount > 0 ? (
              <div className="w-56 h-56">
                <Doughnut data={chartData} options={{ maintainAspectRatio: true }} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12">No tasks assigned to display chart</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isAdmin ? 'Recent Tasks' : 'My Recent Tasks'}</CardTitle>
            <Link to="/tasks" className="text-xs text-primary font-semibold flex items-center hover:underline">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {filteredTasks.slice(0, 5).map((task) => (
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
              {filteredTasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {isAdmin ? 'No tasks assigned for this department.' : 'You have no assigned tasks currently.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

