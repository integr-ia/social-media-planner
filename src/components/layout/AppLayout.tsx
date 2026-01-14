import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar,
  LayoutDashboard,
  FileText,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Image,
  FolderOpen,
  type LucideIcon
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { User } from '@supabase/supabase-js'

interface AppLayoutProps {
  children: ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  disabled?: boolean
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Générer', href: '/generate', icon: Sparkles },
  { name: 'Mes Posts', href: '/posts', icon: FileText },
  { name: 'Calendrier', href: '/calendar', icon: Calendar, disabled: true },
  { name: 'Médias', href: '/media', icon: Image, disabled: true },
  { name: 'Templates', href: '/templates', icon: FolderOpen, disabled: true },
]

const bottomNavItems: NavItem[] = [
  { name: 'Paramètres', href: '/settings', icon: Settings, disabled: true },
]

// NavLink Component - Declared outside of render
interface NavLinkProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onCloseSidebar: () => void
}

function NavLink({ item, isActive, collapsed, onCloseSidebar }: NavLinkProps) {
  const Icon = item.icon

  if (item.disabled) {
    return (
      <div
        className={`
          flex items-center px-3 py-2.5 rounded-xl text-gray-400 cursor-not-allowed
          ${collapsed ? 'justify-center' : 'space-x-3'}
        `}
        title={`${item.name} (Bientôt disponible)`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="font-medium">{item.name}</span>
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Bientôt
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <Link
      to={item.href}
      onClick={onCloseSidebar}
      className={`
        flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
        ${collapsed ? 'justify-center' : 'space-x-3'}
        ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
      title={item.name}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="font-medium">{item.name}</span>}
    </Link>
  )
}

// SidebarContent Component - Declared outside of render
interface SidebarContentProps {
  user: User | null
  collapsed: boolean
  pathname: string
  onSignOut: () => void
  onCloseSidebar: () => void
  onToggleCollapse: () => void
}

function SidebarContent({
  user,
  collapsed,
  pathname,
  onSignOut,
  onCloseSidebar,
  onToggleCollapse
}: SidebarContentProps) {
  const isActivePath = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 border-b border-gray-200/50 ${collapsed ? 'px-3' : ''}`}>
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Social Media</h1>
              <p className="text-xs text-gray-500">Planner</p>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActivePath(item.href)}
            collapsed={collapsed}
            onCloseSidebar={onCloseSidebar}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-gray-200/50 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActivePath(item.href)}
            collapsed={collapsed}
            onCloseSidebar={onCloseSidebar}
          />
        ))}

        {/* Logout Button */}
        <button
          onClick={onSignOut}
          className={`
            flex items-center w-full px-3 py-2.5 rounded-xl text-gray-600
            hover:bg-red-50 hover:text-red-600 transition-all duration-200
            ${collapsed ? 'justify-center' : 'space-x-3'}
          `}
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Déconnexion</span>}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className={`p-3 border-t border-gray-200/50 ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapse Button (Desktop only) */}
      <div className="hidden lg:block p-3 border-t border-gray-200/50">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white/95 backdrop-blur-md border-r border-gray-200/50 z-50
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Mobile Close Button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          onClick={handleCloseSidebar}
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent
          user={user}
          collapsed={sidebarCollapsed}
          pathname={location.pathname}
          onSignOut={handleSignOut}
          onCloseSidebar={handleCloseSidebar}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Social Media Planner</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
