import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Users, Clock, BookOpen, CheckCircle, ChevronDown, ChevronUp, Play, Lock } from 'lucide-react';
import { StarRating, Spinner } from '../../components/common/index.jsx';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCourse, selected: course, loading } = useCourses();
  const { isAuthenticated, user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => { fetchCourse(id); }, [id]);

  const isEnrolled = course?.studentsEnrolled?.some((s) => (s._id || s) === user?._id);

  const handleBuy = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (isEnrolled) return navigate(`/learn/${id}`);
    setBuying(true);
    try {
      const { data } = await api.createOrder(id);
      const { orderId, amount, currency, keyId, courseName } = data.data;
      const options = {
        key: keyId, amount, currency, name: 'EduFlect', description: courseName, order_id: orderId,
        handler: async (response) => {
          try {
            await api.verifyPayment({ ...response, courseId: id });
            toast.success('Enrollment successful! 🎉');
            navigate(`/learn/${id}`);
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => setBuying(false) },
      };
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => new window.Razorpay(options).open();
        document.body.appendChild(script);
      } else { new window.Razorpay(options).open(); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    } finally { setBuying(false); }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;
  if (!course) return <div className="text-center py-24 text-gray-500">Course not found</div>;

  const effectivePrice = course.price - Math.round((course.price * (course.discount || 0)) / 100);
  const totalLessons = course.sections?.reduce((s, sec) => s + (sec.subSections?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <p className="text-primary-300 text-sm font-medium mb-2">{course.category?.name}</p>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.name}</h1>
            <p className="text-gray-300 mb-4">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <StarRating value={course.averageRating} />
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.totalStudents} students</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {totalLessons} lessons</span>
              <span className="capitalize badge bg-primary-900 text-primary-300">{course.level}</span>
            </div>
            <p className="text-sm text-gray-400 mt-3">By <span className="text-white font-medium">{course.instructor?.firstName} {course.instructor?.lastName}</span></p>
          </div>
          <div className="hidden lg:block">
            <BuyCard course={course} effectivePrice={effectivePrice} isEnrolled={isEnrolled} buying={buying} onBuy={handleBuy} />
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-2xl font-bold text-gray-900">₹{effectivePrice.toLocaleString()}</span>
          {course.discount > 0 && <span className="text-gray-400 line-through text-sm ml-2">₹{course.price?.toLocaleString()}</span>}
        </div>
        <button onClick={handleBuy} disabled={buying} className="btn-primary px-6 py-2.5">
          {isEnrolled ? 'Continue Learning' : buying ? 'Processing...' : 'Enroll Now'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {course.whatYouWillLearn?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Curriculum ({totalLessons} lessons)</h2>
            <div className="space-y-2">
              {course.sections?.map((section, si) => (
                <div key={section._id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left" onClick={() => setExpandedSection(expandedSection === si ? null : si)}>
                    <span className="font-medium">{section.name}</span>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{section.subSections?.length || 0} lessons</span>
                      {expandedSection === si ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {expandedSection === si && (
                    <div className="divide-y divide-gray-100">
                      {section.subSections?.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-3 px-4 py-3 text-sm">
                          {isEnrolled ? <Play className="w-4 h-4 text-primary-600" /> : <Lock className="w-4 h-4 text-gray-400" />}
                          <span className={isEnrolled ? 'text-gray-800' : 'text-gray-500'}>{sub.name}</span>
                          <span className="ml-auto text-gray-400">{sub.duration}min</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {course.ratingAndReviews?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Student Reviews</h2>
              <div className="space-y-4">
                {course.ratingAndReviews.slice(0, 5).map((r) => (
                  <div key={r._id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                      {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.user?.firstName} {r.user?.lastName}</p>
                      <StarRating value={r.rating} />
                      <p className="text-sm text-gray-600 mt-1">{r.review}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <BuyCard course={course} effectivePrice={effectivePrice} isEnrolled={isEnrolled} buying={buying} onBuy={handleBuy} />
          </div>
        </div>
      </div>
    </div>
  );
}

const BuyCard = ({ course, effectivePrice, isEnrolled, buying, onBuy }) => (
  <div className="card overflow-hidden">
    {course.thumbnail && <img src={course.thumbnail} alt={course.name} className="w-full aspect-video object-cover" />}
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl font-bold">₹{effectivePrice.toLocaleString()}</span>
        {course.discount > 0 && (
          <><span className="text-gray-400 line-through">₹{course.price?.toLocaleString()}</span><span className="badge bg-red-100 text-red-600">{course.discount}% OFF</span></>
        )}
      </div>
      <button onClick={onBuy} disabled={buying} className="btn-primary w-full justify-center py-3 text-base mb-3">
        {isEnrolled ? '▶ Continue Learning' : buying ? 'Processing...' : '🎓 Enroll Now'}
      </button>
      <p className="text-xs text-center text-gray-400">30-day money-back guarantee</p>
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Full lifetime access</p>
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Certificate of completion</p>
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Access on mobile & desktop</p>
      </div>
    </div>
  </div>
);
