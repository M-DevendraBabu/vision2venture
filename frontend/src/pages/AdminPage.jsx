import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { 
  FaUsers, FaTrash, FaShieldAlt, FaUserSlash, FaSearch, 
  FaRocket, FaCrown, FaCheckCircle, FaClock, FaCalendarAlt, FaFileAlt
} from 'react-icons/fa';
import api from '../services/api';
import '../styles/Admin.css';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchUsers();
    fetchStats();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Stats error', err);
    }
  };

  const fetchUserHistory = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}/history`);
      setUserHistory(res.data);
      setSelectedUser(users.find(u => u.id === userId));
    } catch (err) {
      toast.error('Failed to load history');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and ALL their data.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
      if (selectedUser?.id === userId) setSelectedUser(null);
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content flex-center">
          <div className="glass-card p-2xl text-center" style={{ maxWidth: 400, margin: '60px auto' }}>
            <FaUserSlash size={48} className="text-danger mb-md" />
            <h2>Access Denied</h2>
            <p className="text-secondary mt-sm">You need administrator privileges to access this control panel.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        
        {/* Admin Header */}
        <div className="admin-header mb-xl flex-between align-center flex-wrap gap-md">
          <div className="flex align-center gap-md">
            <div className="stat-icon-bg primary" style={{ width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaShieldAlt className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Control Panel</h1>
              <p className="text-secondary text-sm">User oversight, registration & startup analysis management</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="stats-row mb-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="glass-card p-lg flex align-center gap-md">
              <div className="stat-icon-bg primary" style={{ padding: 12, borderRadius: 10, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                <FaUsers size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.total_users || 0}</div>
                <div className="text-xs text-secondary font-medium uppercase tracking-wider">Registered Users</div>
              </div>
            </div>

            <div className="glass-card p-lg flex align-center gap-md">
              <div className="stat-icon-bg success" style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                <FaRocket size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{stats.total_ideas || 0}</div>
                <div className="text-xs text-secondary font-medium uppercase tracking-wider">Submitted Ideas</div>
              </div>
            </div>

            <div className="glass-card p-lg flex align-center gap-md">
              <div className="stat-icon-bg info" style={{ padding: 12, borderRadius: 10, background: 'rgba(6,182,212,0.15)', color: '#22d3ee' }}>
                <FaCheckCircle size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-info">{stats.total_completed || 0}</div>
                <div className="text-xs text-secondary font-medium uppercase tracking-wider">Completed Analyses</div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Oversight */}
        <div className="admin-section">
          <div className="flex-between align-center mb-md">
            <h2 className="text-lg font-bold text-white flex align-center gap-xs">
              <FaUsers className="text-primary" /> User & Idea Management
            </h2>
            <div className="text-xs text-secondary">
              Showing {filteredUsers.length} of {users.length} accounts
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '20px' }}>
              
              {/* User List */}
              <div className="glass-card p-lg">
                <div className="search-bar mb-md flex align-center gap-sm bg-glass p-sm rounded" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <FaSearch className="text-secondary ml-xs" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-white w-full"
                    style={{ outline: 'none', padding: '6px 10px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Desktop Table View (>= 769px) */}
                <div className="desktop-user-table user-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="admin-table w-full text-left" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th className="p-sm">User</th>
                        <th className="p-sm">Role</th>
                        <th className="p-sm">Joined Date</th>
                        <th className="p-sm">Ideas</th>
                        <th className="p-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="p-sm">
                            <div className="font-bold text-white" style={{ fontSize: '0.92rem' }}>{u.name}</div>
                            <div className="text-xs text-secondary">{u.email}</div>
                          </td>
                          <td className="p-sm">
                            {u.role === 'admin' ? (
                              <span className="tag" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                <FaCrown size={10} style={{ marginRight: 4 }} /> Admin
                              </span>
                            ) : (
                              <span className="tag" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                User
                              </span>
                            )}
                          </td>
                          <td className="p-sm text-xs text-secondary">
                            <div className="flex align-center gap-xs">
                              <FaCalendarAlt size={10} />
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="p-sm font-bold text-primary">{u.idea_count || 0}</td>
                          <td className="p-sm">
                            <div className="flex gap-xs">
                              <button
                                onClick={() => fetchUserHistory(u.id)}
                                className="btn text-xs flex align-center gap-xs"
                                style={{ background: selectedUser?.id === u.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                              >
                                <FaFileAlt size={11} /> History
                              </button>
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="btn text-xs text-danger"
                                  title="Delete User Account"
                                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  <FaTrash size={11} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (<= 768px) */}
                <div className="mobile-user-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
                  {filteredUsers.map(u => (
                    <div key={u.id} className="mobile-user-card" style={{ padding: '16px', background: '#131b2e', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{u.email}</div>
                        </div>
                        {u.role === 'admin' ? (
                          <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <FaCrown size={10} style={{ marginRight: 4 }} /> Admin
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            User
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <span>Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                        <span style={{ fontWeight: 700, color: '#818cf8' }}>Ideas: {u.idea_count || 0}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                          onClick={() => fetchUserHistory(u.id)}
                          style={{ flex: 1, padding: '8px', background: selectedUser?.id === u.id ? '#6366f1' : '#1e293b', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <FaFileAlt size={12} /> View History
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer' }}
                            title="Delete User"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected User History Detail Panel */}
              {selectedUser && (
                <div className="glass-card p-lg animate-fade-in">
                  <div className="flex-between mb-md pb-xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <h3 className="text-primary font-bold">{selectedUser.name}'s Idea History</h3>
                      <p className="text-xs text-secondary">{selectedUser.email}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedUser(null)} 
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Close
                    </button>
                  </div>
                  {userHistory.length === 0 ? (
                    <div className="text-center p-xl">
                      <FaLightbulb size={32} className="text-secondary mb-xs opacity-50" />
                      <p className="text-secondary text-sm">No startup ideas submitted yet by this user.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                      {userHistory.map(idea => (
                        <div key={idea.id} className="p-md bg-glass rounded" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                          <div className="flex-between align-center">
                            <div className="font-bold text-white">{idea.title}</div>
                            <span 
                              className="tag" 
                              style={{ 
                                background: idea.analysis_status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                color: idea.analysis_status === 'completed' ? '#34d399' : '#fbbf24',
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              {idea.analysis_status}
                            </span>
                          </div>
                          <p className="text-xs text-secondary mt-xs mb-xs" style={{ lineHeight: 1.4 }}>
                            {idea.description?.substring(0, 120)}{idea.description?.length > 120 ? '...' : ''}
                          </p>
                          <div className="flex-between text-xs mt-xs pt-xs" style={{ borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
                            <span className="text-info font-medium">{idea.sector || idea.industry}</span>
                            <span className="text-secondary flex align-center gap-xs">
                              <FaClock size={10} />
                              {idea.created_at ? new Date(idea.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
