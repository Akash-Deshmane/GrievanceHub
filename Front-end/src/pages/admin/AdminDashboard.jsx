import { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { MdList, MdPending, MdCheckCircle, MdCancel, MdTrendingUp, MdError } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CHART_OPTS = { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } } };

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-bold text-content">{value ?? '—'}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user }    = useAuth();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/complaints/analytics'),
      API.get('/complaints?limit=6'),
    ]).then(([aRes, cRes]) => {
      setStats(aRes.data.data || aRes.data.stats);
      setRecent(cRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const doughnutData = stats ? {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [{
      data: [
        stats.counts?.pending || stats.overview?.pending || 0,
        stats.counts?.inProgress || stats.overview?.in_progress || 0,
        stats.counts?.resolved || stats.overview?.resolved || 0,
        stats.counts?.rejected || stats.overview?.rejected || 0,
      ],
      backgroundColor: ['#f59e0b','#8b5cf6','#10b981','#ef4444'],
      borderWidth: 0,
    }],
  } : null;

  const barData = stats?.byCategory ? {
    labels: stats.byCategory.map(c => c.name || c._id),
    datasets: [{
      label: 'Complaints',
      data: stats.byCategory.map(c => c.count),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }],
  } : null;

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-[var(--bg-card-hover)] rounded w-1/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="stat-card"><div className="w-12 h-12 bg-[var(--bg-card-hover)] rounded-xl"/><div className="space-y-2"><div className="h-7 w-12 bg-[var(--bg-card-hover)] rounded"/><div className="h-3 w-20 bg-[var(--bg-card-hover)] rounded"/></div></div>)}
      </div>
    </div>
  );

  const ov = stats?.counts || stats?.overview || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">
            Admin Dashboard <span className="text-gradient">({user?.department?.name || ''})</span>
          </h1>
          <p className="text-muted text-sm mt-1">Manage and resolve department complaints</p>
        </div>
        <Link to="/admin/complaints" className="btn-primary"><MdList /> View All</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"       value={ov.total}      icon={<MdList className="text-2xl text-blue-400"/>}       color="bg-blue-500/10" />
        <StatCard label="Pending"     value={ov.pending}    icon={<MdPending className="text-2xl text-amber-400"/>}    color="bg-amber-500/10" />
        <StatCard label="In Progress" value={ov.in_progress || ov.inProgress} icon={<MdTrendingUp className="text-2xl text-purple-400"/>} color="bg-purple-500/10" />
        <StatCard label="Resolved"    value={ov.resolved}   icon={<MdCheckCircle className="text-2xl text-green-400"/>} color="bg-green-500/10" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {doughnutData && (
          <div className="card">
            <h2 className="font-semibold text-content mb-4">Status Breakdown</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut data={doughnutData} options={CHART_OPTS} />
            </div>
          </div>
        )}
        {barData && (
          <div className="card">
            <h2 className="font-semibold text-content mb-4">By Category</h2>
            <Bar data={barData} options={{ ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } }} />
          </div>
        )}
      </div>

      {/* Recent */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-content">Recent Complaints</h2>
          <Link to="/admin/complaints" className="text-blue-400 hover:text-blue-300 text-sm">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted text-center py-8">No complaints yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(c => (
                  <tr key={c._id}>
                    <td><Link to={`/admin/complaint/${c._id}`} className="text-blue-400 hover:text-blue-300 truncate block max-w-[180px]">{c.title}</Link></td>
                    <td>{c.isAnonymous ? <span className="text-muted italic">Anonymous</span> : c.student?.name || '—'}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
