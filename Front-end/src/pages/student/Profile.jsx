import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { MdPerson, MdEmail, MdPhone, MdLock, MdSave } from 'react-icons/md';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pe } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });
  const { register: regPwd, handleSubmit: handlePwd, getValues, reset, formState: { errors: we } } = useForm();

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      let res;
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone || '');
        formData.append('profileImage', profilePicFile);
        res = await API.put('/auth/update-profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.put('/auth/update-profile', data);
      }
      
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setProfilePicFile(null); // Clear pending file after successful upload
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const onChangePassword = async (data) => {
    setSaving(true);
    try {
      await API.put('/auth/change-password', { currentPassword: data.current, newPassword: data.newPwd });
      toast.success('Password changed successfully!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const ROLE_LABELS = { student: 'Student', dept_admin: 'Department Admin', super_admin: 'Super Admin' };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="page-title">My Profile</h1>

      {/* User Banner */}
      <div className="card bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-800/30">
        <div className="flex items-center gap-4">
          <label className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden group">
            {profilePicPreview || user?.profileImage ? (
              <img src={profilePicPreview || (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000/${user.profileImage.replace(/^\/+/, '')}`)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-medium text-center leading-tight px-1">Edit Photo</span>
            </div>
            
            {/* Hidden Input */}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProfilePicFile(e.target.files[0]);
                  setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
          </label>
          <div>
            <h2 className="text-xl font-bold text-content">{user?.name}</h2>
            <p className="text-muted text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/30">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </div>
        {user?.rollNumber && (
          <div className="mt-4 pt-4 border-t border-border flex gap-6 text-sm">
            <div><p className="text-muted text-xs">Roll Number</p><p className="text-muted font-medium">{user.rollNumber}</p></div>
            <div><p className="text-muted text-xs">Department</p><p className="text-muted font-medium">{user.department?.name || '—'}</p></div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {['profile', 'password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-blue-600 text-white' : 'text-muted hover:text-content'
            }`}>
            {t === 'profile' ? 'Edit Profile' : 'Change Password'}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {tab === 'profile' && (
        <form onSubmit={handleProfile(onSaveProfile)} className="card space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
              <input className={`input pl-10 ${pe.name ? 'input-error' : ''}`}
                {...regProfile('name', { required: 'Name required', minLength: { value: 2, message: 'Too short' } })} />
            </div>
            {pe.name && <p className="error-text">{pe.name.message}</p>}
          </div>

          <div>
            <label className="label">Email (read-only)</label>
            <div className="relative">
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
              <input className="input pl-10 opacity-50 cursor-not-allowed" value={user?.email} readOnly />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
              <input className={`input pl-10 ${pe.phone ? 'input-error' : ''}`} placeholder="10-digit number"
                {...regProfile('phone', { pattern: { value: /^[0-9]{10}$/, message: '10 digit number' } })} />
            </div>
            {pe.phone && <p className="error-text">{pe.phone.message}</p>}
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Password Form */}
      {tab === 'password' && (
        <form onSubmit={handlePwd(onChangePassword)} className="card space-y-4">
          {[
            { name: 'current', label: 'Current Password',  rules: { required: 'Required' } },
            { name: 'newPwd',  label: 'New Password',      rules: { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } } },
            { name: 'confirm', label: 'Confirm New Password', rules: { required: 'Required', validate: v => v === getValues('newPwd') || 'Passwords do not match' } },
          ].map(field => (
            <div key={field.name}>
              <label className="label">{field.label}</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input type="password" className={`input pl-10 ${we[field.name] ? 'input-error' : ''}`}
                  placeholder="••••••••" {...regPwd(field.name, field.rules)} />
              </div>
              {we[field.name] && <p className="error-text">{we[field.name].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary">
            <MdLock /> {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}
