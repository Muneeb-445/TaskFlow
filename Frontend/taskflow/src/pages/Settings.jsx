import { useState } from 'react'
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
} from 'lucide-react'

import './Settings.css'

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`settings-toggle ${
        on ? 'settings-toggle-on' : 'settings-toggle-off'
      }`}
      aria-label={on ? 'Disable setting' : 'Enable setting'}
    >
      <span
        className={`settings-toggle-knob ${
          on
            ? 'settings-toggle-knob-on'
            : 'settings-toggle-knob-off'
        }`}
      />
    </button>
  )
}

function SettingRow({ label, description, toggle }) {
  return (
    <div className="settings-row">
      <div>
        <p className="settings-row-label">{label}</p>

        {description && (
          <p className="settings-row-description">
            {description}
          </p>
        )}
      </div>

      {toggle}
    </div>
  )
}

export default function Settings({ showToast }) {
  const [notifs, setNotifs] = useState({
    email: true,
    push: false,
    overdue: true,
    weekly: true,
    reminders: true,
  })

  const [theme, setTheme] = useState('light')
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false)

  const toggle = (key) => {
    setNotifs((current) => ({
      ...current,
      [key]: !current[key],
    }))

    showToast('Settings saved', 'success')
  }

  const themeOpts = [
    {
      val: 'light',
      label: 'Light',
      icon: Sun,
    },
    {
      val: 'dark',
      label: 'Dark',
      icon: Moon,
    },
    {
      val: 'system',
      label: 'System',
      icon: Monitor,
    },
  ]

  return (
    <div className="settings-page fade-in">
      {/* Page heading */}
      <div className="settings-heading">
        <h1>Settings</h1>
        <p>Manage your preferences</p>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="settings-section-header">
          <Bell size={16} />
          <h2>Notifications</h2>
        </div>

        <SettingRow
          label="Email notifications"
          description="Receive task reminders via email"
          toggle={
            <Toggle
              on={notifs.email}
              onToggle={() => toggle('email')}
            />
          }
        />

        <SettingRow
          label="Push notifications"
          description="Browser push notifications"
          toggle={
            <Toggle
              on={notifs.push}
              onToggle={() => toggle('push')}
            />
          }
        />

        <SettingRow
          label="Overdue alerts"
          description="Get notified when tasks become overdue"
          toggle={
            <Toggle
              on={notifs.overdue}
              onToggle={() => toggle('overdue')}
            />
          }
        />

        <SettingRow
          label="Weekly summary"
          description="Monday morning digest of your week"
          toggle={
            <Toggle
              on={notifs.weekly}
              onToggle={() => toggle('weekly')}
            />
          }
        />

        <SettingRow
          label="Task reminders"
          description="Reminders 1 hour before due time"
          toggle={
            <Toggle
              on={notifs.reminders}
              onToggle={() => toggle('reminders')}
            />
          }
        />
      </div>

      {/* Appearance */}
      <div className="settings-card">
        <h2 className="settings-card-title">
          Appearance
        </h2>

        <p className="settings-theme-label">
          Theme
        </p>

        <div className="settings-theme-grid">
          {themeOpts.map(({ val, label, icon: Icon }) => (
            <button
              type="button"
              key={val}
              onClick={() => {
                setTheme(val)
                showToast(
                  `Theme set to ${label}`,
                  'success'
                )
              }}
              className={`settings-theme-option ${
                theme === val
                  ? 'settings-theme-option-active'
                  : ''
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="settings-danger-card">
        <div className="settings-danger-line" />

        <div className="settings-danger-header">
          <AlertTriangle size={16} />
          <h2>Danger Zone</h2>
        </div>

        <p className="settings-danger-description">
          These actions are irreversible. Proceed with
          caution.
        </p>

        <div className="settings-danger-actions">
          {/* Delete completed tasks */}
          <div className="settings-danger-item">
            <div>
              <p className="settings-danger-item-title">
                Delete all completed tasks
              </p>

              <p className="settings-danger-item-description">
                Remove all tasks marked as completed
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                showToast(
                  'Completed tasks deleted.',
                  'success'
                )
              }
              className="settings-clear-button"
            >
              Clear tasks
            </button>
          </div>

          {/* Delete account */}
          <div className="settings-danger-item">
            <div>
              <p className="settings-danger-item-title">
                Delete account
              </p>

              <p className="settings-danger-item-description">
                Permanently remove your account and all
                data
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirm(true)
              }
              className="settings-delete-button"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="settings-modal">
          <div
            className="settings-modal-backdrop"
            onClick={() =>
              setShowDeleteConfirm(false)
            }
          />

          <div className="settings-modal-content fade-in">
            <div className="settings-modal-icon">
              <AlertTriangle size={22} />
            </div>

            <h3>Delete your account?</h3>

            <p>
              This will permanently delete all your tasks,
              categories, and account data. This cannot be
              undone.
            </p>

            <div className="settings-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  showToast(
                    'Account deletion cancelled.'
                  )
                }}
                className="settings-keep-button"
              >
                Keep account
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                className="settings-confirm-delete-button"
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}