import React, { useState, useCallback } from 'react';
import { useParams } from 'wouter';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload,
  FileText,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';

interface AgentDocument {
  id: number;
  agent_id: number;
  document_name: string;
  file_path: string;
  content: string;
  document_type: string;
  status: string;
  review_notes: string;
  reviewed_by: number;
  reviewed_at: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

const LifeCEOAgentDocuments: React.FC = () => {
  const { id: agentId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<AgentDocument | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch agent documents
  const { data: documents, isLoading } = useQuery({
    queryKey: [`/api/life-ceo/agents/${agentId}/documents`],
    enabled: !!agentId,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/life-ceo/agents/${agentId}/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document uploaded',
        description: 'Document has been uploaded successfully and is pending review.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/life-ceo/agents/${agentId}/documents`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Review document mutation
  const reviewDocumentMutation = useMutation({
    mutationFn: async ({ documentId, status, notes }: { documentId: number; status: string; notes: string }) => {
      return apiRequest('POST', `/api/life-ceo/agents/${agentId}/documents/${documentId}/review`, {
        status,
        review_notes: notes,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Document reviewed',
        description: 'Document review has been submitted.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/life-ceo/agents/${agentId}/documents`] });
      setSelectedDocument(null);
      setReviewNotes('');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_name', file.name);
      uploadDocumentMutation.mutate(formData);
    });
  }, [uploadDocumentMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      approved: { color: 'bg-green-100 text-green-800', icon: Check },
      rejected: { color: 'bg-red-100 text-red-800', icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Agent Documents</h2>
        
        {/* Upload area */}
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">Drag & drop documents here, or click to select</p>
                  <p className="text-sm text-gray-500">Supports PDF, TXT, MD, DOCX (max 10MB)</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents list */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Loading documents...
            </CardContent>
          </Card>
        ) : documents && documents.length > 0 ? (
          documents.map((doc: AgentDocument) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>{doc.document_name}</span>
                    </CardTitle>
                    <CardDescription>
                      Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(doc.status)}
                    <Badge variant="outline">{doc.document_type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {doc.review_notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Review Notes:</p>
                    <p className="text-sm text-gray-600">{doc.review_notes}</p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {doc.status === 'pending_review' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-2">Upload documents to build the agent's knowledge base</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Review Document</CardTitle>
              <CardDescription>{selectedDocument.document_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes here..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    reviewDocumentMutation.mutate({
                      documentId: selectedDocument.id,
                      status: 'approved',
                      notes: reviewNotes,
                    });
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    reviewDocumentMutation.mutate({
                      documentId: selectedDocument.id,
                      status: 'rejected',
                      notes: reviewNotes,
                    });
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDocument(null);
                    setReviewNotes('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LifeCEOAgentDocuments;