import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { MdPerson, MdEmail, MdLock, MdPhone, MdBadge } from 'react-icons/md';

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  useEffect(() => {
    API.get('/departments').then(res => setDepartments(res.data.departments || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    const { confirmPassword, ...rest } = data;
    const res = await registerUser(rest);
    if (res.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold text-content">Create Account</h1>
          <p className="text-muted mt-1">Join GrievanceHub as a student</p>
        </div>

        <div className="card glow-blue">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input className={`input pl-10 ${errors.name ? 'input-error' : ''}`} placeholder="Akash Kumar"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
              </div>
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">College Email</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input type="email" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} placeholder="you@college.edu"
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            {/* Roll No + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Roll Number</label>
                <div className="relative">
                  <MdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                  <input className={`input pl-10 ${errors.rollNumber ? 'input-error' : ''}`} placeholder="21CS001"
                    {...register('rollNumber', { required: 'Roll number required' })} />
                </div>
                {errors.rollNumber && <p className="error-text">{errors.rollNumber.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                  <input className={`input pl-10 ${errors.phone ? 'input-error' : ''}`} placeholder="9876543210"
                    {...register('phone', { pattern: { value: /^[0-9]{10}$/, message: '10 digit number' } })} />
                </div>
                {errors.phone && <p className="error-text">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="label">Department</label>
              <select className={`select ${errors.department ? 'input-error' : ''}`}
                {...register('department', { required: 'Department is required' })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
              </select>
              {errors.department && <p className="error-text">{errors.department.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input type="password" className={`input pl-10 ${errors.password ? 'input-error' : ''}`} placeholder="••••••••"
                  {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input type="password" className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: val => val === getValues('password') || 'Passwords do not match',
                  })} />
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3 mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
