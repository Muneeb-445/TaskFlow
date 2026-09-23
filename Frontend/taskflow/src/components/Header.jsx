import { useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  X,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";

import NotificationPanel from "./NotificationPanel";
import "./Header.css";

const NOTIF_COUNT = 2;

export default function Header({
  user,
  onNav,
  onLogout,
  onCreateTask,
  searchQuery,
  onSearch,
}) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleNotificationToggle = () => {
    setNotifOpen((open) => !open);
    setAvatarOpen(false);
  };

  const handleAvatarToggle = () => {
    setAvatarOpen((open) => !open);
    setNotifOpen(false);
  };

  return (
    <header className="header">
      {/* Search */}
      <div className="header-search">
        <Search size={15} className="header-search-icon" />

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search tasks…"
          className="header-search-input"
        />

        {searchQuery && (
          <button
            type="button"
            className="header-search-clear"
            onClick={() => onSearch("")}
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="header-actions">
        {/* Create — mobile only */}
        <button
          type="button"
          onClick={onCreateTask}
          className="header-create-button"
          aria-label="Create task"
        >
          <Plus size={18} />
        </button>

        {/* Notifications */}
        <div className="header-menu-wrapper">
          <button
            type="button"
            onClick={handleNotificationToggle}
            className="header-icon-button"
            aria-label="Notifications"
          >
            <Bell size={18} />

            {NOTIF_COUNT > 0 && <span className="notification-dot" />}
          </button>

          {notifOpen && (
            <NotificationPanel onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* Avatar menu */}
        <div className="header-menu-wrapper">
          <button
            type="button"
            onClick={handleAvatarToggle}
            className="avatar-button"
          >
            <div className="avatar-circle">{initials}</div>

            <span className="avatar-name">{user.name.split(" ")[0]}</span>

            <ChevronDown size={14} className="avatar-chevron" />
          </button>

          {avatarOpen && (
            <>
              <div
                className="avatar-overlay"
                onClick={() => setAvatarOpen(false)}
              />

              <div className="avatar-dropdown fade-in">
                <div className="avatar-user-info">
                  <p className="avatar-user-name">{user.name}</p>

                  <p className="avatar-user-email">{user.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNav("profile");
                    setAvatarOpen(false);
                  }}
                  className="dropdown-item"
                >
                  <User size={14} />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNav("settings");
                    setAvatarOpen(false);
                  }}
                  className="dropdown-item"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>

                <div className="dropdown-divider">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setAvatarOpen(false);
                    }}
                    className="dropdown-item dropdown-item-danger"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
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
