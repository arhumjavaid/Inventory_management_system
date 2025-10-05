import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { supabase, auth } from '../../lib/supabase';

export default function TopNav() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const unreadCount = notifications.filter(n => n.status === 'active').length;

  // Fetch notifications from alerts table
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        
        // Fetch recent alerts (last 50, ordered by newest first)
        const { data, error } = await supabase
          .from('alerts')
          .select(`
            id,
            type,
            status,
            title,
            message,
            severity,
            created_at,
            product_id,
            products (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications(data || []);
        }
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          // Refetch notifications when alerts change
          fetchNotifications();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          setLoading(false);
          return;
        }

        console.log('Auth user ID:', user.id);
        console.log('Auth user email:', user.email);

        // Fetch user profile from user_profiles table
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name, email, role')
          .eq('id', user.id)
          .single();

        console.log('Profile query result:', profile);
        console.log('Profile query error:', profileError);

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          console.error('Profile error details:', profileError.message, profileError.code);
          // Use auth user email as fallback
          setUserProfile({
            full_name: user.user_metadata?.full_name || 'User',
            email: user.email,
            role: 'staff'
          });
        } else {
          console.log('Successfully fetched profile:', profile);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Format time ago (e.g., "5 minutes ago", "2 hours ago")
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  // Handle notification click - mark as acknowledged
  const handleNotificationClick = async (notificationId, currentStatus) => {
    if (currentStatus === 'active') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('alerts')
          .update({
            status: 'acknowledged',
            acknowledged_by: user?.id,
            acknowledged_at: new Date().toISOString()
          })
          .eq('id', notificationId);

        if (error) {
          console.error('Error acknowledging notification:', error);
        } else {
          // Update local state
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === notificationId
                ? { ...notif, status: 'acknowledged' }
                : notif
            )
          );
        }
      } catch (error) {
        console.error('Error in handleNotificationClick:', error);
      }
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-blue-600 bg-blue-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    };
    return colors[severity] || colors.medium;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      } else {
        // Redirect to login page
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'staff': 'Staff'
    };
    return roleMap[role] || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products, sales, or users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-8 text-center">
                      <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.status)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notif.status === 'active' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(notif.severity)}`}>
                                {notif.severity}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {notif.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mb-1">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {notif.message}
                            </p>
                            {notif.products && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                Product: {notif.products.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notif.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                      <p className="text-xs mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/reports'); // Or create a dedicated notifications page
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {userProfile ? (
                <span className="text-white text-sm font-semibold">
                  {getUserInitials(userProfile.full_name)}
                </span>
              ) : (
                <User size={18} className="text-white" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">
                {loading ? 'Loading...' : userProfile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {loading ? '...' : getRoleDisplayName(userProfile?.role)}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-600" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-800">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {userProfile?.email || 'No email'}
                  </p>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings?tab=account');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} />
                    <span className="text-sm">My Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings size={16} />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
