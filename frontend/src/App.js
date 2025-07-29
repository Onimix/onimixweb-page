import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'verses', label: 'Verse Manager', icon: '🎤' },
    { id: 'store', label: 'Store', icon: '🛒' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 z-10">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-purple-400 mb-8">ONIMIX</h1>
        <nav>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                activeSection === item.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

const VerseManager = () => {
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    category: 'freestyle',
    beat_name: '',
    beat_external_link: '',
    tags: [],
    notes: '',
    is_complete: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchVerses();
  }, []);

  const fetchVerses = async () => {
    try {
      const response = await axios.get(`${API}/verses`);
      setVerses(response.data);
    } catch (error) {
      console.error('Error fetching verses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const verseData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== '')
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

  const handleDelete = async (verseId) => {
    if (window.confirm('Are you sure you want to delete this verse?')) {
      try {
        await axios.delete(`${API}/verses/${verseId}`);
        fetchVerses();
        if (selectedVerse && selectedVerse.id === verseId) {
          resetForm();
        }
      } catch (error) {
        console.error('Error deleting verse:', error);
      }
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
      is_complete: verse.is_complete
    });
    setIsEditing(true);
  };

  const filteredVerses = verses.filter(verse => {
    const matchesSearch = verse.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         verse.lyrics.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || verse.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Verse List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Verses</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Verse
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search verses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="album">Album</option>
            <option value="freestyle">Freestyle</option>
            <option value="hooks">Hooks</option>
            <option value="complete_songs">Complete Songs</option>
          </select>
        </div>

        {/* Verse Cards */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredVerses.map(verse => (
            <div key={verse.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{verse.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  verse.is_complete ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                  {verse.is_complete ? 'Complete' : 'Draft'}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2 capitalize">{verse.category.replace('_', ' ')}</p>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {verse.lyrics.substring(0, 100)}...
              </p>
              {verse.beat_name && (
                <p className="text-purple-400 text-sm mb-3">🎵 {verse.beat_name}</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => editVerse(verse)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(verse.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verse Editor */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {selectedVerse ? 'Edit Verse' : 'New Verse'}
          </h2>
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
              <label className="block text-white mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

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
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Lyrics</label>
              <textarea
                value={formData.lyrics}
                onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
                rows="8"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="Write your verses here..."
                required
              />
            </div>

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
              <label className="block text-white mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="Production notes, ideas, etc."
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
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                {selectedVerse ? 'Update Verse' : 'Save Verse'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-4">📝</p>
            <p>Select a verse to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Store = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'tech_tools',
    product_type: 'digital',
    image_url: '',
    download_url: '',
    stock_quantity: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity)
      };
      await axios.post(`${API}/products`, productData);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'tech_tools',
      product_type: 'digital',
      image_url: '',
      download_url: '',
      stock_quantity: 0
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">ONIMIX Store</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Add Product
        </button>
      </div>

      {isEditing && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="tech_tools">Tech Tools</option>
                <option value="song_records">Song Records</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Type</label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-white mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Download URL (Digital products)</label>
              <input
                type="url"
                value={formData.download_url}
                onChange={(e) => setFormData({...formData, download_url: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-gray-800 rounded-lg p-6">
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
            <p className="text-gray-300 mb-3">{product.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl font-bold text-purple-400">${product.price}</span>
              <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm capitalize">
                {product.category.replace('_', ' ')}
              </span>
            </div>
            <span className="px-2 py-1 bg-green-600 text-white rounded text-sm capitalize">
              {product.product_type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!stats) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-2">Total Verses</h3>
          <p className="text-4xl font-bold text-white">{stats.total_verses}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-2">Products</h3>
          <p className="text-4xl font-bold text-white">{stats.total_products}</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-2">Orders</h3>
          <p className="text-4xl font-bold text-white">{stats.total_orders}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Verses by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.verse_by_category).map(([category, count]) => (
            <div key={category} className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-300 capitalize">{category.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-purple-400">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('verses');

  const renderSection = () => {
    switch (activeSection) {
      case 'verses':
        return <VerseManager />;
      case 'store':
        return <Store />;
      case 'analytics':
        return <Analytics />;
      default:
        return <VerseManager />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="ml-64 p-8">
        {renderSection()}
      </div>
    </div>
  );
}

export default App;