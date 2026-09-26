import { useState } from 'react'
import {
  User,
  Mail,
  FileText,
  Camera,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

import './Profile.css'

function checkPassword(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
  }
}

export default function Profile({ user, onSave, showToast }) {
  const [name, setName] = useState(user.fullname)
  const [email, setEmail] = useState(user.email)
  const [bio, setBio] = useState(user.bio)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passErr, setPassErr] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  const checks = checkPassword(newPass)

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSave = (e) => {
    e.preventDefault()

    setSaving(true)

    setTimeout(() => {
      onSave({ name, email, bio })
      setSaving(false)
      setSaved(true)

      showToast('Profile updated successfully!', 'success')

      setTimeout(() => setSaved(false), 2000)
    }, 700)
  }

  const handlePassChange = (e) => {
    e.preventDefault()

    if (!curPass) {
      setPassErr('Enter your current password.')
      return
    }

    if (!Object.values(checks).every(Boolean)) {
      setPassErr('New password does not meet requirements.')
      return
    }

    setPassErr('')

    setTimeout(() => {
      setPassSaved(true)
      setCurPass('')
      setNewPass('')

      showToast('Password changed successfully!', 'success')

      setTimeout(() => setPassSaved(false), 2000)
    }, 700)
  }

  return (
    <div className="profile-page fade-in">
      <div className="profile-heading">
        <h1>Profile</h1>
        <p>Manage your personal information</p>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {initials}
            </div>

            <button
              type="button"
              className="profile-camera-button"
              aria-label="Change profile picture"
            >
              <Camera size={10} />
            </button>
          </div>

          <div className="profile-user-summary">
            <p className="profile-user-name">{name}</p>
            <p className="profile-user-email">{email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>
                <span className="profile-label-content">
                  <User size={11} />
                  Full Name
                </span>
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label>
                <span className="profile-label-content">
                  <Mail size={11} />
                  Email Address
                </span>
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-field">
            <label>
              <span className="profile-label-content">
                <FileText size={11} />
                Bio
              </span>
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="profile-primary-button"
          >
            {saving ? (
              <span className="profile-spinner" />
            ) : saved ? (
              <>
                <CheckCircle size={15} />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div className="profile-card">
        <h2 className="password-title">Change Password</h2>

        <form onSubmit={handlePassChange} className="password-form">
          <div className="profile-field">
            <label>Current Password</label>

            <div className="password-input-wrapper">
              <input
                type={showCur ? 'text' : 'password'}
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowCur((current) => !current)}
                className="password-toggle"
                aria-label={showCur ? 'Hide password' : 'Show password'}
              >
                {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label>New Password</label>

            <div className="password-input-wrapper">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Create a strong password"
              />

              <button
                type="button"
                onClick={() => setShowNew((current) => !current)}
                className="password-toggle"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {newPass && (
              <div className="password-checks">
                {[
                  { ok: checks.length, label: '8+ chars' },
                  { ok: checks.upper, label: 'Uppercase' },
                  { ok: checks.number, label: 'Number' },
                ].map(({ ok, label }) => (
                  <span
                    key={label}
                    className={`password-check ${
                      ok ? 'password-check-valid' : ''
                    }`}
                  >
                    <CheckCircle size={11} />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {passErr && <p className="password-error">{passErr}</p>}

          <button type="submit" className="profile-primary-button">
            {passSaved ? (
              <>
                <CheckCircle size={15} />
                Changed!
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}