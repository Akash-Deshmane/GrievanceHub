import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdAdd, MdList, MdPerson,
  MdAdminPanelSettings, MdCategory, MdBusiness,
  MdPeople, MdLogout, MdMenu, MdClose,
} from 'react-icons/md';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const studentLinks = [
  { to: '/dashboard',       icon: <MdDashboard />,         label: 'Dashboard' },
  { to: '/submit-complaint',icon: <MdAdd />,               label: 'Submit Complaint' },
  { to: '/my-complaints',   icon: <MdList />,              label: 'My Complaints' },
  { to: '/profile',         icon: <MdPerson />,            label: 'Profile' },
];

const adminLinks = [
  { to: '/admin',            icon: <MdDashboard />,        label: 'Dashboard' },
  { to: '/admin/complaints', icon: <MdList />,             label: 'Complaints' },
  { to: '/profile',          icon: <MdPerson />,           label: 'Profile' },
];

const superLinks = [
  { to: '/super',              icon: <MdDashboard />,      label: 'Dashboard' },
  { to: '/super/complaints',   icon: <MdList />,           label: 'All Complaints' },
  { to: '/super/users',        icon: <MdPeople />,         label: 'Manage Users' },
  { to: '/super/departments',  icon: <MdBusiness />,       label: 'Departments' },
  { to: '/super/categories',   icon: <MdCategory />,       label: 'Categories' },
  { to: '/profile',            icon: <MdPerson />,         label: 'Profile' },
];

const roleLinks = { student: studentLinks, dept_admin: adminLinks, super_admin: superLinks };
const roleLabel = { student: 'Student Portal', dept_admin: 'Admin Portal', super_admin: 'Super Admin' };
const roleColor = { student: 'from-blue-600 to-cyan-600', dept_admin: 'from-purple-600 to-blue-600', super_admin: 'from-orange-600 to-red-600' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = roleLinks[user?.role] || studentLinks;
  const gradient = roleColor[user?.role] || roleColor.student;

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-6 bg-gradient-to-br ${gradient}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl font-bold">G</div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">GrievanceHub</h1>
            <p className="text-white/70 text-xs mt-0.5">{roleLabel[user?.role]}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-content truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/super'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'bg-blue-600/20 text-blue-500 border border-blue-600/30'
                 : 'text-muted hover:text-content hover:bg-card-hover'}`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle & Logout */}
      <div className="p-3 border-t border-border flex flex-col gap-3">
        <ThemeToggle />
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-200">
          <MdLogout className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-xl text-content"
      >
        <MdMenu className="text-xl" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted hover:text-content">
          <MdClose className="text-xl" />
        </button>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 flex-shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
