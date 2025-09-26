import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Linkedin, Github, Mail, Calendar, Award, Briefcase, Building2, User } from 'lucide-react';
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
        setError(e?.message || 'Failed to load profile');
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
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
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
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500 rounded-2xl opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-500 rounded-2xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`max-w-6xl mx-auto p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16 relative z-10">
              <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white">
                <span className="text-4xl font-bold text-gray-700">
                  {String(name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 md:mt-16">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        {isFreelancer && <Briefcase className="w-4 h-4" />}
                        {isClient && <Building2 className="w-4 h-4" />}
                        <span className="capitalize font-medium">{role}</span>
                      </div>
                      {data.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{data.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {data.linkedIn && (
                      <a 
                        href={data.linkedIn} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {data.github && (
                      <a 
                        href={data.github} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {data.website && (
                      <a 
                        href={data.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                About
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {data.companyDescription || data.bio || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Skills/Services Section */}
            {isFreelancer && data.skills && data.skills.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-blue-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Types for Clients */}
            {isClient && data.projectTypes && data.projectTypes.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                  Project Types
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.projectTypes.map((type: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience for Freelancers */}
            {isFreelancer && data.workExperience && data.workExperience.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {data.workExperience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-6 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                      {exp.company && (
                        <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-3">{exp.years} years</p>
                      {exp.description && (
                        <p className="text-gray-700">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user.email || '—'}</span>
                </div>
                {data.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{data.location}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info for Clients */}
            {isClient && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Company Details</h3>
                <div className="space-y-4">
                  {data.industry && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Industry</span>
                      <p className="text-gray-900 capitalize">{data.industry}</p>
                    </div>
                  )}
                  {data.companySize && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Company Size</span>
                      <p className="text-gray-900">{data.companySize} employees</p>
                    </div>
                  )}
                  {data.budgetRange && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Typical Budget</span>
                      <p className="text-gray-900">{formatBudgetRange(data.budgetRange)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info for Freelancers */}
            {isFreelancer && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Info</h3>
                <div className="space-y-4">
                  {data.workField && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Work Field</span>
                      <p className="text-gray-900 capitalize">{data.workField.replace('-', ' ')}</p>
                    </div>
                  )}
                  {data.preferredRole && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Preferred Role</span>
                      <p className="text-gray-900">{data.preferredRole}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4.9</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBudgetRange(range: string): string {
  const ranges: { [key: string]: string } = {
    'under-1000': 'Under $1,000',
    '1000-5000': '$1,000 - $5,000',
    '5000-10000': '$5,000 - $10,000',
    '10000-25000': '$10,000 - $25,000',
    '25000-50000': '$25,000 - $50,000',
    '50000+': '$50,000+'
  };
  return ranges[range] || range;
}