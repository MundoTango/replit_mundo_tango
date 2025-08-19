import { useQuery } from '@tanstack/react-query';
import { Flag, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PostReport {
  id: number;
  postId: number;
  userId: number;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  user: {
    name: string;
    username: string;
  };
  post: {
    content: string;
    userId: number;
    user: {
      name: string;
      username: string;
    };
  };
}

export function PostReportsViewer() {
  const { toast } = useToast();

  // Fetch all reports
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/reports'],
    queryFn: async () => {
      const response = await fetch('/api/admin/reports', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      const result = await response.json();
      return result.data || [];
    }
  });

  const handleUpdateStatus = async (reportId: number, status: string, action?: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, action })
      });

      if (!response.ok) throw new Error('Failed to update report');

      toast({ 
        title: "Report updated",
        description: `Report marked as ${status}`
      });
      refetch();
    } catch (error) {
      toast({ 
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Flag className="h-12 w-12 mb-4 text-gray-300" />
        <p>No reports to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Post Reports</h2>
      
      {reports.map((report: PostReport) => (
        <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Report Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Flag className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">{report.reason}</h3>
                <p className="text-sm text-gray-600">
                  Reported by @{report.user.username} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : ''}
              ${report.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
              ${report.status === 'dismissed' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
              {report.status}
            </span>
          </div>

          {/* Report Description */}
          {report.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{report.description}</p>
            </div>
          )}

          {/* Reported Post */}
          <div className="border-l-4 border-red-200 pl-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">Reported post by @{report.post.user.username}:</p>
            <p className="text-gray-800">{report.post.content}</p>
          </div>

          {/* Actions */}
          {report.status === 'pending' && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                onClick={() => handleUpdateStatus(report.id, 'resolved', 'deleted')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Delete Post
              </button>
              <button
                onClick={() => handleUpdateStatus(report.id, 'resolved', 'warned')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <AlertCircle className="h-4 w-4" />
                Warn User
              </button>
              <button
                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Dismiss
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}