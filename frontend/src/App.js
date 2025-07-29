import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Sidebar Component
const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { id: 'verses', label: 'Verse Manager', icon: '🎤', badge: 'NEW' },
    { id: 'beats', label: 'Beat Library', icon: '🎵', badge: null },
    { id: 'store', label: 'Store Manager', icon: '🛒', badge: null },
    { id: 'orders', label: 'Order Management', icon: '📦', badge: null },
    { id: 'customers', label: 'Customer Insights', icon: '👥', badge: null },
    { id: 'analytics', label: 'Advanced Analytics', icon: '📈', badge: null },
    { id: 'settings', label: 'Settings', icon: '⚙️', badge: null },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 z-10 shadow-2xl">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold">O</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">ONIMIX</h1>
            <p className="text-xs text-gray-400">Artist Platform Pro</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all duration-300 group ${
                activeSection === item.id 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg">
          <h3 className="font-semibold text-sm mb-1">Pro Tip</h3>
          <p className="text-xs text-green-100">Use bulk actions to manage multiple items efficiently</p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, verseAnalyticsResponse] = await Promise.all([
        axios.get(`${API}/analytics/dashboard`),
        axios.get(`${API}/analytics/verses`)
      ]);
      
      setStats({
        dashboard: dashboardResponse.data,
        verses: verseAnalyticsResponse.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  if (!stats) return <div className="text-white">Error loading dashboard</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, ONIMIX 🎤</h1>
          <p className="text-gray-400">Here's what's happening with your music empire</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Verses</p>
              <p className="text-3xl font-bold">{stats.dashboard.total_verses}</p>
              <p className="text-sm text-purple-200">
                {stats.verses.completion_rate.toFixed(1)}% completed
              </p>
            </div>
            <div className="text-4xl opacity-80">🎤</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Revenue</p>
              <p className="text-3xl font-bold">${stats.dashboard.total_revenue.toFixed(2)}</p>
              <p className="text-sm text-green-200">
                {stats.dashboard.total_orders} orders
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Products</p>
              <p className="text-3xl font-bold">{stats.dashboard.total_products}</p>
              <p className="text-sm text-orange-200">Active items</p>
            </div>
            <div className="text-4xl opacity-80">🛒</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Avg. Words</p>
              <p className="text-3xl font-bold">{stats.verses.average_word_count}</p>
              <p className="text-sm text-indigo-200">Per verse</p>
            </div>
            <div className="text-4xl opacity-80">📝</div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {stats.dashboard.monthly_revenue.slice(0, 4).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (month.revenue / 1000) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold w-20 text-right">
                    ${month.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {stats.dashboard.top_selling_products.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <span className="text-white">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{product.sold} sold</p>
                  <p className="text-gray-400 text-sm">${product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.dashboard.recent_activity.slice(0, 8).map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'verse' ? 'bg-purple-600' :
                activity.type === 'order' ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                {activity.type === 'verse' ? '🎤' : activity.type === 'order' ? '📦' : '🛒'}
              </div>
              <div className="flex-1">
                <p className="text-white">{activity.title}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                activity.type === 'verse' ? 'bg-purple-600 text-white' :
                activity.type === 'order' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {activity.category || activity.status || 'New'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Verse Manager with Bulk Operations
const VerseManager = () => {
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    category: 'freestyle',
    beat_name: '',
    beat_external_link: '',
    tags: [],
    notes: '',
    bpm: '',
    key: '',
    mood: '',
    priority: 'medium',
    collaborators: [],
    recording_notes: '',
    is_complete: false
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
    tags: ''
  });
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchVerses();
  }, [filters, sortBy]);

  const fetchVerses = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API}/verses?${params}`);
      setVerses(response.data);
    } catch (error) {
      console.error('Error fetching verses:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedVerses.length} verses?`)) {
      try {
        await axios.post(`${API}/verses/bulk-delete`, selectedVerses);
        fetchVerses();
        setSelectedVerses([]);
        setBulkMode(false);
      } catch (error) {
        console.error('Error bulk deleting:', error);
      }
    }
  };

  const exportVerse = async (verseId, format = 'txt') => {
    try {
      const response = await axios.get(`${API}/verses/${verseId}/export?format=${format}`);
      const blob = new Blob([response.data.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      a.click();
    } catch (error) {
      console.error('Error exporting verse:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const verseData = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        collaborators: Array.isArray(formData.collaborators) ? formData.collaborators : formData.collaborators.split(',').map(c => c.trim()).filter(c => c !== ''),
        bpm: formData.bpm ? parseInt(formData.bpm) : null
      };

      if (selectedVerse) {
        await axios.put(`${API}/verses/${selectedVerse.id}`, verseData);
      } else {
        await axios.post(`${API}/verses`, verseData);
      }
      
      fetchVerses();
      resetForm();
    } catch (error) {
      console.error('Error saving verse:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      lyrics: '',
      category: 'freestyle',
      beat_name: '',
      beat_external_link: '',
      tags: [],
      notes: '',
      bpm: '',
      key: '',
      mood: '',
      priority: 'medium',
      collaborators: [],
      recording_notes: '',
      is_complete: false
    });
    setSelectedVerse(null);
    setIsEditing(false);
  };

  const editVerse = (verse) => {
    setSelectedVerse(verse);
    setFormData({
      title: verse.title,
      lyrics: verse.lyrics,
      category: verse.category,
      beat_name: verse.beat_name || '',
      beat_external_link: verse.beat_external_link || '',
      tags: verse.tags || [],
      notes: verse.notes || '',
      bpm: verse.bpm || '',
      key: verse.key || '',
      mood: verse.mood || '',
      priority: verse.priority || 'medium',
      collaborators: verse.collaborators || [],
      recording_notes: verse.recording_notes || '',
      is_complete: verse.is_complete
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Verse Manager Pro</h2>
          <p className="text-gray-400">Organize, edit, and track your creative process</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              bulkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
          >
            {bulkMode ? 'Exit Bulk' : 'Bulk Actions'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? '📋 Table' : '⊞ Grid'}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
          >
            ✨ New Verse
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Search</label>
            <input
              type="text"
              placeholder="Search verses, lyrics, beats..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="album">Album</option>
              <option value="freestyle">Freestyle</option>
              <option value="hooks">Hooks</option>
              <option value="complete_songs">Complete Songs</option>
              <option value="drafts">Drafts</option>
              <option value="collaborations">Collaborations</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">Tags</label>
            <input
              type="text"
              placeholder="Filter by tags..."
              value={filters.tags}
              onChange={(e) => setFilters({...filters, tags: e.target.value})}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {bulkMode && selectedVerses.length > 0 && (
          <div className="mt-4 p-4 bg-red-900 bg-opacity-30 rounded-lg border border-red-600">
            <div className="flex items-center justify-between">
              <span className="text-red-300">
                {selectedVerses.length} verse(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verse List */}
        <div className="lg:col-span-2">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verses.map(verse => (
                <div key={verse.id} className="bg-gray-800 rounded-lg p-6 card-hover">
                  {bulkMode && (
                    <div className="mb-3">
                      <input
                        type="checkbox"
                        checked={selectedVerses.includes(verse.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVerses([...selectedVerses, verse.id]);
                          } else {
                            setSelectedVerses(selectedVerses.filter(id => id !== verse.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">{verse.title}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        verse.is_complete ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                        {verse.is_complete ? 'Complete' : 'Draft'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        verse.priority === 'urgent' ? 'bg-red-600 text-white' :
                        verse.priority === 'high' ? 'bg-orange-600 text-white' :
                        verse.priority === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {verse.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <p className="text-white capitalize">{verse.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Words:</span>
                      <p className="text-white">{verse.word_count || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Lines:</span>
                      <p className="text-white">{verse.line_count || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Version:</span>
                      <p className="text-white">v{verse.version}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {verse.lyrics.substring(0, 100)}...
                  </p>

                  {verse.beat_name && (
                    <p className="text-purple-400 text-sm mb-3">🎵 {verse.beat_name}</p>
                  )}

                  {verse.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {verse.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                      {verse.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          +{verse.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => editVerse(verse)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => exportVerse(verse.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Export
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete this verse?')) {
                          await axios.delete(`${API}/verses/${verse.id}`);
                          fetchVerses();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="pro-table">
                <thead>
                  <tr>
                    {bulkMode && <th className="w-12">Select</th>}
                    <th>Title</th>
                    <th>Category</th>
                    <th>Words</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verses.map(verse => (
                    <tr key={verse.id}>
                      {bulkMode && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedVerses.includes(verse.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVerses([...selectedVerses, verse.id]);
                              } else {
                                setSelectedVerses(selectedVerses.filter(id => id !== verse.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </td>
                      )}
                      <td className="font-semibold">{verse.title}</td>
                      <td className="capitalize">{verse.category.replace('_', ' ')}</td>
                      <td>{verse.word_count || 0}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${
                          verse.priority === 'urgent' ? 'bg-red-600 text-white' :
                          verse.priority === 'high' ? 'bg-orange-600 text-white' :
                          verse.priority === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          {verse.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${
                          verse.is_complete ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                        }`}>
                          {verse.is_complete ? 'Complete' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => editVerse(verse)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => exportVerse(verse.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enhanced Verse Editor */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {selectedVerse ? `Edit: ${selectedVerse.title}` : 'New Verse'}
            </h3>
            {isEditing && (
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="freestyle">Freestyle</option>
                    <option value="album">Album</option>
                    <option value="hooks">Hooks</option>
                    <option value="complete_songs">Complete Songs</option>
                    <option value="drafts">Drafts</option>
                    <option value="collaborations">Collaborations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Lyrics *</label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
                  rows="10"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="Write your verses here..."
                  required
                />
                <div className="text-xs text-gray-400 mt-1">
                  Words: {formData.lyrics.split(' ').filter(w => w.trim()).length} | 
                  Lines: {formData.lyrics.split('\n').filter(l => l.trim()).length}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Beat Name</label>
                  <input
                    type="text"
                    value={formData.beat_name}
                    onChange={(e) => setFormData({...formData, beat_name: e.target.value})}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Name of the beat"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">BPM</label>
                  <input
                    type="number"
                    value={formData.bpm}
                    onChange={(e) => setFormData({...formData, bpm: e.target.value})}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Key</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({...formData, key: e.target.value})}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="C Major, A Minor, etc."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Mood</label>
                  <input
                    type="text"
                    value={formData.mood}
                    onChange={(e) => setFormData({...formData, mood: e.target.value})}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Dark, Uplifting, Aggressive, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Beat Link</label>
                <input
                  type="url"
                  value={formData.beat_external_link}
                  onChange={(e) => setFormData({...formData, beat_external_link: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Tags</label>
                <input
                  type="text"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="rap, hip-hop, freestyle, battle"
                />
                <div className="text-xs text-gray-400 mt-1">Separate tags with commas</div>
              </div>

              <div>
                <label className="block text-white mb-2">Collaborators</label>
                <input
                  type="text"
                  value={Array.isArray(formData.collaborators) ? formData.collaborators.join(', ') : formData.collaborators}
                  onChange={(e) => setFormData({...formData, collaborators: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Producer, Featured Artist, etc."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Production notes, ideas, improvements..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Recording Notes</label>
                <textarea
                  value={formData.recording_notes}
                  onChange={(e) => setFormData({...formData, recording_notes: e.target.value})}
                  rows="2"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Recording session notes, vocal directions..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_complete"
                  checked={formData.is_complete}
                  onChange={(e) => setFormData({...formData, is_complete: e.target.checked})}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_complete" className="text-white">Mark as complete</label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  {selectedVerse ? 'Update Verse' : 'Save Verse'}
                </button>
                {selectedVerse && (
                  <button
                    type="button"
                    onClick={() => exportVerse(selectedVerse.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Export
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">🎤</div>
              <p className="text-xl mb-2">Ready to create?</p>
              <p>Select a verse to edit or create a new masterpiece</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'verses':
        return <VerseManager />;
      case 'store':
        return <div className="text-white text-center py-20">🛒 Store Manager - Coming in next update!</div>;
      case 'orders':
        return <div className="text-white text-center py-20">📦 Order Management - Coming in next update!</div>;
      case 'customers':
        return <div className="text-white text-center py-20">👥 Customer Insights - Coming in next update!</div>;
      case 'beats':
        return <div className="text-white text-center py-20">🎵 Beat Library - Coming in next update!</div>;
      case 'analytics':
        return <div className="text-white text-center py-20">📈 Advanced Analytics - Coming in next update!</div>;
      case 'settings':
        return <div className="text-white text-center py-20">⚙️ Settings - Coming in next update!</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 min-h-screen">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="ml-72 p-8">
        {renderSection()}
      </div>
    </div>
  );
}

export default App;