import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { MdSearch, MdFilterList, MdAdd, MdInbox } from 'react-icons/md';

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'];

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('All');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 8 });
        if (status !== 'All') params.append('status', status);
        if (search)           params.append('search', search);
        const { data } = await API.get(`/complaints?${params}`);
        setComplaints(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch { setComplaints([]); }
      finally  { setLoading(false); }
    };
    fetch();
  }, [status, search, page]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title mb-0">My Complaints</h1>
        <Link to="/submit-complaint" className="btn-primary">
          <MdAdd /> New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
          <input className="input pl-10" placeholder="Search complaints..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <MdFilterList className="text-muted flex-shrink-0" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                status === s ? 'bg-blue-600 text-white' : 'bg-[var(--bg-card-hover)] text-muted hover:text-content'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--bg-card-hover)] rounded w-2/3" />
                <div className="h-3 bg-[var(--bg-card-hover)] rounded w-1/3" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-[var(--bg-card-hover)] rounded-full" />
                <div className="h-6 w-16 bg-[var(--bg-card-hover)] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-16">
          <MdInbox className="text-6xl text-slate-700 mx-auto mb-3" />
          <p className="text-muted text-lg font-medium">No complaints found</p>
          <p className="text-muted text-sm mt-1">Try adjusting your filters or submit a new complaint</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <Link to={`/complaint/${c._id}`} key={c._id}
              className="card-hover flex items-center justify-between gap-4 no-underline block">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-content truncate">{c.title}</p>
                <p className="text-xs text-muted mt-1 flex gap-3">
                  <span>{c.category?.name || '—'}</span>
                  <span>·</span>
                  <span>{c.department?.name || '—'}</span>
                  <span>·</span>
                  <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={c.priority} />
                <StatusBadge   status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-muted bg-[var(--bg-card-hover)] rounded-lg">
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
