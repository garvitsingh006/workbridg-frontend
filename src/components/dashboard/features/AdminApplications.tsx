import React, { useEffect, useMemo, useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { FolderOpen } from 'lucide-react';

export default function AdminApplications() {
  const { projects, fetchProjects, getProjectApplications } = useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      try {
        const apps = await getProjectApplications(selectedProjectId);
        setApplications(apps);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, [selectedProjectId]);

  const projectOptions = useMemo(() => projects.map(p => ({ id: p.id, title: p.title })), [projects]);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Freelancer Applications</h2>
        <p className="text-gray-600">Select a project to view incoming applications</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          className="border rounded-md px-3 py-2"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value || null)}
        >
          <option value="">Select project</option>
          {projectOptions.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[200px]">
        {!selectedProjectId && (
          <div className="text-sm text-gray-600">Choose a project to load applications.</div>
        )}
        {selectedProjectId && loading && (
          <div className="text-sm text-gray-600">Loading applications…</div>
        )}
        {selectedProjectId && !loading && applications.length === 0 && (
          <div className="text-sm text-gray-600">No applications yet for this project.</div>
        )}
        {selectedProjectId && !loading && applications.length > 0 && (
          <ul className="space-y-3">
            {applications.map((a, idx) => (
              <li key={idx} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{a.fullName}</div>
                  <div className="text-xs text-gray-500">Applied: {new Date(a.appliedAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-700 mt-1">Deadline: {new Date(a.deadline).toLocaleDateString()}</div>
                <div className="text-sm text-gray-700">Expected Payment: ${a.expectedPayment.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


