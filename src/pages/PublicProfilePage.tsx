import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${import.meta.env.VITE_SERVER}/profiles/${username}`, { withCredentials: true });
        setData(res.data?.data || res.data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) return <div className="p-6">Loading profile…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const user = data.user || {};
  const name = user.fullName || user.username || username;
  const role = user.role || data.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {String(name || '?').charAt(0)}
            </div>
            <div>
              <div className="text-2xl font-bold">{name}</div>
              <div className="text-sm text-gray-600">{role}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-2">About</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">{data.companyDescription || data.bio || '—'}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Details</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Email: {user.email || '—'}</li>
                <li>Location: {data.location || '—'}</li>
                {data.industry && <li>Industry: {data.industry}</li>}
                {data.website && <li>Website: <a className="text-blue-600" href={data.website} target="_blank" rel="noreferrer">{data.website}</a></li>}
                {data.linkedIn && <li>LinkedIn: <a className="text-blue-600" href={data.linkedIn} target="_blank" rel="noreferrer">{data.linkedIn}</a></li>}
              </ul>
            </div>
          </div>

          {/* Additional panels could go here */}
        </div>
      </div>
    </div>
  );
}


