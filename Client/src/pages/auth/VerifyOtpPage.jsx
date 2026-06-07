import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

export default function VerifyOtpPage() {
  const { verifyOtp, loading } = useAuth();
  const navigate = useNavigate();
  const email = useLocation().state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter all 6 digits');
    const res = await verifyOtp({ email, otp: code });
    if (res.success) navigate('/login');
  };

  const resend = async () => {
    try {
      await api.resendOtp({ email });
      toast.success('New OTP sent!');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="p-8 card">
          <div className="mb-8 text-center">
            <Mail className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="mt-1 text-sm text-gray-500">OTP sent to <strong>{email}</strong></p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((val, i) => (
                <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={val}
                  onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-12 text-xl font-bold text-center transition-colors border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600" />
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-500">
            Didn't receive OTP?{' '}
            <button onClick={resend} className="font-medium text-primary-600 hover:underline">Resend</button>
          </p>
        </div>
      </div>
    </div>
  );
}
