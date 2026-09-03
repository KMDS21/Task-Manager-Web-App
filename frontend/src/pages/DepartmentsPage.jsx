import React, { useState, useEffect } from 'react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Edit2, Trash2, Users, AlertCircle, CheckCircle2, Shield, User as UserIcon, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DepartmentsPage() {
  const { isSuperAdmin } = useAuth();
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
      if (selectedDeptId === id) setSelectedDeptId('all');
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

  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Directory</h1>
          <p className="text-muted-foreground text-sm">Organize departments, view admins, and track employees</p>
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

      {/* Back Button when viewing a specific department */}
      {selectedDeptId !== 'all' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDeptId('all')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Departments
        </Button>
      )}

      {/* OVERVIEW GRID VIEW: Shown when "All Departments" is active */}
      {selectedDeptId === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const deptAdmins = dept.members?.filter((m) => m.role === 'admin' || m.role === 'super_admin') || [];
            const deptEmployees = dept.members?.filter((m) => m.role !== 'admin' && m.role !== 'super_admin') || [];

            return (
              <Card
                key={dept.id}
                className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedDeptId(dept.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <CardTitle className="text-xl font-semibold">
                      {dept.name}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {dept.members?.length || 0}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {dept.description || 'No detailed description provided.'}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 flex-1">
                  <div className="border-t pt-3 space-y-2 text-xs">
                    {/* Admin summary */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-purple-500" /> Admin:
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[140px]">
                        {deptAdmins.length > 0 ? deptAdmins.map((a) => a.name).join(', ') : 'None assigned'}
                      </span>
                    </div>

                    {/* Employee summary */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <UserIcon className="h-3.5 w-3.5 text-blue-500" /> Employees:
                      </span>
                      <span className="font-semibold text-foreground">
                        {deptEmployees.length} Employee{deptEmployees.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-3 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>View Employees & Details</span>
                  <ChevronRight className="h-4 w-4" />
                </CardFooter>
              </Card>
            );
          })}

          {departments.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No departments created yet. {isSuperAdmin && 'Click "Add Department" to get started.'}
            </div>
          )}
        </div>
      )}

      {/* DETAILED DRILLDOWN VIEW: Shown when a specific department is clicked/selected */}
      {selectedDeptId !== 'all' && selectedDept && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-2xl font-bold">
                  {selectedDept.name}
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Users className="h-3.5 w-3.5" /> {selectedDept.members?.length || 0} Total Members
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedDept.description || 'No description provided.'}</p>
            </div>

            {isSuperAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(selectedDept)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedDept.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Department Admins Section */}
            <div>
              <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-purple-500" /> DEPARTMENT ADMINS ({selectedDept.members?.filter((m) => m.role === 'admin' || m.role === 'super_admin').length || 0})
              </h4>
              {selectedDept.members?.filter((m) => m.role === 'admin' || m.role === 'super_admin').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedDept.members?.filter((m) => m.role === 'admin' || m.role === 'super_admin').map((m) => (
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

            {/* Department Employees Section */}
            <div className="border-t pt-4">
              <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-blue-500" /> DEPARTMENT EMPLOYEES ({selectedDept.members?.filter((m) => m.role !== 'admin' && m.role !== 'super_admin').length || 0})
              </h4>
              {selectedDept.members?.filter((m) => m.role !== 'admin' && m.role !== 'super_admin').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedDept.members?.filter((m) => m.role !== 'admin' && m.role !== 'super_admin').map((m) => (
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
      )}

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
                    placeholder="e.g. Software Development, HR"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of department duties..."
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
