import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

interface User {
  userId: string;
  brokerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  notes?: string;
  id: string;
}

interface Statistics {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const adminToken = process.env.ADMIN_TOKEN || '123456';

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users', {
          headers: {
            'admin': adminToken
          }
        }),
        fetch('/api/admin/statistics', {
          headers: {
            'admin': adminToken
          }
        })
      ]);

      if (usersResponse.ok && statsResponse.ok) {
        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        
        setUsers(usersData);
        setStatistics(statsData);
        setError('');
      } else {
        setError('Failed to fetch admin data');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminToken
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        setError('Failed to approve user');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleReject = async (userId: string, reason = 'Rejected by admin') => {
    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminToken
        },
        body: JSON.stringify({ userId, reason })
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        setError('Failed to reject user');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminToken
        },
        body: JSON.stringify({ userIds: selectedUsers })
      });

      if (response.ok) {
        setSelectedUsers([]);
        fetchData();
      } else {
        setError('Failed to bulk approve users');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/bulk-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminToken
        },
        body: JSON.stringify({ userIds: selectedUsers, reason: 'Bulk rejected by admin' })
      });

      if (response.ok) {
        setSelectedUsers([]);
        fetchData();
      } else {
        setError('Failed to bulk reject users');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffaa00';
      case 'approved': return '#00ff88';
      case 'rejected': return '#ff4444';
      default: return '#ffffff';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.brokerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔐 Admin Panel</h1>
        <p>Керування користувачами та верифікаціями</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {statistics && (
        <div className="statistics">
          <div className="stat-card">
            <div className="stat-number">{statistics.totalUsers}</div>
            <div className="stat-label">Всього користувачів</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{statistics.pendingUsers}</div>
            <div className="stat-label">Очікують</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{statistics.approvedUsers}</div>
            <div className="stat-label">Підтверджено</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-number">{statistics.rejectedUsers}</div>
            <div className="stat-label">Відхилено</div>
          </div>
        </div>
      )}

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Пошук за Broker ID або User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Всі</option>
            <option value="pending">Очікують</option>
            <option value="approved">Підтверджено</option>
            <option value="rejected">Відхилено</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">Обрано: {selectedUsers.length}</span>
            <button className="bulk-approve-btn" onClick={handleBulkApprove}>
              ✅ Підтвердити всіх
            </button>
            <button className="bulk-reject-btn" onClick={handleBulkReject}>
              ❌ Відхилити всіх
            </button>
            <button className="clear-selection-btn" onClick={() => setSelectedUsers([])}>
              Очистити вибір
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Завантаження даних...</p>
        </div>
      ) : (
        <div className="users-table">
          <div className="table-header">
            <div className="checkbox-cell">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(filteredUsers.map(u => u.userId));
                  } else {
                    setSelectedUsers([]);
                  }
                }}
              />
            </div>
            <div className="user-id-cell">User ID</div>
            <div className="broker-id-cell">Broker ID</div>
            <div className="status-cell">Статус</div>
            <div className="date-cell">Створено</div>
            <div className="date-cell">Оновлено</div>
            <div className="actions-cell">Дії</div>
          </div>

          {filteredUsers.map(user => (
            <div key={user.id} className="table-row">
              <div className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.userId)}
                  onChange={() => toggleUserSelection(user.userId)}
                />
              </div>
              <div className="user-id-cell">
                <span className="user-id">{user.userId.slice(0, 8)}...</span>
              </div>
              <div className="broker-id-cell">
                <span className="broker-id">{user.brokerId}</span>
              </div>
              <div className="status-cell">
                <span 
                  className="status-badge"
                  style={{ color: getStatusColor(user.status) }}
                >
                  {getStatusIcon(user.status)} {user.status.toUpperCase()}
                </span>
              </div>
              <div className="date-cell">
                <span className="date">{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="date-cell">
                <span className="date">{formatDateTime(user.updatedAt)}</span>
              </div>
              <div className="actions-cell">
                {user.status === 'pending' && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(user.userId)}
                    >
                      ✅
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(user.userId)}
                    >
                      ❌
                    </button>
                  </>
                )}
                {user.status !== 'pending' && (
                  <span className="no-actions">—</span>
                )}
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="no-results">
              <p>Користувачів не знайдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
