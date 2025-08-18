// ESA Project Tracker Hooks (Layer 7: State Management)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Project, InsertProject } from '@shared/schema';

// Fetch all projects
export function useProjects(filters?: {
  status?: string;
  priority?: string;
  layer?: number;
  parentId?: string;
}) {
  return useQuery({
    queryKey: ['/api/projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.layer) params.append('layer', filters.layer.toString());
      if (filters?.parentId) params.append('parentId', filters.parentId);
      
      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();
      return data.data as Project[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Fetch single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ['/api/projects', id],
    enabled: !!id,
  });
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: InsertProject) => {
      const response = await apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const response = await apiRequest(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', variables.id] });
    },
  });
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });
}

// Fetch project metrics
export function useProjectMetrics() {
  return useQuery({
    queryKey: ['/api/projects/metrics/summary'],
    refetchInterval: 60000, // Refresh every minute
  });
}

// Bulk import projects (for migration)
export function useBulkImportProjects() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projects: InsertProject[]) => {
      const response = await apiRequest('/api/projects/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ projects }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/metrics/summary'] });
    },
  });
}