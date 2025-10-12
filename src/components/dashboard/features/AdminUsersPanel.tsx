import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

interface SimpleUser { _id: string; username: string; fullName?: string; role?: string }

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Fetch users based on selected role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = '';
        let roleLabel = '';

        switch (selectedRole) {
          case 'freelancer':
            endpoint = '/users/getFreelancers';
            roleLabel = 'freelancer';
            break;
          case 'client':
            endpoint = '/users/getClients';
            roleLabel = 'client';
            break;
          case 'interviewer':
            endpoint = '/users/getInterviewers';
            roleLabel = 'interviewer';
            break;
          default:
            endpoint = '/users/all';
            roleLabel = '';
        }

        const res = await axios.get(`${import.meta.env.VITE_SERVER}${endpoint}`, { withCredentials: true });
        const raw = res.data.data?.users || [];
        const normalized = (Array.isArray(raw) ? raw : []).map((u: any) => ({
          _id: u._id || u.id,
          username: u.username,
          fullName: u.fullName,
          role: roleLabel || (u.role || u.userType || '').toLowerCase(),
        }));
        setUsers(normalized);
    } catch (e: any) {
        setError(e?.message || 'Failed to fetch users');
    } finally {
        setLoading(false);
    }
};
fetchUsers();
  }, [selectedRole]);

  // Filter users based on search query only (role filtering is done via API)
  const filtered = useMemo(() => {
    let result = users.filter(u => u.username?.toLowerCase() !== 'admin');

    if (query.trim() !== '') {
      const q = query.toLowerCase();
      result = result.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.fullName || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [users, query]);

  return (
    <div className="p-4 space-y-3">
      {/* Search + Role Filter */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or username"
            className="w-full pl-9 pr-3 py-1.5 border rounded-md focus:outline-none focus:ring text-sm"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-1.5 border rounded-md focus:outline-none focus:ring text-sm"
        >
          <option value="all">Select an option</option>
          <option value="freelancer">Freelancers</option>
          <option value="client">Clients</option>
          <option value="interviewer">Interviewers</option>
        </select>
      </div>

      {/* User List */}
      <div className="bg-white border rounded-md overflow-hidden">
        <ul className="max-h-[60vh] overflow-y-auto">
          {filtered.map(u => (
            <li key={u._id} className="px-3 py-2 border-b last:border-b-0">
              <button
                className="w-full text-left"
                onClick={() => window.location.href = `/profile/${u.username}`}
              >
                <div className="font-medium text-sm">
                  {u.fullName || u.username} 
                  {u.role && <span className="ml-1 text-xs text-gray-500">({u.role})</span>}
                </div>
                <div className="text-xs text-gray-500">{u.username}</div>
              </button>
            </li>
          ))}

          {!loading && filtered.length === 0 && (
            <li className="px-3 py-4 text-xs text-gray-500">No users found</li>
          )}
        </ul>

        {loading && <div className="px-3 py-2 text-xs text-gray-600">Loading…</div>}
        {error && <div className="px-3 py-2 text-xs text-red-600">{error}</div>}
      </div>
    </div>
  );
}
