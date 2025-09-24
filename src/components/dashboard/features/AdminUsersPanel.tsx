import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

interface SimpleUser { _id: string; username: string; fullName?: string; role?: string }

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${import.meta.env.VITE_SERVER}/users/all`, { withCredentials: true });
        const raw = res.data?.users || res.data?.data || [];
        const normalized = (Array.isArray(raw) ? raw : []).map((u: any) => ({
          _id: u._id || u.id,
          username: u.username,
          fullName: u.fullName,
          role: u.role || u.userType,
        }));
        setUsers(normalized);
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users
      .filter(u => u.username?.toLowerCase() !== 'admin')
      .filter(u => (u.username || '').toLowerCase().includes(q) || (u.fullName || '').toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or username"
            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring"
          />
        </div>
      </div>

      <div className="bg-white border rounded-md overflow-hidden">
        <ul className="max-h-[70vh] overflow-y-auto">
          {filtered.map(u => (
            <li key={u._id} className="px-4 py-3 border-b last:border-b-0">
              <button
                className="w-full text-left"
                onClick={() => {
                  window.location.href = `/profile/${u.username}`;
                }}
              >
                <div className="font-medium">{u.fullName || u.username} {u.role && <span className="ml-1 text-xs text-gray-500">({u.role})</span>}</div>
                <div className="text-xs text-gray-500">{u.username}</div>
              </button>
            </li>
          ))}
          {!loading && filtered.length === 0 && (
            <li className="px-4 py-6 text-sm text-gray-500">No users found</li>
          )}
        </ul>
        {loading && <div className="px-4 py-3 text-sm text-gray-600">Loading…</div>}
        {error && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}


