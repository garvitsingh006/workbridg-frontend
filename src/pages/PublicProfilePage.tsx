import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Mail, Calendar, Award, Briefcase, Building2, User, HelpCircle } from 'lucide-react';
import axios from 'axios';

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${import.meta.env.VITE_SERVER}/profiles/${username}`, { withCredentials: true });
        setData(res.data?.data || res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data found</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const user = data.user || {};
  const name = user.fullName || user.username || username;
  const role = user.role || data.role;
  const isFreelancer = role === 'freelancer';
  const isClient = role === 'client';

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500 rounded-2xl opacity-5 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500 rounded-full opacity-5 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-500 rounded-2xl opacity-5 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`max-w-6xl mx-auto px-6 py-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-linear-to-r from-slate-100 to-slate-200 h-20 relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10"></div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-4 -mt-10 relative z-10">
              <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                <span className="text-xl font-bold text-slate-700">
                  {String(name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 md:mt-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 mb-1">{name}</h1>
                    <div className="flex items-center space-x-3 text-slate-600 mb-2">
                      <div className="flex items-center space-x-2">
                        {isFreelancer && <Briefcase className="w-4 h-4" />}
                        {isClient && <Building2 className="w-4 h-4" />}
                        <span className="capitalize font-medium text-sm">{role}</span>
                      </div>
                      {data.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{data.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Only show website for clients, not LinkedIn/GitHub for freelancers to prevent external contact */}
                    {isClient && data.website && (
                      <a 
                        href={data.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                About
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {data.companyDescription || data.bio || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Skills/Services Section */}
            {isFreelancer && data.skills && data.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Types for Clients */}
            {isClient && data.projectTypes && data.projectTypes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Project Types
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.projectTypes.map((type: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience for Freelancers */}
            {isFreelancer && data.workExperience && data.workExperience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Work Experience
                </h2>
                <div className="space-y-3">
                  {data.workExperience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-3 border-blue-200 pl-4 pb-3">
                      <h3 className="text-base font-semibold text-slate-900">{exp.title}</h3>
                      {exp.company && (
                        <p className="text-sm text-blue-600 font-medium mb-1">{exp.company}</p>
                      )}
                      <p className="text-xs text-slate-600 mb-2">{exp.years} years</p>
                      {exp.description && (
                        <p className="text-sm text-slate-700">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {/* Email - Primary contact method */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-800 mb-1">Email</p>
                      <p className="text-sm font-medium text-blue-900">{user.email || data.email || 'Contact via platform'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Other contact info */}
                <div className="space-y-2">
                  {data.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{data.location}</span>
                    </div>
                  )}
                  {user.createdAt && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info for Clients */}
            {isClient && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Details</h3>
                <div className="space-y-3">
                  {data.industry && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Industry</span>
                      <p className="text-sm text-gray-900 capitalize">{data.industry}</p>
                    </div>
                  )}
                  {data.companySize && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Company Size</span>
                      <p className="text-sm text-gray-900">{data.companySize} employees</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info for Freelancers */}
            {isFreelancer && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Info</h3>
                <div className="space-y-3">
                  {data.workField && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Work Field</span>
                      <p className="text-sm text-gray-900 capitalize">{data.workField.replace('-', ' ')}</p>
                    </div>
                  )}
                  {data.preferredRole && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Preferred Role</span>
                      <p className="text-sm text-gray-900">{data.preferredRole}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Profile Stats - Full Width at Bottom */}
        {isFreelancer && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Statistics</h3>
            {data.isInterviewed ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data.rating ? data.rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm font-medium text-slate-600 flex items-center justify-center gap-1">
                    Overall Rating
                    <div className="relative group">
                      <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        This rating is given by interviewer
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">out of 5.0</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{data.completedProjects || 0}</div>
                  <div className="text-sm font-medium text-slate-600">Completed Projects</div>
                </div>
                {data.ratingDetails && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {data.ratingDetails.technical ? data.ratingDetails.technical.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm font-medium text-slate-600">Technical Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {data.ratingDetails.communication ? data.ratingDetails.communication.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm font-medium text-slate-600">Communication</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600 mb-2">
                        {data.ratingDetails.professionalism ? data.ratingDetails.professionalism.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm font-medium text-slate-600">Professionalism</div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg font-semibold text-amber-600 mb-2">Interview Pending</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

