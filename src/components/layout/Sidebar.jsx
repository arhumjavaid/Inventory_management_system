import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  FileText, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// All menu items (Users will be filtered based on role)
const allMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'staff'] },
  { icon: Package, label: 'Products', path: '/products', roles: ['admin', 'manager', 'staff'] },
  { icon: ShoppingCart, label: 'Sales', path: '/sales', roles: ['admin', 'manager', 'staff'] },
  { icon: TrendingUp, label: 'Purchases', path: '/purchases', roles: ['admin', 'manager', 'staff'] },
  { icon: FileText, label: 'Reports', path: '/reports', roles: ['admin', 'manager', 'staff'] },
  { icon: Users, label: 'Users', path: '/users', roles: ['admin'] }, // Only admins can see this
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'manager', 'staff'] },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          // Default to showing all items except Users if error
          setMenuItems(allMenuItems.filter(item => item.path !== '/users'));
          setLoading(false);
          return;
        }

        // Fetch user profile to get role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Default to staff role if error (hide Users tab)
          setMenuItems(allMenuItems.filter(item => item.roles.includes('staff')));
        } else {
          console.log('User role from sidebar:', profile.role);
          // Filter menu items based on user role
          setMenuItems(allMenuItems.filter(item => item.roles.includes(profile.role)));
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        // Default to showing all items except Users if error
        setMenuItems(allMenuItems.filter(item => item.path !== '/users'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-40
          bg-white shadow-lg transition-all duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl text-gray-800">SmartStock</span>
            </div>
          )}
          
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile Close Button */}
          {isCollapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Package className="text-white" size={20} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {loading ? (
              // Loading skeleton
              <li className="px-3 py-3">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  {!isCollapsed && <div className="h-4 bg-gray-200 rounded w-24"></div>}
                </div>
              </li>
            ) : (
              menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                        ${active 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon size={20} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="text-xs text-gray-500 text-center">
              <p>SmartStock v1.0</p>
              <p className="mt-1">© 2024 All rights reserved</p>
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center">v1.0</div>
          )}
        </div>
      </aside>
    </>
  );
}
