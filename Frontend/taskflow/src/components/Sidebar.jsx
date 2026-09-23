import {
  LayoutDashboard,
  CheckSquare,
  Tag,
  User,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'

import './Sidebar.css'

const navItems = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'my-tasks', label: 'My Tasks', icon: CheckSquare },
  { page: 'categories', label: 'Categories', icon: Tag },
  { page: 'profile', label: 'Profile', icon: User },
  { page: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ current, onNav, onLogout }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={16} color="#ffffff" fill="white" />
        </div>

        <span className="sidebar-logo-text">
          TaskFlow
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ page, label, icon: Icon }) => {
          const active = current === page

          return (
            <button
              key={page}
              type="button"
              onClick={() => onNav(page)}
              className={`sidebar-nav-item ${
                active
                  ? 'sidebar-nav-item-active'
                  : 'sidebar-nav-item-inactive'
              }`}
            >
              <Icon
                size={18}
                className={`sidebar-nav-icon ${
                  active
                    ? 'sidebar-nav-icon-active'
                    : 'sidebar-nav-icon-inactive'
                }`}
              />

              <span className="sidebar-nav-label">
                {label}
              </span>

              {active && (
                <span className="sidebar-active-dot" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-logout">
        <button
          type="button"
          onClick={onLogout}
          className="sidebar-logout-button"
        >
          <LogOut size={18} />

          <span className="sidebar-logout-label">
            Logout
          </span>
        </button>
      </div>
    </aside>
  )
}

/* Mobile bottom navigation */
export function BottomNav({ current, onNav }) {
  const tabs = navItems.slice(0, 4)

  return (
    <nav className="bottom-nav">
      {tabs.map(({ page, label, icon: Icon }) => {
        const active = current === page

        return (
          <button
            key={page}
            type="button"
            onClick={() => onNav(page)}
            className={`bottom-nav-item ${
              active
                ? 'bottom-nav-item-active'
                : 'bottom-nav-item-inactive'
            }`}
          >
            <Icon size={20} />

            <span className="bottom-nav-label">
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}