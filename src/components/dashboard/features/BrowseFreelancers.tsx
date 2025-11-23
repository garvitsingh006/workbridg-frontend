import { useEffect, useState } from "react";
import api from "../../../api";
import { Star, MapPin, CheckCircle } from "lucide-react";

function truncate(str: string, n: number) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "..." : str;
}

function computeYears(workExperience: any[] | undefined) {
  if (!workExperience || !Array.isArray(workExperience)) return 0;
  return workExperience.reduce((acc, cur) => acc + (cur.years || 0), 0);
}

function FreelancerCard({ profile }: { profile: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 8);
    return () => clearTimeout(t);
  }, []);
  const user = profile?.user || {};
  const name = user.fullName || user.username || "Unknown";
  const username = user.username;
  const photo = user.photo || null;
  const location = profile.location || "-";
  const workField = profile.workField || profile.preferredRole || "Freelancer";
  const rating = profile.rating || 0;
  const ratingCount = profile.ratingCount || 0;
  const completedProjects = profile.completedProjects || 0;
  const isInterviewed = !!profile.isInterviewed;
  // Prefer backend-provided `totalYears` (from /profiles/list aggregation).
  // Fallback to summing `workExperience.years` if `totalYears` is not present.
  const totalYears = (typeof profile.totalYears === 'number'
    ? profile.totalYears
    : computeYears(profile.workExperience)) || 0;
  const pay = profile.pay_per_hour || profile.payPerHour || "--";
  const skills: string[] = profile.skills || [];

  const openProfile = () => {
    if (!username) return;
    const url = `/profile/${encodeURIComponent(username)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={openProfile}
      className={`cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      title={`View ${name} profile`}
    >
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700 overflow-hidden">
          {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : String(name).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <div className="text-sm text-gray-600 mt-1">{workField} · {rating.toFixed ? rating.toFixed(1) : rating} <Star className="inline-block w-4 h-4 text-yellow-500 ml-1" /> <span className="text-xs text-gray-500">({ratingCount})</span></div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">₹{pay}/hr</div>
              <div className="text-xs text-gray-500">{totalYears} yrs exp</div>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-700">{truncate(profile.bio || "No bio provided.", 100)}</div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" /> <span>{location}</span>
            </div>

            <div className="flex items-center gap-2">
              {isInterviewed ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
                  <CheckCircle className="w-4 h-4" /> Interviewed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-100">
                  Not interviewed
                </span>
              )}
            </div>
          </div>

          {skills && skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.slice(0, 5).map((s: string, i: number) => (
                <span key={i} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-100">{s}</span>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">{completedProjects} projects completed</div>
        </div>
      </div>
    </div>
  );
}

export default function BrowseFreelancers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & pagination
  // `searchInput` is a global live-search across multiple fields (skills, name, role, location, bio)
  const [searchInput, setSearchInput] = useState('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [workField, setWorkField] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [order, setOrder] = useState<'desc'|'asc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [displayProfiles, setDisplayProfiles] = useState<any[]>([]);

  const fetchList = async (opts?: { page?: number }) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page: opts?.page || page, limit };
      if (searchInput.trim()) params.skills = searchInput.split(',').map((s) => s.trim()).join(',');
      if (minRating !== '') params.minRating = minRating;
      if (location.trim()) params.location = location.trim();
      if (workField.trim()) params.workField = workField.trim();
      if (sortBy) params.sortBy = sortBy;
      if (order) params.order = order;

      const res = await api.get('/profiles/list', { params });
      const payload = res.data?.data || res.data;
      setProfiles(payload.data || []);
      setTotal(payload.total || 0);
      setPage(payload.page || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ page: 1 });
  }, []);

  // Update displayedProfiles whenever profiles load or searchInput/location/workField change (real-time client-side filter)
  useEffect(() => {
    // if no live filters are active, show the fetched profiles
    const hasLiveSearch = (searchInput && searchInput.trim() !== '') || (location && location.trim() !== '') || (workField && workField.trim() !== '');
    if (!hasLiveSearch) {
      setDisplayProfiles(profiles);
      return;
    }

    const q = (searchInput || '').trim().toLowerCase();
    const locQ = (location || '').trim().toLowerCase();
    const wfQ = (workField || '').trim().toLowerCase();

    // allow multiple comma/space separated tokens from searchInput
    const tokens = q ? q.split(/[,\s]+/).filter(Boolean) : [];

    const filtered = profiles.filter((p: any) => {
      const skills: string[] = (p.skills || []).map((s: string) => String(s).toLowerCase());

      // match any token against skills or name only (searchInput should be skills or name)
      const tokenMatch = tokens.length === 0 ? false : tokens.some(tok => {
        const bySkill = skills.some((s) => s.includes(tok));
        const byName = (p.user?.fullName || '').toLowerCase().includes(tok) || (p.user?.username || '').toLowerCase().includes(tok);
        return bySkill || byName;
      });

      // also apply live location and workField inputs (if provided)
      const locationMatch = locQ ? (p.location || '').toLowerCase().includes(locQ) : false;
      const workFieldMatch = wfQ ? ((p.workField || '').toLowerCase().includes(wfQ) || (p.preferredRole || '').toLowerCase().includes(wfQ)) : false;

      // combine: if tokens present require tokenMatch OR the explicit location/workfield matches
      const finalMatch = (tokens.length > 0 ? tokenMatch : true) && (locQ ? locationMatch : true) && (wfQ ? workFieldMatch : true);

      return finalMatch;
    });
    setDisplayProfiles(filtered);
  }, [searchInput, location, workField, profiles]);

  const applyFilters = () => {
    setPage(1);
    fetchList({ page: 1 });
  };

  const goToPage = (p: number) => {
    setPage(p);
    fetchList({ page: p });
  };

  if (loading) return <div className="p-6">Loading freelancers...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">Browse Freelancers</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">Discover vetted freelancers. Use the filters to narrow results by skills, rating, location or experience.</p>
        </header>

        <section className="bg-white rounded-2xl p-4 border border-gray-100 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Search (skills or name)</label>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="react or john doe" className="w-full mt-2 p-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or region" className="w-full mt-2 p-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Work Field / Role</label>
              <input value={workField} onChange={(e) => setWorkField(e.target.value)} placeholder="Frontend Developer" className="w-full mt-2 p-2 border rounded-lg" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-gray-600">Min Rating</label>
              <select value={String(minRating)} onChange={(e) => setMinRating(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-2 p-2 border rounded-lg">
                <option value={''}>Any</option>
                <option value={5}>5</option>
                <option value={4}>4+</option>
                <option value={3}>3+</option>
                <option value={2}>2+</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full mt-2 p-2 border rounded-lg">
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="completed">Completed Projects</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Order</label>
              <select value={order} onChange={(e) => setOrder(e.target.value === 'asc' ? 'asc' : 'desc')} className="w-full mt-2 p-2 border rounded-lg">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={applyFilters} className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer">Apply</button>
              <button type="button" onClick={() => { setSearchInput(''); setLocation(''); setWorkField(''); setMinRating(''); setSortBy('rating'); setOrder('desc'); setPage(1); fetchList({ page:1 }); }} className="px-4 py-2 border rounded-lg cursor-pointer">Reset</button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProfiles.length === 0 && <div className="text-gray-600">No freelancers found.</div>}
          {displayProfiles.map((p: any, idx: number) => (
            <FreelancerCard key={p.user?.username || idx} profile={p} />
          ))}
        </div>

          <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing page {page} of {totalPages} — {total} results</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page</span>
              <select value={limit} onChange={(e) => { const l = Number(e.target.value); setLimit(l); setPage(1); fetchList({ page: 1 }); }} className="p-1 border rounded cursor-pointer">
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Prev</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const p = Math.max(1, Math.min(totalPages, page - 2 + i));
                return (
                  <button key={i} type="button" onClick={() => goToPage(p)} className={`px-3 py-1 rounded ${p === page ? 'bg-purple-600 text-white' : 'border'} cursor-pointer`}>{p}</button>
                );
              })}
            </div>
            <button type="button" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
