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
      className={`cursor-pointer bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
      title={`View ${name} profile`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 overflow-hidden flex-shrink-0">
          {photo ? <img src={photo} alt={name} className="w-full h-full object-cover rounded-lg" /> : String(name).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{name}</h3>
          <p className="text-sm text-gray-600 mb-2">{workField}</p>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="font-medium text-gray-900">{rating.toFixed ? rating.toFixed(1) : rating}</span>
              <span className="text-gray-500">({ratingCount})</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{totalYears} yrs exp</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{truncate(profile.bio || "No bio provided.", 100)}</p>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-1.5 text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{location}</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">₹{pay}/hr</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{completedProjects}</span> projects
          </div>
          {isInterviewed ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">
              Unverified
            </span>
          )}
        </div>
      </div>

      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((s: string, i: number) => (
            <span key={i} className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded border font-medium">{s}</span>
          ))}
          {skills.length > 4 && (
            <span className="px-2 py-1 text-xs text-gray-500 font-medium">+{skills.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function BrowseFreelancers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & pagination
  const [searchInput, setSearchInput] = useState(''); // for skills
  const [nameSearch, setNameSearch] = useState(''); // for name
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
      if (nameSearch.trim()) params.name = nameSearch.trim();
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

  useEffect(() => {
    if (page === 1) {
      fetchList({ page: 1 });
    }
  }, [limit]);

  // Update displayedProfiles whenever profiles load or filters change (real-time client-side filter)
  useEffect(() => {
    // if no live filters are active, show the fetched profiles
    const hasLiveSearch = (searchInput && searchInput.trim() !== '') || (nameSearch && nameSearch.trim() !== '') || (location && location.trim() !== '') || (workField && workField.trim() !== '');
    if (!hasLiveSearch) {
      setDisplayProfiles(profiles);
      return;
    }

    const skillsQ = (searchInput || '').trim().toLowerCase();
    const nameQ = (nameSearch || '').trim().toLowerCase();
    const locQ = (location || '').trim().toLowerCase();
    const wfQ = (workField || '').trim().toLowerCase();

    // allow multiple comma/space separated tokens from searchInput (skills)
    const skillTokens = skillsQ ? skillsQ.split(/[,\s]+/).filter(Boolean) : [];
    const nameTokens = nameQ ? nameQ.split(/[\s]+/).filter(Boolean) : [];

    const filtered = profiles.filter((p: any) => {
      const skills: string[] = (p.skills || []).map((s: string) => String(s).toLowerCase());

      // match skills
      const skillMatch = skillTokens.length === 0 ? true : skillTokens.some(tok => 
        skills.some((s) => s.includes(tok))
      );

      // match name
      const nameMatch = nameTokens.length === 0 ? true : nameTokens.some(tok => 
        (p.user?.fullName || '').toLowerCase().includes(tok) || (p.user?.username || '').toLowerCase().includes(tok)
      );

      // match location and workField
      const locationMatch = locQ ? (p.location || '').toLowerCase().includes(locQ) : true;
      const workFieldMatch = wfQ ? ((p.workField || '').toLowerCase().includes(wfQ) || (p.preferredRole || '').toLowerCase().includes(wfQ)) : true;

      return skillMatch && nameMatch && locationMatch && workFieldMatch;
    });
    setDisplayProfiles(filtered);
  }, [searchInput, nameSearch, location, workField, profiles]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Browse Freelancers</h1>
            <p className="text-gray-600 mt-1 text-sm">Discover vetted freelancers. Use the filters to narrow results by skills, rating, location or experience.</p>
          </header>

          <section className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Skills</label>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="react, javascript" className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Name</label>
              <input value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} placeholder="john doe" className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or region" className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Work Field / Role</label>
              <input value={workField} onChange={(e) => setWorkField(e.target.value)} placeholder="Frontend Developer" className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Min Rating</label>
              <select value={String(minRating)} onChange={(e) => setMinRating(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm">
                <option value={''}>Any</option>
                <option value={5}>5</option>
                <option value={4}>4+</option>
                <option value={3}>3+</option>
                <option value={2}>2+</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm">
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="completed">Completed Projects</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order</label>
              <select value={order} onChange={(e) => setOrder(e.target.value === 'asc' ? 'asc' : 'desc')} className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <div className="flex gap-2 col-span-2 md:col-span-2">
              <button type="button" onClick={applyFilters} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm">Apply</button>
              <button type="button" onClick={() => { setSearchInput(''); setNameSearch(''); setLocation(''); setWorkField(''); setMinRating(''); setSortBy('rating'); setOrder('desc'); setPage(1); fetchList({ page:1 }); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm">Reset</button>
            </div>
          </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProfiles.length === 0 && (
              <div className="text-gray-600 col-span-full text-center py-8">No freelancers found.</div>
            )}

            {displayProfiles.map((p: any, idx: number) => (
              <FreelancerCard key={p.user?.username || idx} profile={p} />
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages} — {total} results
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Per page</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    setLimit(l);
                    setPage(1);
                  }}
                  className="px-2 py-1.5 border border-gray-200 rounded-md bg-white text-sm"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Prev
                </button>

                <div className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
                  {page}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
