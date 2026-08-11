import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import { MdAdd, MdToggleOn, MdToggleOff, MdEdit, MdSearch } from 'react-icons/md';

// ── Create Admin Modal ──────────────────────────────────────
const CreateAdminModal = ({ departments, onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await API.post('/users/create-admin', data);
      toast.success('Department admin created!');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="font-bold text-content text-lg mb-4">Create Department Admin</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name',  label: 'Full Name', type: 'text',  rules: { required: 'Required' } },
            { name: 'email', label: 'Email',     type: 'email', rules: { required: 'Required' } },
            { name: 'password', label: 'Password', type: 'password', rules: { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } } },
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input type={f.type} className={`input ${errors[f.name] ? 'input-error' : ''}`}
                {...register(f.name, f.rules)} />
              {errors[f.name] && <p className="error-text">{errors[f.name].message}</p>}
            </div>
          ))}
          <div>
            <label className="label">Department</label>
            <select className={`select ${errors.department ? 'input-error' : ''}`}
              {...register('department', { required: 'Required' })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            {errors.department && <p className="error-text">{errors.department.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManageUsers() {
  const [users,       setUsers]       = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search)                params.append('search', search);
      if (roleFilter !== 'All')  params.append('role', roleFilter);
      const { data } = await API.get(`/users?${params}`);
      setUsers(data.users || []);
    } catch { setUsers([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => {
    API.get('/departments').then(res => setDepartments(res.data.departments || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const toggleUser = async (id) => {
    try {
      const { data } = await API.patch(`/users/${id}/toggle`);
      toast.success(data.message);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const ROLES = ['All', 'student', 'dept_admin', 'super_admin'];
  const ROLE_LABELS = { student: 'Student', dept_admin: 'Dept Admin', super_admin: 'Super Admin' };

  return (
    <div className="space-y-5 animate-fade-in">
      {showModal && (
        <CreateAdminModal departments={departments} onClose={() => setShowModal(false)} onCreated={fetchUsers} />
      )}

      <div className="flex items-center justify-between">
        <h1 className="page-title mb-0">Manage Users</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <MdAdd /> Create Admin
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
          <input className="input pl-10" placeholder="Search by name, email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                roleFilter === r ? 'bg-blue-600 text-white' : 'bg-[var(--bg-card-hover)] text-muted hover:text-content'
              }`}>
              {ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-[var(--bg-card-hover)] rounded animate-pulse" />)}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="font-medium text-content">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.role === 'super_admin' ? 'bg-orange-500/10 text-orange-400' :
                      u.role === 'dept_admin'  ? 'bg-purple-500/10 text-purple-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{ROLE_LABELS[u.role] || u.role}</span>
                  </td>
                  <td>{u.department?.name || '—'}</td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleUser(u._id)}
                      className={`text-xl transition-colors ${u.isActive ? 'text-green-400 hover:text-red-400' : 'text-muted hover:text-green-400'}`}
                      title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <MdToggleOn /> : <MdToggleOff />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
