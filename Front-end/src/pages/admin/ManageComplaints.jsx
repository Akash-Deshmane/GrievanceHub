import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { MdSearch, MdFilterList } from 'react-icons/md';

const STATUSES   = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const STATUS_OPTIONS = ['In Progress', 'Resolved', 'Rejected', 'Closed'];

const UpdateModal = ({ complaint, onClose, onUpdated }) => {
  const [status,  setStatus]  = useState(complaint.status);
  const [remarks, setRemarks] = useState(complaint.remarks || '');
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await API.put(`/complaints/${complaint._id}/status`, { status, remarks });
      toast.success('Status updated!');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="font-bold text-content text-lg mb-4">Update Complaint Status</h2>
        <p className="text-sm text-muted mb-4 truncate">{complaint.title}</p>

        <label className="label">New Status</label>
        <select className="select mb-4" value={status} onChange={e => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="label">Remarks</label>
        <textarea rows={3} className="input resize-none mb-4"
          placeholder="Add a remark or resolution note..."
          value={remarks} onChange={e => setRemarks(e.target.value)} />

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('All');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected,   setSelected]   = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status !== 'All') params.append('status', status);
      if (search)           params.append('search', search);
      const { data } = await API.get(`/complaints?${params}`);
      setComplaints(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch { setComplaints([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, [status, search, page]);

  return (
    <div className="space-y-5 animate-fade-in">
      {selected && (
        <UpdateModal complaint={selected} onClose={() => setSelected(null)} onUpdated={fetchComplaints} />
      )}

      <h1 className="page-title">Manage Complaints</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
          <input className="input pl-10" placeholder="Search by title..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <MdFilterList className="text-muted" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                status === s ? 'bg-blue-600 text-white' : 'bg-[var(--bg-card-hover)] text-muted hover:text-content'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-[var(--bg-card-hover)] rounded animate-pulse" />)}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 text-muted">No complaints found</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Student</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id}>
                  <td>
                    <Link to={`/admin/complaint/${c._id}`} className="text-blue-400 hover:text-blue-300 max-w-[160px] truncate block">
                      {c.title}
                    </Link>
                  </td>
                  <td>{c.isAnonymous ? <span className="italic text-muted">Anonymous</span> : c.student?.name || '—'}</td>
                  <td>{c.category?.name || '—'}</td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button onClick={() => setSelected(c)} className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors font-medium">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-muted bg-[var(--bg-card-hover)] rounded-lg">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
