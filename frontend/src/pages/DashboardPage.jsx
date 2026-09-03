import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../api/tasks';
import { fetchDepartments } from '../api/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ListTodo, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight, XCircle, UserCheck, TrendingUp, Building2 } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

export default function DashboardPage() {
  const { isAdmin, isSuperAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [lineTimeframe, setLineTimeframe] = useState('7d'); // '7d' | '30d'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const tasksRes = await fetchTasks({ limit: 100 });
      setTasks(tasksRes.data.tasks || []);

      if (isSuperAdmin) {
        const deptsRes = await fetchDepartments();
        const depts = deptsRes.data.departments || [];
        setDepartments(depts);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Strict Scoping of Dashboard Tasks:
  // - Super Admin: Can select any department or view all
  // - Department Admin: Strictly views tasks belonging to THEIR assigned department or created by them
  // - Employee: Strictly views tasks assigned to them
  const filteredTasks = isSuperAdmin
    ? (selectedDeptId === 'all'
        ? tasks
        : tasks.filter((t) => t.assignee?.departmentId === selectedDeptId))
    : isAdmin
    ? tasks.filter(
        (t) =>
          t.assignee?.departmentId === user?.departmentId ||
          t.createdById === user?.id
      )
    : tasks;

  // Filter personal tasks assigned specifically to the logged-in user
  const myPersonalTasks = tasks.filter((t) => t.assigneeId === user?.id);

  const pendingCount = filteredTasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = filteredTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const rejectedCount = filteredTasks.filter((t) => t.status === 'rejected').length;
  const totalCount = filteredTasks.length;

  // Donut Status Chart Data
  const donutChartData = {
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

  // Generate timeframe date range array for Line Chart (1 Week / 1 Month)
  const timeframeDays = lineTimeframe === '30d' ? 30 : 7;
  const timeframeDates = Array.from({ length: timeframeDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (timeframeDays - 1 - i));
    return d;
  });

  const lineChartLabels = timeframeDates.map((d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const lineChartDataValues = timeframeDates.map((d) => {
    const dateStr = d.toISOString().split('T')[0];
    return filteredTasks.filter((t) => {
      if (t.status !== 'completed') return false;
      const updatedDate = new Date(t.updatedAt).toISOString().split('T')[0];
      return updatedDate === dateStr;
    }).length;
  });

  const lineChartData = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: lineChartDataValues,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: lineTimeframe === '30d' ? 2 : 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `${context.parsed.y} task${context.parsed.y !== 1 ? 's' : ''} completed`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: lineTimeframe === '30d' ? 8 : 7,
          font: { size: 10 },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const userDeptName = user?.department?.name || 'My Department';

  return (
    <div className="w-full px-4 sm:px-8 py-6 space-y-8">
      {/* Top Header & Actions Bar - Stacks vertically on mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isSuperAdmin
              ? 'Super Admin Dashboard'
              : isAdmin
              ? `${userDeptName} Dashboard`
              : `Welcome, ${user?.name || 'Employee'}`}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {isSuperAdmin
              ? 'System-wide overview across all organizational departments'
              : isAdmin
              ? `Management metrics and workload progress for ${userDeptName}`
              : 'Your personal task dashboard — track and respond to your assigned work'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Department Selector FOR SUPER ADMIN ONLY */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">Department:</span>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="h-9 w-full sm:w-auto rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          ) : isAdmin ? (
            /* READ-ONLY DEPARTMENT BADGE FOR REGULAR DEPARTMENT ADMINS */
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shrink-0">
              <Building2 className="h-4 w-4" />
              <span>{userDeptName}</span>
            </div>
          ) : null}

          {isAdmin ? (
            <Link to="/tasks">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Assign New Task
              </Button>
            </Link>
          ) : (
            <Link to="/tasks">
              <Button variant="default" className="w-full sm:w-auto flex items-center justify-center gap-2">
                <ListTodo className="h-4 w-4" /> View My Tasks <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Responsive 5 Stat Cards Grid: Full screen width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {isAdmin ? 'Total Tasks' : 'My Total Tasks'}
            </CardTitle>
            <ListTodo className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{totalCount}</div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {isSuperAdmin ? 'All system tasks' : isAdmin ? `${userDeptName} tasks` : 'Assigned to you'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{pendingCount}</div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{isAdmin ? 'Awaiting employee action' : 'Awaiting response'}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{inProgressCount}</div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{isAdmin ? 'Active work' : 'Accepted tasks'}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{rejectedCount}</div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{isAdmin ? 'Rejected by employee' : 'Tasks rejected'}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{completedCount}</div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid: Left (Donut Status Breakdown), Right (Line Chart: Tasks Completed Over Time with 1 Week / 1 Month Selector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut Chart */}
        <Card className="lg:col-span-1 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{isAdmin ? 'Department Breakdown' : 'My Status Breakdown'}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4 sm:p-6">
            {totalCount > 0 ? (
              <div className="w-48 h-48 sm:w-56 sm:h-56">
                <Doughnut data={donutChartData} options={{ maintainAspectRatio: true }} />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground py-12">No tasks available to graph</p>
            )}
          </CardContent>
        </Card>

        {/* Right side of Pie Chart: Line Chart (Tasks Completed Over Time Trend with Mobile Responsive Selector) */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 p-4 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Tasks Completed Over Time
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Task completion velocity & productivity trend</p>
            </div>

            {/* Selector: 1 Week / 1 Month */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
              <select
                value={lineTimeframe}
                onChange={(e) => setLineTimeframe(e.target.value)}
                className="h-8 w-full sm:w-auto rounded-md border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none cursor-pointer"
              >
                <option value="7d">1 Week (7 Days)</option>
                <option value="30d">1 Month (30 Days)</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-2 p-4 sm:p-6 flex-1 min-h-[220px]">
            <div className="w-full h-full min-h-[220px]">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section: Recent Tasks List (placed below the middle chart grid!) */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">{isAdmin ? 'Recent Department Tasks' : 'My Recent Tasks'}</CardTitle>
          <Link to="/tasks" className="text-xs text-primary font-semibold flex items-center hover:underline">
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="divide-y divide-border">
            {filteredTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/tasks/${task.id}`} className="text-sm font-medium hover:underline block truncate">
                    {task.title}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{task.description || 'No description provided'}</p>
                </div>
                <Badge variant={task.status} className="shrink-0 text-[10px]">
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground py-8 text-center">
                {isAdmin ? 'No tasks assigned for this department.' : 'You have no assigned tasks currently.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DISTINCT SECTION: "Your Task / My Assigned Tasks" section at bottom for Admins */}
      {isAdmin && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 p-4 sm:p-6">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-500" /> Your Tasks (Assigned to Me)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tasks assigned directly to your account ({myPersonalTasks.length} task{myPersonalTasks.length !== 1 ? 's' : ''})
              </p>
            </div>

            <Link to="/tasks">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                Manage My Tasks <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-4">
            {myPersonalTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {myPersonalTasks.slice(0, 8).map((task) => (
                  <div key={task.id} className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <Badge variant={task.status} className="text-[10px]">
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-[11px] text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Link to={`/tasks/${task.id}`} className="font-semibold text-sm hover:underline line-clamp-1 block">
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-end">
                      <Link to={`/tasks/${task.id}`}>
                        <Button size="sm" variant="secondary" className="text-xs h-7 px-2.5">
                          Respond & View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground py-6 text-center italic">
                You have no personal tasks assigned to you right now.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
