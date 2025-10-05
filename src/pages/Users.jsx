import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Alert from '../components/ui/Alert';
import { supabase } from '../lib/supabase';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: '',
  });

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setAlert({ type: 'error', message: 'Failed to load users' });
        return;
      }

      // Transform data to match component structure
      const transformedUsers = data.map(user => ({
        id: user.id,
        name: user.full_name || 'No Name',
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1), // Capitalize first letter
        status: user.status === 'active' ? 'Active' : 'Inactive',
        joinedDate: new Date(user.created_at).toLocaleDateString(),
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setAlert({ type: 'error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for adding new user
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'staff', password: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role.toLowerCase(),
      password: '' 
    });
    setIsModalOpen(true);
  };

  // Save user (add or update)
  const handleSaveUser = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    if (!editingUser && !formData.password) {
      setAlert({ type: 'error', message: 'Password is required for new users' });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.name,
            email: formData.email,
            role: formData.role.toLowerCase(),
          })
          .eq('id', editingUser.id);

        if (error) {
          console.error('Error updating user:', error);
          setAlert({ type: 'error', message: `Failed to update user: ${error.message}` });
          return;
        }

        setAlert({ type: 'success', message: 'User updated successfully!' });
      } else {
        // Create new user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (authError) {
          console.error('Error creating user:', authError);
          setAlert({ type: 'error', message: `Failed to create user: ${authError.message}` });
          return;
        }

        // Update the user profile with the correct role
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ role: formData.role.toLowerCase() })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Error updating role:', profileError);
          }
        }

        setAlert({ type: 'success', message: 'User created successfully!' });
      }

      // Refresh users list
      await fetchUsers();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: 'staff', password: '' });
    } catch (error) {
      console.error('Error in handleSaveUser:', error);
      setAlert({ type: 'error', message: 'An unexpected error occurred' });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: Deleting from user_profiles will cascade delete from auth.users due to foreign key
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        setAlert({ type: 'error', message: `Failed to delete user: ${error.message}` });
        return;
      }

      setAlert({ type: 'success', message: 'User deleted successfully!' });
      await fetchUsers();
    } catch (error) {
      console.error('Error in handleDeleteUser:', error);
      setAlert({ type: 'error', message: 'An unexpected error occurred' });
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error updating status:', error);
        setAlert({ type: 'error', message: 'Failed to update user status' });
        return;
      }

      await fetchUsers();
      setAlert({ type: 'success', message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!` });
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      setAlert({ type: 'error', message: 'An unexpected error occurred' });
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'joinedDate', label: 'Joined Date' },
    { key: 'actions', label: 'Actions' },
  ];

  // Format table data
  const tableData = filteredUsers.map(user => ({
    name: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User size={16} className="text-blue-600" />
        </div>
        <span className="font-medium">{user.name}</span>
      </div>
    ),
    email: user.email,
    role: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
        {user.role}
      </span>
    ),
    status: (
      <button
        onClick={() => toggleUserStatus(user.id, user.status)}
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.status === 'Active' 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        {user.status}
      </button>
    ),
    joinedDate: user.joinedDate,
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => handleEditUser(user)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="Edit user"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => handleDeleteUser(user.id)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Delete user"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage system users and their roles</p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <Plus size={18} />
          Add User
        </Button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <User size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">
                {users.filter(u => u.role === 'Admin').length}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Shield size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {users.filter(u => u.status === 'Active').length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <User size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Staff Members</p>
              <p className="text-2xl font-bold text-orange-800 mt-1">
                {users.filter(u => u.role === 'Staff').length}
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <User size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading users...</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={tableData} />
            
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                {users.length === 0 
                  ? 'No users found. Add your first user to get started.'
                  : 'No users found matching your criteria'}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveUser} className="flex-1">
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
