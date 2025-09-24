import { BarChart3, TrendingUp, Users, Eye, Calendar, Download } from 'lucide-react';

export default function Feature3() {
  const analyticsData = {
    totalViews: 12450,
    profileViews: 3200,
    projectInquiries: 89,
    responseRate: 95,
  };

  const chartData = [
    { month: 'Jan', views: 320, inquiries: 12 },
    { month: 'Feb', views: 450, inquiries: 18 },
    { month: 'Mar', views: 380, inquiries: 15 },
    { month: 'Apr', views: 520, inquiries: 22 },
    { month: 'May', views: 680, inquiries: 28 },
    { month: 'Jun', views: 590, inquiries: 25 },
  ];

  const topProjects = [
    { name: 'E-commerce Website Redesign', views: 245, inquiries: 8 },
    { name: 'Mobile App UI/UX Design', views: 189, inquiries: 6 },
    { name: 'Brand Identity Package', views: 156, inquiries: 4 },
    { name: 'Website Development', views: 134, inquiries: 3 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your performance and growth metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.totalViews.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Total Views</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.profileViews.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Profile Views</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+23%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.projectInquiries}
          </h3>
          <p className="text-gray-600 text-sm">Project Inquiries</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.responseRate}%
          </h3>
          <p className="text-gray-600 text-sm">Response Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">Views</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-gray-600">Inquiries</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {chartData.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-600">{month.views} views</span>
                    <span className="text-green-600">{month.inquiries} inquiries</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(month.views / 700) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(month.inquiries / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Projects */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Projects</h3>
          </div>
          <div className="p-6 space-y-4">
            {topProjects.map((project, index) => (
              <div key={project.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{project.views} views</span>
                      <span>{project.inquiries} inquiries</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {((project.inquiries / project.views) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Growth Opportunity</span>
            </div>
            <p className="text-sm text-blue-800">
              Your profile views increased by 15% this month. Consider updating your portfolio to maintain momentum.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">High Engagement</span>
            </div>
            <p className="text-sm text-green-800">
              Your response rate is excellent at 95%. Keep maintaining quick responses to client inquiries.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Seasonal Trend</span>
            </div>
            <p className="text-sm text-yellow-800">
              Project inquiries typically increase in Q2. Prepare your availability for upcoming opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}