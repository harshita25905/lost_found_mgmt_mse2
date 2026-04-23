import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiMapPin, FiCalendar, FiPhone, FiInfo } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    contactInfo: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchItems = async (query = '') => {
    setLoading(true);
    try {
      const url = query 
        ? `http://localhost:5000/api/items/search?name=${query}`
        : 'http://localhost:5000/api/items';
      const res = await axios.get(url);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchItems(e.target.value);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editItem) {
        await axios.put(`http://localhost:5000/api/items/${editItem._id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/items', formData, config);
      }
      setFormData({ itemName: '', description: '', type: 'Lost', location: '', contactInfo: '' });
      setShowForm(false);
      setEditItem(null);
      fetchItems();
    } catch (err) {
      console.error('Error saving item', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/items/${id}`, config);
        fetchItems();
      } catch (err) {
        console.error('Error deleting item', err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      contactInfo: item.contactInfo
    });
    setShowForm(true);
  };

  return (
    <div className="dashboard-container animate-fade">
      <header className="dashboard-header">
        <div className="search-bar glass">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search items by name..." 
            value={search}
            onChange={handleSearch}
          />
        </div>
        <button className="add-btn" onClick={() => { setShowForm(true); setEditItem(null); setFormData({ itemName: '', description: '', type: 'Lost', location: '', contactInfo: '' }); }}>
          <FiPlus /> Report Item
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass glass-card">
            <h3>{editItem ? 'Update Report' : 'Report Lost/Found Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name</label>
                  <input name="itemName" value={formData.itemName} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleFormChange}>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" value={formData.location} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Contact Info</label>
                  <input name="contactInfo" value={formData.contactInfo} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editItem ? 'Update' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="items-grid">
        {items.length > 0 ? items.map(item => (
          <div key={item._id} className="item-card glass animate-fade">
            <div className={`item-badge ${item.type.toLowerCase()}`}>
              {item.type}
            </div>
            <h4>{item.itemName}</h4>
            <p className="item-desc">{item.description}</p>
            
            <div className="item-details">
              <span><FiMapPin /> {item.location}</span>
              <span><FiCalendar /> {new Date(item.date).toLocaleDateString()}</span>
              <span><FiPhone /> {item.contactInfo}</span>
              <span><FiInfo /> Reported by: {item.user?.name || 'Anonymous'}</span>
            </div>

            {currentUser && item.user && (currentUser.id === item.user._id || currentUser.id === item.user) && (
              <div className="card-actions">
                <button onClick={() => handleEdit(item)} className="edit-btn"><FiEdit2 /></button>
                <button onClick={() => handleDelete(item._id)} className="delete-btn"><FiTrash2 /></button>
              </div>
            )}
          </div>
        )) : (
          <div className="no-items">
            {loading ? 'Loading items...' : 'No items found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
