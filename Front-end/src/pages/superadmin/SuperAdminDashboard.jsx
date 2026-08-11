import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdToggleOn, MdToggleOff, MdPeople, MdBusiness, MdCategory, MdDashboard } from 'react-icons/md';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

// ── Stat Card ──────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-bold text-content">{value ?? '—'}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/complaints/analytics')
      .then(res => setStats(res.data.data || res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ov = stats?.counts || stats?.overview || {};

  const doughnutData = stats ? {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
    datasets: [{
      data: [ov.pending||0, ov.in_progress||ov.inProgress||0, ov.resolved||0, ov.rejected||0, ov.closed||0],
      backgroundColor: ['#f59e0b','#8b5cf6','#10b981','#ef4444','#64748b'],
      borderWidth: 0,
    }],
  } : null;

  const deptBar = stats?.byDepartment ? {
    labels: stats.byDepartment.map(d => d.name || d._id),
    datasets: [
      { label: 'Total',    data: stats.byDepartment.map(d => d.count),    backgroundColor: '#3b82f6', borderRadius: 4 },
      { label: 'Resolved', data: stats.byDepartment.map(d => d.resolved||0), backgroundColor: '#10b981', borderRadius: 4 },
    ],
  } : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">Super Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">System-wide overview and management</p>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/super/complaints', label: 'All Complaints', icon: <MdDashboard />, color: 'from-blue-600 to-blue-700' },
          { to: '/super/users',      label: 'Manage Users',   icon: <MdPeople />,    color: 'from-purple-600 to-purple-700' },
          { to: '/super/departments',label: 'Departments',    icon: <MdBusiness />,  color: 'from-teal-600 to-teal-700' },
          { to: '/super/categories', label: 'Categories',     icon: <MdCategory />,  color: 'from-orange-600 to-orange-700' },
        ].map(nav => (
          <Link key={nav.to} to={nav.to}
            className={`bg-gradient-to-br ${nav.color} rounded-2xl p-4 flex items-center gap-3 text-white hover:opacity-90 transition-opacity shadow-lg`}>
            <span className="text-2xl">{nav.icon}</span>
            <span className="font-semibold text-sm">{nav.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="stat-card animate-pulse"><div className="w-12 h-12 bg-[var(--bg-card-hover)] rounded-xl"/><div className="space-y-2"><div className="h-7 w-12 bg-[var(--bg-card-hover)] rounded"/><div className="h-3 w-20 bg-[var(--bg-card-hover)] rounded"/></div></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Complaints" value={ov.total}      icon={<MdDashboard className="text-2xl text-blue-400"/>}   color="bg-blue-500/10" />
          <StatCard label="Pending"          value={ov.pending}    icon={<MdPeople className="text-2xl text-amber-400"/>}     color="bg-amber-500/10" />
          <StatCard label="Resolved"         value={ov.resolved}   icon={<MdCategory className="text-2xl text-green-400"/>}   color="bg-green-500/10" />
          <StatCard label="Rejected"         value={ov.rejected}   icon={<MdBusiness className="text-2xl text-red-400"/>}     color="bg-red-500/10" />
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {doughnutData && (
          <div className="card">
            <h2 className="font-semibold text-content mb-4">Overall Status Distribution</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
            </div>
          </div>
        )}
        {deptBar && (
          <div className="card">
            <h2 className="font-semibold text-content mb-4">Complaints by Department</h2>
            <Bar data={deptBar} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } } } }} />
          </div>
        )}
      </div>
    </div>
  );
}
