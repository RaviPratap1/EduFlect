import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Star, CreditCard, Play, CheckCircle, Clock, Award, Menu, TrendingUp } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useEnrollment } from "../../../context/EnrollmentContext";
import { StatCard, ProgressBar, Spinner, EmptyState, StarRating } from "../../../components/common/index.jsx";
import * as api from "../../../api/services";
import toast from "react-hot-toast";

const links = [
  { to: "/dashboard/student", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/student/courses", label: "My Courses", icon: BookOpen },
  { to: "/dashboard/student/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/student/profile", label: "Profile", icon: Clock },
];

const Sidebar = ({ open, setOpen }) => (
  <>
    {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white z-40 flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="p-5 border-b border-gray-700"><p className="text-lg font-bold">🎓 Student Panel</p><p className="text-gray-400 text-sm mt-0.5">EduFlect</p></div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>
    </aside>
  </>
);

function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments, loading, fetchEnrollments } = useEnrollment();

  useEffect(() => { fetchEnrollments(); }, []);

  const totalCourses = enrollments.length;
  const completed = enrollments.filter((e) => e.progress?.isCompleted).length;
  const inProgress = enrollments.filter((e) => !e.progress?.isCompleted && (e.progress?.completionPercentage || 0) > 0).length;
  const avgProgress = totalCourses > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress?.completionPercentage || 0), 0) / totalCourses) : 0;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
      <p className="mb-6 text-gray-500">Keep learning and growing every day</p>
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={totalCourses} color="primary" />
        <StatCard icon={CheckCircle} label="Completed" value={completed} color="green" />
        <StatCard icon={TrendingUp} label="In Progress" value={inProgress} color="amber" />
        <StatCard icon={Award} label="Avg Progress" value={`${avgProgress}%`} color="red" />
      </div>
      {enrollments.length > 0 && (
        <div className="p-5 mb-6 card">
          <h2 className="mb-4 font-semibold">Continue Learning</h2>
          {loading ? <Spinner /> : (
            <div className="space-y-4">
              {enrollments.filter((e) => !e.progress?.isCompleted).slice(0, 4).map(({ course, progress }) => (
                <div key={course._id} className="flex items-center gap-4">
                  <div className="overflow-hidden w-14 h-14 rounded-xl bg-primary-100 shrink-0">
                    {course.thumbnail ? <img src={course.thumbnail} alt={course.name} className="object-cover w-full h-full" /> : <div className="flex items-center justify-center w-full h-full"><BookOpen className="w-6 h-6 text-primary-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ProgressBar value={progress?.completionPercentage || 0} className="flex-1" />
                      <span className="text-xs text-gray-500 shrink-0">{progress?.completionPercentage || 0}%</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/learn/${course._id}`)} className="btn-primary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1"><Play className="w-3.5 h-3.5" /> Resume</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {enrollments.length === 0 && !loading && (
        <EmptyState icon={BookOpen} title="No courses yet" description="Browse and enroll in your first course today!" action={<button onClick={() => navigate("/courses")} className="btn-primary">Browse Courses</button>} />
      )}
    </div>
  );
}

function MyCoursesPanel() {
  const navigate = useNavigate();
  const { enrollments, loading, fetchEnrollments } = useEnrollment();
  const [reviewModal, setReviewModal] = useState({ open: false, courseId: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { fetchEnrollments(); }, []);

  const submitReview = async () => {
    if (!reviewForm.review.trim()) return toast.error("Please write a review");
    setSubmittingReview(true);
    try {
      await api.createRating({ courseId: reviewModal.courseId, ...reviewForm });
      toast.success("Review submitted! 🌟");
      setReviewModal({ open: false, courseId: null });
      setReviewForm({ rating: 5, review: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <Spinner className="py-16" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Courses</h1>
      {enrollments.length === 0 ? (
        <EmptyState icon={BookOpen} title="No enrolled courses" description="Start your learning journey today!" action={<button onClick={() => navigate("/courses")} className="btn-primary">Browse Courses</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {enrollments.map(({ course, progress }) => (
            <div key={course._id} className="overflow-hidden card">
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 overflow-hidden rounded-xl bg-primary-100 shrink-0">
                  {course.thumbnail ? <img src={course.thumbnail} alt={course.name} className="object-cover w-full h-full" /> : <div className="flex items-center justify-center w-full h-full"><BookOpen className="w-8 h-8 text-primary-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 font-semibold line-clamp-2">{course.name}</h3>
                  <p className="mb-2 text-xs text-gray-500">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <ProgressBar value={progress?.completionPercentage || 0} className="flex-1" />
                    <span className="text-xs text-gray-500 shrink-0">{progress?.completionPercentage || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <button onClick={() => navigate(`/learn/${course._id}`)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5" />{(progress?.completionPercentage || 0) === 0 ? "Start" : "Continue"}
                </button>
                {progress?.isCompleted && (
                  <>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium px-3 py-1.5 bg-green-50 rounded-lg border border-green-200"><CheckCircle className="w-3.5 h-3.5" /> Completed!</span>
                    <button onClick={() => setReviewModal({ open: true, courseId: course._id })} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Review</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
            <h2 className="mb-4 text-lg font-semibold">Write a Review</h2>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Rating</label>
              <div className="flex gap-2">{[1,2,3,4,5].map((n) => (<button key={n} onClick={() => setReviewForm((p) => ({ ...p, rating: n }))} className={`w-10 h-10 rounded-xl text-lg transition-colors ${n <= reviewForm.rating ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-400"}`}>★</button>))}</div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Your Review</label>
              <textarea value={reviewForm.review} onChange={(e) => setReviewForm((p) => ({ ...p, review: e.target.value }))} className="resize-none input-field h-28" placeholder="Share your experience..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal({ open: false, courseId: null })} className="justify-center flex-1 btn-secondary">Cancel</button>
              <button onClick={submitReview} disabled={submittingReview} className="justify-center flex-1 btn-primary">{submittingReview ? "Submitting..." : "Submit Review"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getPaymentHistory().then((r) => setPayments(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Payment History</h1>
      {loading ? <Spinner /> : payments.length === 0 ? <EmptyState icon={CreditCard} title="No payments yet" description="Enroll in a course to see your payment history" /> : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-4 card">
              <div className="overflow-hidden bg-gray-100 w-14 h-14 rounded-xl shrink-0">{p.course?.thumbnail ? <img src={p.course.thumbnail} alt="" className="object-cover w-full h-full" /> : <div className="flex items-center justify-center w-full h-full"><BookOpen className="w-6 h-6 text-gray-400" /></div>}</div>
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{p.course?.name}</p><p className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p></div>
              <div className="text-right shrink-0"><p className="font-bold text-gray-900">₹{(p.amount / 100).toLocaleString()}</p><span className={`badge text-xs ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilePanel() {
  const { user, fetchMe } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "", phone: "", gender: "other" });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || "", lastName: user.lastName || "", bio: user.profile?.bio || "", phone: user.profile?.phone || "", gender: user.profile?.gender || "other" });
      setPreviewUrl(user.profile?.avatar || null);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.updateProfile(form);
      if (avatar) { const fd = new FormData(); fd.append("avatar", avatar); await api.uploadAvatar(fd); }
      await fetchMe();
      toast.success("Profile updated!");
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
      <div className="max-w-xl">
        <div className="p-6 card">
          <div className="flex items-center gap-5 pb-6 mb-6 border-b border-gray-100">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-2xl font-bold rounded-full bg-primary-100 text-primary-600">
                {previewUrl ? <img src={previewUrl} alt="avatar" className="object-cover w-full h-full" /> : `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <label className="inline-block mt-2 text-xs cursor-pointer text-primary-600 hover:underline">Change photo<input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setAvatar(f); setPreviewUrl(URL.createObjectURL(f)); } }} className="hidden" /></label>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block mb-1 text-sm font-medium">First Name</label><input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="input-field" /></div>
              <div><label className="block mb-1 text-sm font-medium">Last Name</label><input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="input-field" /></div>
            </div>
            <div><label className="block mb-1 text-sm font-medium">Phone</label><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+91 XXXXXXXXXX" /></div>
            <div><label className="block mb-1 text-sm font-medium">Gender</label><select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="input-field"><option value="male">Male</option><option value="female">Female</option><option value="other">Prefer not to say</option></select></div>
            <div><label className="block mb-1 text-sm font-medium">Bio</label><textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} className="h-24 resize-none input-field" placeholder="Tell us about yourself..." /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">{loading ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <span className="font-semibold">Student Panel</span>
        </div>
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="courses" element={<MyCoursesPanel />} />
            <Route path="payments" element={<PaymentsPanel />} />
            <Route path="profile" element={<ProfilePanel />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
