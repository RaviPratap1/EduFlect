import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student' });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);
    if (res.success) navigate('/verify-otp', { state: { email: form.email } });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <GraduationCap className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start your learning journey today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Rahul" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Sharma" className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className="input-field pr-10" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass((p) => !p)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'instructor'].map((r) => (
                  <label key={r} className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${form.role === r ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
                    <input type="radio" name="role" value={r} checked={form.role === r} onChange={handleChange} className="sr-only" />
                    <span className="text-sm font-medium capitalize">{r === 'student' ? '🎓 Learn' : '📚 Teach'}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
