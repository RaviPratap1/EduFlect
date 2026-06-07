import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ otp: '', newPassword: '', confirm: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.resetPassword({ email, otp: form.otp, newPassword: form.newPassword });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <ShieldCheck className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold">Reset Password</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input value={form.otp} onChange={(e) => setForm((p) => ({ ...p, otp: e.target.value }))} placeholder="6-digit OTP" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 8 characters" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
