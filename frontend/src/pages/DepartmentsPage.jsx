import React, { useState, useEffect } from 'react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Building2, Plus, Edit2, Trash2, Users, AlertCircle, CheckCircle2, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DepartmentsPage() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchDepartments();
      setDepartments(res.data.departments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditDept(dept);
      setForm({ name: dept.name, description: dept.description || '' });
    } else {
      setEditDept(null);
      setForm({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditDept(null);
    setForm({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Department name is required');

    setSubmitting(true);
    try {
      if (editDept) {
        await updateDepartment(editDept.id, form);
        setSuccess('Department updated successfully');
      } else {
        await createDepartment(form);
        setSuccess('Department created successfully');
      }
      handleCloseModal();
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? Members of this department will become unassigned.')) return;
    try {
      await deleteDepartment(id);
      setSuccess('Department deleted successfully');
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const activeDepartment = selectedDeptId !== 'all'
    ? departments.find((d) => d.id === selectedDeptId)
    : null;

  const displayDepartments = selectedDeptId === 'all'
    ? departments
    : departments.filter((d) => d.id === selectedDeptId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Directory</h1>
            <p className="text-muted-foreground text-sm">View employees and admins organized by department</p>
          </div>
        </div>

        {isSuperAdmin && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Department Selector Filter Bar */}
      <Card className="mb-8 border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium shrink-0">Select Department:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm font-semibold focus-visible:outline-none"
            >
              <option value="all">🏢 All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {displayDepartments.length} department{displayDepartments.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Department Cards & Members Grid */}
      <div className="space-y-8">
        {displayDepartments.map((dept) => {
          const deptAdmins = dept.members?.filter((m) => m.role === 'admin' || m.role === 'super_admin') || [];
          const deptEmployees = dept.members?.filter((m) => m.role === 'employee') || [];

          return (
            <Card key={dept.id} className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" /> {dept.name}
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {dept.members?.length || 0} Total Members
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{dept.description || 'No description provided.'}</p>
                </div>

                {isSuperAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(dept)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Department Admins */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-purple-500" /> Department Admins ({deptAdmins.length})
                  </h4>
                  {deptAdmins.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {deptAdmins.map((m) => (
                        <div key={m.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                            {m.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No admins assigned to this department yet.</p>
                  )}
                </div>

                {/* Department Employees */}
                <div className="border-t pt-4">
                  <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-blue-500" /> Department Employees ({deptEmployees.length})
                  </h4>
                  {deptEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {deptEmployees.map((m) => (
                        <div key={m.id} className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {m.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No employees assigned to this department yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {departments.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No departments created yet. {isSuperAdmin && 'Click "Add Department" to create one.'}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border/80 shadow-lg">
            <CardHeader>
              <CardTitle>{editDept ? 'Edit Department' : 'Create Department'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input
                    placeholder="e.g. Engineering, Marketing, HR"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of responsibilities..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Department'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
