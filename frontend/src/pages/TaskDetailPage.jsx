import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchTaskById, uploadTaskFile, deleteTaskFile, updateTask } from '../api/tasks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ArrowLeft, Calendar, User, Upload, FileText, Trash2, Download, Paperclip } from 'lucide-react';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadTask = async () => {
    try {
      const response = await fetchTaskById(id);
      setTask(response.task);
    } catch (error) {
      alert('Task not found or access denied.');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a file to upload.');

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await uploadTaskFile(id, formData);
      setSelectedFile(null);
      loadTask();
    } catch (error) {
      alert(error.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file attachment?')) return;
    try {
      await deleteTaskFile(id, fileId);
      loadTask();
    } catch (error) {
      alert('Failed to delete file.');
    }
  };

  if (loading) {
    return (
      <div className="container p-8 flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-6 max-w-5xl">
      <Link to="/tasks">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
      </Link>

      <Card className="shadow-md border">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={task.status} className="capitalize text-xs px-3 py-1">
              {task.status.replace('_', ' ')}
            </Badge>

            <span className="text-xs text-muted-foreground">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>

          <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
          <CardDescription className="text-sm whitespace-pre-line text-foreground/80">{task.description || 'No description provided.'}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 border-t pt-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>
                Assignee: <strong className="text-foreground">{task.assignee?.name || 'Unassigned'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span>
                Due Date: <strong className="text-foreground">{task.dueDate || 'No due date'}</strong>
              </span>
            </div>
          </div>

          {/* Files Attachment Section (3-Table normalized architecture) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" /> File Attachments ({task.files?.length || 0})
            </h3>

            {/* Existing Files List */}
            {task.files?.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No file attachments uploaded for this task yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {task.files?.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="truncate text-xs">
                        <p className="font-medium truncate">{file.originalName}</p>
                        <p className="text-muted-foreground text-[10px]">{file.sizeBytes ? `${Math.round(file.sizeBytes / 1024)} KB` : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => handleFileDelete(file.id)} className="h-7 w-7 p-0 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload Form */}
            <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row gap-3 pt-2">
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="bg-background"
              />
              <Button type="submit" disabled={uploading || !selectedFile} className="shrink-0">
                <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Attachment'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
