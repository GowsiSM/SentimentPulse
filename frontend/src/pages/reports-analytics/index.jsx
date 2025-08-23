// src/pages/reports-analytics/index.jsx
// import Header from '../../components/ui/Header';
// import Button from '../../components/ui/Button';
// import Icon from '../../components/AppIcon';
// import React, { useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// const ReportsAnalytics = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [selectedMetric, setSelectedMetric] = useState('sentiment_trend');
//   const [selectedFormat, setSelectedFormat] = useState('pdf');
//   const [isExporting, setIsExporting] = useState(false);

//   const tabs = [
//     { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
//     { id: 'reports', label: 'Reports', icon: 'FileText' },
//     { id: 'export', label: 'Export', icon: 'Download' }
//   ];

//   // Data
//   const keyMetrics = [
//     { title: 'Total Reviews', value: '2,45,678', change: '+12.5%', trend: 'up', color: '#e40046' },
//     { title: 'Sentiment Score', value: '74.2%', change: '+3.2%', trend: 'up', color: '#e40046' },
//     { title: 'Products Monitored', value: '1,234', change: '+8.7%', trend: 'up', color: '#e40046' },
//     { title: 'Negative Alerts', value: '23', change: '-15.3%', trend: 'down', color: '#e06a6e' }
//   ];

//   const sentimentTrendData = [
//     { date: 'Aug 01', positive: 65, negative: 20, neutral: 15 },
//     { date: 'Aug 05', positive: 68, negative: 18, neutral: 14 },
//     { date: 'Aug 10', positive: 72, negative: 16, neutral: 12 },
//     { date: 'Aug 15', positive: 70, negative: 19, neutral: 11 },
//     { date: 'Aug 20', positive: 74, negative: 15, neutral: 11 }
//   ];

//   const productPerformanceData = [
//     { product: 'iPhone 14 Pro', score: 78 },
//     { product: 'Samsung Galaxy S24', score: 72 },
//     { product: 'OnePlus 12', score: 75 },
//     { product: 'Google Pixel 8', score: 80 }
//   ];

//   const categoryDistribution = [
//     { name: 'Electronics', value: 35, color: '#e40046' },
//     { name: 'Fashion', value: 25, color: '#e06a6e' },
//     { name: 'Home & Kitchen', value: 20, color: '#ffc315' },
//     { name: 'Books', value: 12, color: '#5a5a59' },
//     { name: 'Sports', value: 8, color: '#333333' }
//   ];

//   const reviewVolumeData = [
//     { month: 'May', volume: 15200 },
//     { month: 'Jun', volume: 18900 },
//     { month: 'Jul', volume: 22100 },
//     { month: 'Aug', volume: 26800 }
//   ];

//   const reportTemplates = [
//     { value: 'executive', label: 'Executive Summary', desc: 'High-level overview for leadership' },
//     { value: 'detailed', label: 'Detailed Analysis', desc: 'Comprehensive sentiment breakdown' },
//     { value: 'competitive', label: 'Competitive Report', desc: 'Market comparison insights' },
//     { value: 'trend', label: 'Trend Analysis', desc: 'Historical patterns and forecasts' }
//   ];

//   const handleExport = () => {
//     setIsExporting(true);
//     setTimeout(() => {
//       setIsExporting(false);
//       alert(`Report exported as ${selectedFormat.toUpperCase()}`);
//     }, 2000);
//   };

//   const renderChart = () => {
//     switch (selectedMetric) {
//       case 'sentiment_trend':
//         return (
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={sentimentTrendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
//               <XAxis dataKey="date" stroke="#5a5a59" fontSize={12} />
//               <YAxis stroke="#5a5a59" fontSize={12} />
//               <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
//               <Area type="monotone" dataKey="positive" stackId="1" stroke="#e40046" fill="#e40046" fillOpacity={0.7} />
//               <Area type="monotone" dataKey="neutral" stackId="1" stroke="#5a5a59" fill="#5a5a59" fillOpacity={0.7} />
//               <Area type="monotone" dataKey="negative" stackId="1" stroke="#e06a6e" fill="#e06a6e" fillOpacity={0.7} />
//             </AreaChart>
//           </ResponsiveContainer>
//         );
      
//       case 'product_performance':
//         return (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={productPerformanceData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
//               <XAxis dataKey="product" stroke="#5a5a59" fontSize={12} />
//               <YAxis stroke="#5a5a59" fontSize={12} />
//               <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
//               <Bar dataKey="score" fill="#e40046" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         );
      
//       case 'category_distribution':
//         return (
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={categoryDistribution}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={100}
//                 dataKey="value"
//                 label={({ name, value }) => `${name}: ${value}%`}
//               >
//                 {categoryDistribution.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         );
      
//       case 'review_volume':
//         return (
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={reviewVolumeData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
//               <XAxis dataKey="month" stroke="#5a5a59" fontSize={12} />
//               <YAxis stroke="#5a5a59" fontSize={12} />
//               <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
//               <Line type="monotone" dataKey="volume" stroke="#e40046" strokeWidth={3} dot={{ fill: '#e40046', strokeWidth: 2, r: 4 }} />
//             </LineChart>
//           </ResponsiveContainer>
//         );
      
//       default:
//         return null;
//     }
//   };

//   const DashboardView = () => (
//     <div className="space-y-6">
//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {keyMetrics.map((metric, index) => (
//           <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-3">
//               <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}1a` }}>
//                 <div className="w-4 h-4 rounded" style={{ backgroundColor: metric.color }}></div>
//               </div>
//               <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
//                 <span>{metric.trend === 'up' ? '↗' : '↘'}</span>
//                 <span className="ml-1">{metric.change}</span>
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-black mb-1">{metric.value}</div>
//             <div className="text-sm text-gray-600">{metric.title}</div>
//           </div>
//         ))}
//       </div>

//       {/* Chart Section */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
//           <h3 className="text-lg font-semibold text-black mb-4 sm:mb-0">Analytics Overview</h3>
          
//           <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
//             {[
//               { key: 'sentiment_trend', label: 'Sentiment' },
//               { key: 'product_performance', label: 'Products' },
//               { key: 'category_distribution', label: 'Categories' },
//               { key: 'review_volume', label: 'Volume' }
//             ].map((tab) => (
//               <Button
//                 key={tab.key}
//                 variant={selectedMetric === tab.key ? 'default' : 'ghost'}
//                 size="sm"
//                 onClick={() => setSelectedMetric(tab.key)}
//                 className={`rounded-none border-0 ${selectedMetric === tab.key ? 'bg-red-500 hover:bg-red-600' : ''}`}
//               >
//                 {tab.label}
//               </Button>
//             ))}
//           </div>
//         </div>

//         <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
//           {renderChart()}
//         </div>
//       </div>

//       {/* Insights */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//           <h3 className="text-lg font-semibold text-black mb-4">Key Insights</h3>
//           <div className="space-y-4">
//             <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
//               <div>
//                 <p className="text-sm font-medium text-black">Positive sentiment increased by 8%</p>
//                 <p className="text-xs text-gray-600">Electronics showing strongest growth</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
//               <div>
//                 <p className="text-sm font-medium text-black">Review volume up 26%</p>
//                 <p className="text-xs text-gray-600">Peak during promotional events</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
//               <div>
//                 <p className="text-sm font-medium text-black">Delivery concerns increased</p>
//                 <p className="text-xs text-gray-600">Focus area for improvement</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//           <h3 className="text-lg font-semibold text-black mb-4">Recommendations</h3>
//           <div className="space-y-3">
//             <div className="p-3 bg-gray-50 rounded-lg">
//               <p className="text-sm font-medium text-black">Expand electronics inventory</p>
//               <p className="text-xs text-gray-600 mt-1">Capitalize on positive sentiment trend</p>
//             </div>
//             <div className="p-3 bg-gray-50 rounded-lg">
//               <p className="text-sm font-medium text-black">Improve delivery communication</p>
//               <p className="text-xs text-gray-600 mt-1">Proactive shipping updates needed</p>
//             </div>
//             <div className="p-3 bg-gray-50 rounded-lg">
//               <p className="text-sm font-medium text-black">Optimize review collection</p>
//               <p className="text-xs text-gray-600 mt-1">Focus on post-purchase engagement</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const ReportsView = () => (
//     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//       <h3 className="text-lg font-semibold text-black mb-6">Generate Custom Report</h3>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Report Template</label>
//             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
//               <option value="">Choose a template</option>
//               {reportTemplates.map(template => (
//                 <option key={template.value} value={template.value}>{template.label}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Date Range</label>
//             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
//               <option value="7d">Last 7 Days</option>
//               <option value="30d">Last 30 Days</option>
//               <option value="90d">Last 90 Days</option>
//               <option value="custom">Custom Range</option>
//             </select>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Categories</label>
//             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
//               <option value="">All Categories</option>
//               <option value="electronics">Electronics</option>
//               <option value="fashion">Fashion</option>
//               <option value="home">Home & Kitchen</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Output Format</label>
//             <select 
//               value={selectedFormat}
//               onChange={(e) => setSelectedFormat(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
//             >
//               <option value="pdf">PDF Report</option>
//               <option value="excel">Excel Workbook</option>
//               <option value="csv">CSV Data</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="mt-8 pt-6 border-t border-gray-200">
//         <Button
//           variant="default"
//           onClick={handleExport}
//           disabled={isExporting}
//           loading={isExporting}
//           iconName="FileText"
//           iconPosition="left"
//           className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
//         >
//           {isExporting ? 'Generating...' : 'Generate Report'}
//         </Button>
//       </div>

//       {/* Report Templates Preview */}
//       <div className="mt-8">
//         <h4 className="text-md font-medium text-black mb-4">Available Templates</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {reportTemplates.map((template) => (
//             <div key={template.value} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
//               <div className="font-medium text-black">{template.label}</div>
//               <div className="text-sm text-gray-600 mt-1">{template.desc}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   const ExportView = () => (
//     <div className="space-y-6">
//       <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//         <h3 className="text-lg font-semibold text-black mb-6">Export Data</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Export Type</label>
//             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
//               <option value="analytics">Analytics Data</option>
//               <option value="reviews">Raw Reviews</option>
//               <option value="sentiment">Sentiment Scores</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Format</label>
//             <select 
//               value={selectedFormat}
//               onChange={(e) => setSelectedFormat(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
//             >
//               <option value="csv">CSV</option>
//               <option value="excel">Excel</option>
//               <option value="json">JSON</option>
//             </select>
//           </div>

//           <div className="flex items-end">
//             <Button
//               variant="default"
//               size="default"
//               onClick={handleExport}
//               disabled={isExporting}
//               loading={isExporting}
//               iconName="Download"
//               iconPosition="left"
//               fullWidth
//               className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
//             >
//               {isExporting ? 'Exporting...' : 'Export'}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Recent Downloads */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//         <h4 className="text-lg font-semibold text-black mb-4">Recent Downloads</h4>
//         <div className="space-y-3">
//           {[
//             { name: 'sentiment_analysis_2025-08-20.xlsx', date: '2025-08-20', size: '2.4 MB', type: 'Excel' },
//             { name: 'product_reviews_2025-08-19.csv', date: '2025-08-19', size: '5.1 MB', type: 'CSV' },
//             { name: 'analytics_summary_2025-08-18.pdf', date: '2025-08-18', size: '1.8 MB', type: 'PDF' }
//           ].map((file, index) => (
//             <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
//               <div className="flex items-center space-x-4">
//                 <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
//                   <span className="text-red-600 font-bold text-sm">{file.type.charAt(0)}</span>
//                 </div>
//                 <div>
//                   <div className="font-medium text-black">{file.name}</div>
//                   <div className="text-sm text-gray-600">{file.date} • {file.size}</div>
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-red-600 hover:text-red-800 hover:bg-red-50"
//               >
//                 Download
//               </Button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header Component */}
//       <Header />
      
//       {/* Custom Header Section */}
//       <div className="bg-white border-b border-gray-200 shadow-sm mt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
//                 <div className="text-white text-xl font-bold">📊</div>
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-black">Reports & Analytics</h1>
//                 <p className="text-gray-600">Comprehensive sentiment analysis and business insights</p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-500">
//                 Last updated: Aug 20, 2025 at 2:30 PM
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span className="text-sm text-gray-600">Analytics User</span>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="hover:bg-gray-200"
//                 title="Settings"
//               >
//                 <span>⚙️</span>
//               </Button>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//             <div className="bg-white border border-gray-200 rounded-lg p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                   <span className="text-green-600">↗️</span>
//                 </div>
//                 <div>
//                   <div className="text-lg font-bold text-black">74%</div>
//                   <div className="text-xs text-gray-600">Avg Sentiment</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white border border-gray-200 rounded-lg p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
//                   <span className="text-red-600">📄</span>
//                 </div>
//                 <div>
//                   <div className="text-lg font-bold text-black">156</div>
//                   <div className="text-xs text-gray-600">Reports Generated</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white border border-gray-200 rounded-lg p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
//                   <span className="text-yellow-600">⬇️</span>
//                 </div>
//                 <div>
//                   <div className="text-lg font-bold text-black">89</div>
//                   <div className="text-xs text-gray-600">Exports This Month</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white border border-gray-200 rounded-lg p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                   <span className="text-blue-600">⏰</span>
//                 </div>
//                 <div>
//                   <div className="text-lg font-bold text-black">12</div>
//                   <div className="text-xs text-gray-600">Scheduled Reports</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Tab Navigation */}
//         <div className="mb-8">
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8">
//               {tabs.map((tab) => (
//                 <Button
//                   key={tab.id}
//                   variant="ghost"
//                   size="default"
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none ${
//                     activeTab === tab.id
//                       ? 'border-red-500 text-red-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <span>
//                     {tab.icon === 'BarChart3' ? '📊' : 
//                      tab.icon === 'FileText' ? '📄' : 
//                      tab.icon === 'Download' ? '⬇️' : ''}
//                   </span>
//                   <span>{tab.label}</span>
//                 </Button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Content */}
//         {activeTab === 'dashboard' && <DashboardView />}
//         {activeTab === 'reports' && <ReportsView />}
//         {activeTab === 'export' && <ExportView />}
//       </div>
//     </div>
//   );
// };

// export default ReportsAnalytics;

import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMetric, setSelectedMetric] = useState('sentiment_trend');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'export', label: 'Export', icon: 'Download' }
  ];

  // Data
  const keyMetrics = [
    { title: 'Total Reviews', value: '2,45,678', change: '+12.5%', trend: 'up', color: '#e40046' },
    { title: 'Sentiment Score', value: '74.2%', change: '+3.2%', trend: 'up', color: '#e40046' },
    { title: 'Products Monitored', value: '1,234', change: '+8.7%', trend: 'up', color: '#e40046' },
    { title: 'Negative Alerts', value: '23', change: '-15.3%', trend: 'down', color: '#e06a6e' }
  ];

  const sentimentTrendData = [
    { date: 'Aug 01', positive: 65, negative: 20, neutral: 15 },
    { date: 'Aug 05', positive: 68, negative: 18, neutral: 14 },
    { date: 'Aug 10', positive: 72, negative: 16, neutral: 12 },
    { date: 'Aug 15', positive: 70, negative: 19, neutral: 11 },
    { date: 'Aug 20', positive: 74, negative: 15, neutral: 11 }
  ];

  const productPerformanceData = [
    { product: 'iPhone 14 Pro', score: 78 },
    { product: 'Samsung Galaxy S24', score: 72 },
    { product: 'OnePlus 12', score: 75 },
    { product: 'Google Pixel 8', score: 80 }
  ];

  const categoryDistribution = [
    { name: 'Electronics', value: 35, color: '#ff8a9b' },
    { name: 'Fashion', value: 25, color: '#ffa5a9' },
    { name: 'Home & Kitchen', value: 20, color: '#ffd97d' },
    { name: 'Books', value: 12, color: '#a5a5a4' },
    { name: 'Sports', value: 8, color: '#7a7a79' }
  ];

  const reviewVolumeData = [
    { month: 'May', volume: 15200 },
    { month: 'Jun', volume: 18900 },
    { month: 'Jul', volume: 22100 },
    { month: 'Aug', volume: 26800 }
  ];

  const reportTemplates = [
    { value: 'executive', label: 'Executive Summary', desc: 'High-level overview for leadership' },
    { value: 'detailed', label: 'Detailed Analysis', desc: 'Comprehensive sentiment breakdown' },
    { value: 'competitive', label: 'Competitive Report', desc: 'Market comparison insights' },
    { value: 'trend', label: 'Trend Analysis', desc: 'Historical patterns and forecasts' }
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report exported as ${selectedFormat.toUpperCase()}`);
    }, 2000);
  };

  const renderChart = () => {
    switch (selectedMetric) {
      case 'sentiment_trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
              <XAxis dataKey="date" stroke="#5a5a59" fontSize={12} />
              <YAxis stroke="#5a5a59" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#87ceeb" fill="#87ceeb" fillOpacity={0.6} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#ddd" fill="#ddd" fillOpacity={0.6} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ffb6c1" fill="#ffb6c1" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'product_performance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
              <XAxis dataKey="product" stroke="#5a5a59" fontSize={12} />
              <YAxis stroke="#5a5a59" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#87ceeb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'category_distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'review_volume':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reviewVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
              <XAxis dataKey="month" stroke="#5a5a59" fontSize={12} />
              <YAxis stroke="#5a5a59" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="volume" stroke="#87ceeb" strokeWidth={3} dot={{ fill: '#87ceeb', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}1a` }}>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: metric.color }}></div>
              </div>
              <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                <span>{metric.trend === 'up' ? '↗' : '↘'}</span>
                <span className="ml-1">{metric.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.title}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-black mb-4 sm:mb-0">Analytics Overview</h3>
          
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            {[
              { key: 'sentiment_trend', label: 'Sentiment' },
              { key: 'product_performance', label: 'Products' },
              { key: 'category_distribution', label: 'Categories' },
              { key: 'review_volume', label: 'Volume' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={selectedMetric === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(tab.key)}
                className={`rounded-none border-0 ${selectedMetric === tab.key ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          {renderChart()}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-black">Positive sentiment increased by 8%</p>
                <p className="text-xs text-gray-600">Electronics showing strongest growth</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-black">Review volume up 26%</p>
                <p className="text-xs text-gray-600">Peak during promotional events</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-black">Delivery concerns increased</p>
                <p className="text-xs text-gray-600">Focus area for improvement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-black">Expand electronics inventory</p>
              <p className="text-xs text-gray-600 mt-1">Capitalize on positive sentiment trend</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-black">Improve delivery communication</p>
              <p className="text-xs text-gray-600 mt-1">Proactive shipping updates needed</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-black">Optimize review collection</p>
              <p className="text-xs text-gray-600 mt-1">Focus on post-purchase engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsView = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-6">Generate Custom Report</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Report Template</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="">Choose a template</option>
              {reportTemplates.map(template => (
                <option key={template.value} value={template.value}>{template.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Date Range</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Categories</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Kitchen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Output Format</label>
            <select 
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Workbook</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="default"
          onClick={handleExport}
          disabled={isExporting}
          loading={isExporting}
          iconName="FileText"
          iconPosition="left"
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
        >
          {isExporting ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {/* Report Templates Preview */}
      <div className="mt-8">
        <h4 className="text-md font-medium text-black mb-4">Available Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map((template) => (
            <div key={template.value} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
              <div className="font-medium text-black">{template.label}</div>
              <div className="text-sm text-gray-600 mt-1">{template.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ExportView = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-6">Export Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Export Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="analytics">Analytics Data</option>
              <option value="reviews">Raw Reviews</option>
              <option value="sentiment">Sentiment Scores</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">Format</label>
            <select 
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="default"
              size="default"
              onClick={handleExport}
              disabled={isExporting}
              loading={isExporting}
              iconName="Download"
              iconPosition="left"
              fullWidth
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Downloads */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-black mb-4">Recent Downloads</h4>
        <div className="space-y-3">
          {[
            { name: 'sentiment_analysis_2025-08-20.xlsx', date: '2025-08-20', size: '2.4 MB', type: 'Excel' },
            { name: 'product_reviews_2025-08-19.csv', date: '2025-08-19', size: '5.1 MB', type: 'CSV' },
            { name: 'analytics_summary_2025-08-18.pdf', date: '2025-08-18', size: '1.8 MB', type: 'PDF' }
          ].map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">{file.type.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-black">{file.name}</div>
                  <div className="text-sm text-gray-600">{file.date} • {file.size}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Component */}
      <Header />
      
      {/* Custom Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Icon name="BarChart3" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Reports & Analytics</h1>
                <p className="text-gray-600">Comprehensive sentiment analysis and business insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: Aug 20, 2025 at 2:30 PM
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Analytics User</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200"
                title="Settings"
                iconName="Settings"
                iconSize={16}
              >
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={16} color="#16a34a" />
                </div>
                <div>
                  <div className="text-lg font-bold text-black">74%</div>
                  <div className="text-xs text-gray-600">Avg Sentiment</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={16} color="#dc2626" />
                </div>
                <div>
                  <div className="text-lg font-bold text-black">156</div>
                  <div className="text-xs text-gray-600">Reports Generated</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Download" size={16} color="#ca8a04" />
                </div>
                <div>
                  <div className="text-lg font-bold text-black">89</div>
                  <div className="text-xs text-gray-600">Exports This Month</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={16} color="#2563eb" />
                </div>
                <div>
                  <div className="text-lg font-bold text-black">12</div>
                  <div className="text-xs text-gray-600">Scheduled Reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="default"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'export' && <ExportView />}
      </div>
    </div>
  );
};

export default ReportsAnalytics;