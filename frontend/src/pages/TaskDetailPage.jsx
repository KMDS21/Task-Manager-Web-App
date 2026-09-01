import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchTaskById, updateTask, deleteTask, uploadTaskFile, deleteTaskFile } from '../api/tasks';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Calendar, User as UserIcon, Trash2, Clock, Upload, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await uploadTaskFile(id, formData);
      setSelectedFile(null);
      loadTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await deleteTaskFile(id, fileId);
      loadTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
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

      <Card className="border-border/50 shadow-sm mb-8">
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

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> File Attachments ({task.files?.length || 0})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-muted/40 rounded-lg border border-border/50">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer w-full sm:w-auto"
            />
            <Button type="submit" size="sm" disabled={uploading || !selectedFile} className="w-full sm:w-auto shrink-0 flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Uploading...' : 'Upload Attachment'}
            </Button>
          </form>

          <div className="divide-y divide-border">
            {task.files?.map((file) => (
              <div key={file.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.sizeBytes / 1024).toFixed(1)} KB • Uploaded by {file.uploader?.name || 'User'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href={file.fileUrl} target="_blank" rel="noreferrer" download>
                    <Button variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </a>
                  {(isAdmin || file.uploadedById === user?.id) && (
                    <Button variant="ghost" size="sm" onClick={() => handleFileDelete(file.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {(!task.files || task.files.length === 0) && (
              <p className="text-sm text-muted-foreground py-6 text-center">No files attached to this task yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
