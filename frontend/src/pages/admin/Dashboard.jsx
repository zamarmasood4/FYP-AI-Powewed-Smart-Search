import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Trash2, 
  Eye, 
  Search, 
  Shield, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  MoreHorizontal,
  Edit2,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  AlertCircle,
  LogOut
} from 'lucide-react';

// Simple Logout Dropdown Component
const AdminLogoutDropdown = ({ adminName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    if (!adminName) return 'A';
    
    const nameParts = adminName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return 'A';
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_info');
    
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Admin menu"
        aria-expanded={isOpen}
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 animate-fade-in z-50">
          {/* Admin info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-semibold">
                  {getInitials()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {adminName || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  System Admin
                </p>
              </div>
            </div>
          </div>

          {/* Only Logout Button */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    status: 'active'
  });

  // Get current admin name for profile dropdown
  const [adminName, setAdminName] = useState('Administrator');

  useEffect(() => {
    // Load admin user data from localStorage
    const loadAdminData = () => {
      try {
        const userData = localStorage.getItem('user');
        const userInfo = localStorage.getItem('user_info');
        
        let adminObj = null;
        
        if (userInfo) {
          adminObj = JSON.parse(userInfo);
        } else if (userData) {
          adminObj = JSON.parse(userData);
        }
        
        if (adminObj) {
          // Get admin name from user object
          const name = adminObj.full_name || 
                      (adminObj.first_name && adminObj.last_name ? `${adminObj.first_name} ${adminObj.last_name}` : 
                      adminObj.first_name || adminObj.email?.split('@')[0] || 'Administrator');
          setAdminName(name);
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    };

    loadAdminData();
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const admins = users.filter(u => u.role === 'admin').length;

    return {
      total: { value: total, trend: '+12%', trendUp: true },
      active: { value: active, trend: '+5%', trendUp: true },
      inactive: { value: inactive, trend: '-2%', trendUp: false },
      admins: { value: admins, trend: '0%', trendUp: true }
    };
  }, [users]);

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handlers
  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setCurrentUser(user);
    if (user && mode !== 'add') {
      setFormData({ ...user });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        department: '',
        status: 'active'
      });
    }
    setIsDialogOpen(true);
    setDropdownOpen(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dialogMode === 'add') {
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now'
      };
      setUsers([...users, newUser]);
    } else if (dialogMode === 'edit') {
      setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...formData } : u));
    }
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
    setDropdownOpen(null);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // UI Helpers
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
      moderator: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50',
      user: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50'
    };
    return styles[role] || styles.user;
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
      : 'bg-gray-400 dark:bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Admin<span className="text-indigo-600 dark:text-indigo-400">Panel</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
          
            
            {/* Admin Logout Dropdown */}
            <AdminLogoutDropdown adminName={adminName} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {adminName.split(' ')[0] || 'Admin'}!
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: 'Total Users', ...stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10', iconBg: 'bg-indigo-600' },
            { title: 'Active Users', ...stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10', iconBg: 'bg-emerald-600' },
            { title: 'Inactive', ...stats.inactive, icon: UserX, color: 'text-gray-600', bg: 'bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/20', iconBg: 'bg-gray-600' },
            { title: 'Administrators', ...stats.admins, icon: Shield, color: 'text-rose-600', bg: 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10', iconBg: 'bg-rose-600' },
          ].map((stat, idx) => (
            <div key={idx} className={`relative overflow-hidden ${stat.bg} rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 group`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                  {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full md:w-80 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {selectedRows.length > 0 && (
                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-sm font-medium">
                  <span>{selectedRows.length} selected</span>
                  <button onClick={() => setSelectedRows([])} className="hover:text-indigo-900 dark:hover:text-indigo-100">Clear</button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="w-12 px-6 py-4 text-left">
                    <input 
                      type="checkbox"
                      checked={selectedRows.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                          <Filter className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No users found</p>
                        <p className="text-sm">Try adjusting your filters or search query</p>
                        <button 
                          onClick={() => {setSearchTerm(''); setStatusFilter('all'); setRoleFilter('all');}}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors ${selectedRows.includes(user.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox"
                          checked={selectedRows.includes(user.id)}
                          onChange={() => toggleSelectRow(user.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadge(user.role)} capitalize`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(user.status)}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{user.lastActive}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button 
                            onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          {dropdownOpen === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                              <button 
                                onClick={() => handleOpenDialog('view', user)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4 text-gray-500" /> View Profile
                              </button>
                              <button 
                                onClick={() => handleOpenDialog('edit', user)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit2 className="h-4 w-4 text-blue-500" /> Edit Details
                              </button>
                              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                              <button 
                                onClick={() => handleDeleteClick(user)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredUsers.length}</span> of {users.length} users
            </span>
            <div className="flex gap-2">
              <button disabled className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">1</button>
              <button disabled className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* User Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {dialogMode === 'add' ? <><Plus className="h-5 w-5" /> Add New User</> : 
                   dialogMode === 'edit' ? <><Edit2 className="h-5 w-5" /> Edit User</> : 
                   <><Eye className="h-5 w-5" /> User Profile</>}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {dialogMode === 'view' ? 'View user information' : 'Manage user details and permissions'}
                </p>
              </div>
              <button onClick={() => setIsDialogOpen(false)} className="text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text"
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  disabled={dialogMode === 'view'}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email"
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  disabled={dialogMode === 'view'}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</label>
                  <select 
                    disabled={dialogMode === 'view'} 
                    value={formData.role} 
                    onChange={(e) => handleSelectChange('role', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</label>
                  <select 
                    disabled={dialogMode === 'view'}
                    value={formData.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {dialogMode === 'view' ? (
                  <button 
                    type="button" 
                    onClick={() => setIsDialogOpen(false)} 
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setIsDialogOpen(false)} 
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      {dialogMode === 'add' ? 'Create User' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteDialogOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-7 w-7 text-red-600 dark:text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete User?</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You are about to permanently delete{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {userToDelete?.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Data (keep this outside the component)
const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', department: 'Engineering', joinDate: '2024-01-15', status: 'active', lastActive: '2 mins ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', department: 'Management', joinDate: '2024-01-20', status: 'active', lastActive: '1 hour ago' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', department: 'Marketing', joinDate: '2024-02-10', status: 'inactive', lastActive: '3 days ago' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'moderator', department: 'Support', joinDate: '2024-02-15', status: 'active', lastActive: '5 mins ago' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', department: 'Engineering', joinDate: '2024-03-01', status: 'active', lastActive: 'Just now' },
  { id: 6, name: 'Eva Davis', email: 'eva@example.com', role: 'user', department: 'Design', joinDate: '2024-03-05', status: 'active', lastActive: '1 day ago' },
  { id: 7, name: 'Frank Miller', email: 'frank@example.com', role: 'user', department: 'Sales', joinDate: '2024-03-10', status: 'inactive', lastActive: '1 week ago' },
];

export default Dashboard;