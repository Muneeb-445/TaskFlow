import { useRef, useState } from "react";
import {
  updateCurrentUser,
  changePassword,
  uploadAvatar,
  removeAvatar,
} from "../api/users";

import {
  User,
  Mail,
  FileText,
  Camera,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import "./Profile.css";

function checkPassword(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}
export default function Profile({
  user,
  onSave,
  showToast,
  onPasswordChanged,
}) {
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

  const [name, setName] = useState(user.fullname);
  const [email] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passErr, setPassErr] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  const checks = checkPassword(newPass);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarUploading(true);

    try {
      const updatedUser = await uploadAvatar(file);

      onSave(updatedUser);

      showToast("Profile picture updated successfully!", "success");
    } catch (error) {
      const message =
        error.response?.data?.detail || "Failed to upload profile picture.";

      showToast(message, "error");
    } finally {
      setAvatarUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleAvatarRemove = async () => {
    setAvatarRemoving(true);

    try {
      const updatedUser = await removeAvatar();

      onSave(updatedUser);

      showToast("Profile picture removed successfully!", "success");
    } catch (error) {
      const message =
        error.response?.data?.detail || "Failed to remove profile picture.";

      showToast(message, "error");
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const updatedUser = await updateCurrentUser({
        fullname: name,
        bio: bio || null,
      });

      onSave(updatedUser);
      setSaved(true);

      showToast("Profile updated successfully!", "success");

      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      const message =
        error.response?.data?.detail || "Failed to update profile.";

      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();

    if (!curPass) {
      setPassErr("Enter your current password.");
      return;
    }

    if (!Object.values(checks).every(Boolean)) {
      setPassErr("New password does not meet requirements.");
      return;
    }

    setPassErr("");

    try {
      await changePassword({
        current_password: curPass,
        new_password: newPass,
      });

      try {
        await onPasswordChanged?.();
      } catch {
        // Password was changed successfully.
      }

      setPassSaved(true);
      setCurPass("");
      setNewPass("");

      showToast("Password changed successfully!", "success");

      setTimeout(() => setPassSaved(false), 2000);
    } catch (error) {
      const message =
        error.response?.data?.detail || "Failed to change password.";

      setPassErr(message);
    }
  };

  return (
    <div className="profile-page fade-in">
      <div className="profile-heading">
        <h1>Profile</h1>
        <p>Manage your personal information</p>
      </div>

      {/* Profile card */}
      <div
        className={`profile-card ${avatarPreviewOpen ? "profile-card-preview-active" : ""
          }`}
      >
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {user.avatar_url ? (
              <button
                type="button"
                className="profile-avatar-preview-button"
                onClick={() => setAvatarPreviewOpen(true)}
                aria-label="View profile picture"
              >
                <img
                  src={`http://127.0.0.1:8000${user.avatar_url}`}
                  alt="Profile"
                  className="profile-avatar profile-avatar-image"
                />
              </button>
            ) : (
              <div className="profile-avatar">{initials}</div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              hidden
            />

            <button
              type="button"
              className="profile-camera-button"
              aria-label="Change profile picture"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading || avatarRemoving}
            >
              {avatarUploading ? (
                <span className="profile-spinner" />
              ) : (
                <Camera size={10} />
              )}
            </button>

            {user.avatar_url && (
              <button
                type="button"
                className="profile-remove-avatar-button"
                onClick={handleAvatarRemove}
                disabled={avatarRemoving || avatarUploading}
                aria-label="Remove profile picture"
                title="Remove profile picture"
              >
                {avatarRemoving ? (
                  <span className="profile-spinner" />
                ) : (
                  <Trash2 size={12} />
                )}
              </button>
            )}
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

              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="profile-field">
              <label>
                <span className="profile-label-content">
                  <Mail size={11} />
                  Email Address
                </span>
              </label>

              <input type="email" value={email} readOnly />
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
              value={bio ?? ""}
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
              "Save Changes"
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
                type={showCur ? "text" : "password"}
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowCur((current) => !current)}
                className="password-toggle"
                aria-label={showCur ? "Hide password" : "Show password"}
              >
                {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label>New Password</label>

            <div className="password-input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Create a strong password"
              />

              <button
                type="button"
                onClick={() => setShowNew((current) => !current)}
                className="password-toggle"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {newPass && (
              <div className="password-checks">
                {[
                  { ok: checks.length, label: "8+ chars" },
                  { ok: checks.upper, label: "Uppercase" },
                  { ok: checks.number, label: "Number" },
                  { ok: checks.special, label: "Special character" },
                ].map(({ ok, label }) => (
                  <span
                    key={label}
                    className={`password-check ${ok ? "password-check-valid" : ""
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
              "Update Password"
            )}
          </button>
        </form>
      </div>
      {avatarPreviewOpen && (
        <div
          className="avatar-preview-overlay"
          onClick={() => setAvatarPreviewOpen(false)}
        >
          <div
            className="avatar-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="avatar-preview-close"
              onClick={() => setAvatarPreviewOpen(false)}
              aria-label="Close profile picture preview"
            >
              <X size={20} />
            </button>

            <img
              src={`http://127.0.0.1:8000${user.avatar_url}`}
              alt="Profile preview"
              className="avatar-preview-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}
