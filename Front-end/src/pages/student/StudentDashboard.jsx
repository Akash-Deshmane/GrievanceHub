import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { MdAdd, MdList, MdCheckCircle, MdPending, MdError, MdTrendingUp } from 'react-icons/md';

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card animate-fade-in">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-bold text-content">{value ?? '—'}</p>
      <p className="text-sm text-muted mt-0.5">{label}</p>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes] = await Promise.all([
          API.get('/complaints?limit=5'),
        ]);
        const complaints = cRes.data.data || [];
        setRecent(complaints);

        // Compute stats client-side
        const all = await API.get('/complaints?limit=1000');
        const all_c = all.data.data || [];
        setStats({
          total:      all_c.length,
          pending:    all_c.filter(c => ['pending', 'Pending'].includes(c.status)).length,
          resolved:   all_c.filter(c => ['resolved', 'Resolved'].includes(c.status)).length,
          inProgress: all_c.filter(c => ['in_progress', 'In Progress'].includes(c.status)).length,
        });
      } catch {
        setStats({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted text-sm mt-1">Here's your complaint activity overview</p>
        </div>
        <Link to="/submit-complaint" className="btn-primary">
          <MdAdd className="text-lg" /> New Complaint
        </Link>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="w-12 h-12 bg-[var(--bg-card-hover)] rounded-xl" />
              <div className="space-y-2">
                <div className="h-7 w-12 bg-[var(--bg-card-hover)] rounded" />
                <div className="h-3 w-20 bg-[var(--bg-card-hover)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Submitted"   value={stats?.total}      icon={<MdList className="text-2xl text-blue-400" />}    color="bg-blue-500/10" />
          <StatCard label="Pending"           value={stats?.pending}    icon={<MdPending className="text-2xl text-amber-400" />} color="bg-amber-500/10" />
          <StatCard label="In Progress"       value={stats?.inProgress} icon={<MdTrendingUp className="text-2xl text-purple-400" />} color="bg-purple-500/10" />
          <StatCard label="Resolved"          value={stats?.resolved}   icon={<MdCheckCircle className="text-2xl text-green-400" />} color="bg-green-500/10" />
        </div>
      )}

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-content">Recent Complaints</h2>
          <Link to="/my-complaints" className="text-blue-400 hover:text-blue-300 text-sm font-medium">View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--bg-card-hover)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--bg-card-hover)] rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-[var(--bg-card-hover)] rounded-full" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="card text-center py-12">
            <MdError className="text-5xl text-muted mx-auto mb-3" />
            <p className="text-muted">No complaints submitted yet.</p>
            <Link to="/submit-complaint" className="btn-primary mt-4 inline-flex">
              <MdAdd /> Submit your first complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(c => (
              <Link to={`/complaint/${c._id}`} key={c._id} className="card-hover flex items-center justify-between gap-4 no-underline block">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-content truncate">{c.title}</p>
                  <p className="text-xs text-muted mt-1">
                    {c.category?.name || c.category} · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
