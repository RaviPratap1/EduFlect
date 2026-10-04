import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Users, Clock, BookOpen, CheckCircle, ChevronDown, ChevronUp, Play, Lock } from 'lucide-react';
import { StarRating, Spinner } from '../../components/common/index.jsx';
import { fetchCourse } from '../../store/slices/courseSlice';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: course, loading } = useSelector((state) => state.courses);
  const { isAuthenticated, user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);
  const [buying, setBuying] = useState(false);
  const effectivePrice = course
    ? course.price - Math.round((course.price * (course.discount || 0)) / 100)
    : 0;

  useEffect(() => {
    dispatch(fetchCourse(id));
  }, [id, dispatch]);

  const isEnrolled = course?.studentsEnrolled?.some((s) => (s._id || s) === user?._id);

  const handleBuy = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (isEnrolled) return navigate(`/learn/${id}`);
    setBuying(true);
    try {
      if (effectivePrice === 0) {
        await api.enrollFreeCourse(id);
        toast.success('Enrollment successful!');
        navigate(`/learn/${id}`);
        return;
      }
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
  if (!course) return <div className="py-24 text-center text-gray-500">Course not found</div>;

  const totalLessons = course.sections?.reduce((s, sec) => s + (sec.subSections?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-white bg-gray-900">
        <div className="grid gap-10 px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-2 text-sm font-medium text-primary-300">{course.category?.name}</p>
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">{course.name}</h1>
            <p className="mb-4 text-gray-300">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <StarRating value={course.averageRating} />
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.totalStudents} students</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {totalLessons} lessons</span>
              <span className="capitalize badge bg-primary-900 text-primary-300">{course.level}</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">By <span className="font-medium text-white">{course.instructor?.firstName} {course.instructor?.lastName}</span></p>
          </div>
          <div className="hidden lg:block">
            <BuyCard course={course} effectivePrice={effectivePrice} isEnrolled={isEnrolled} buying={buying} onBuy={handleBuy} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 shadow-lg lg:hidden">
        <div>
          <span className="text-2xl font-bold text-gray-900">{effectivePrice === 0 ? 'Free' : `₹${effectivePrice.toLocaleString()}`}</span>
          {course.discount > 0 && <span className="ml-2 text-sm text-gray-400 line-through">₹{course.price?.toLocaleString()}</span>}
        </div>
        <button onClick={handleBuy} disabled={buying} className="btn-primary px-6 py-2.5">
          {isEnrolled ? 'Continue Learning' : buying ? 'Processing...' : effectivePrice === 0 ? 'Enroll for Free' : 'Enroll Now'}
        </button>
      </div>

      <div className="grid gap-10 px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {course.whatYouWillLearn?.length > 0 && (
            <div className="p-6 card">
              <h2 className="mb-4 text-xl font-bold">What you'll learn</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="p-6 card">
            <h2 className="mb-4 text-xl font-bold">Curriculum ({totalLessons} lessons)</h2>
            <div className="space-y-2">
              {course.sections?.map((section, si) => (
                <div key={section._id} className="overflow-hidden border border-gray-200 rounded-xl">
                  <button className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100" onClick={() => setExpandedSection(expandedSection === si ? null : si)}>
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
            <div className="p-6 card">
              <h2 className="mb-4 text-xl font-bold">Student Reviews</h2>
              <div className="space-y-4">
                {course.ratingAndReviews.slice(0, 5).map((r) => (
                  <div key={r._id} className="flex gap-3">
                    <div className="flex items-center justify-center text-sm font-semibold rounded-full w-9 h-9 bg-primary-100 text-primary-700 shrink-0">
                      {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.user?.firstName} {r.user?.lastName}</p>
                      <StarRating value={r.rating} />
                      <p className="mt-1 text-sm text-gray-600">{r.review}</p>
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
  <div className="overflow-hidden card">
    {course.thumbnail && <img src={course.thumbnail} alt={course.name} className="object-cover w-full aspect-video" />}
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl font-bold">{effectivePrice === 0 ? 'Free' : `₹${effectivePrice.toLocaleString()}`}</span>
        {course.discount > 0 && (
          <><span className="text-gray-400 line-through">₹{course.price?.toLocaleString()}</span><span className="text-red-600 bg-red-100 badge">{course.discount}% OFF</span></>
        )}
      </div>
      <button onClick={onBuy} disabled={buying} className="justify-center w-full py-3 mb-3 text-base btn-primary">
        {isEnrolled ? '▶ Continue Learning' : buying ? 'Processing...' : effectivePrice === 0 ? 'Enroll for Free' : '🎓 Enroll Now'}
      </button>
      {effectivePrice > 0 && <p className="text-xs text-center text-gray-400">30-day money-back guarantee</p>}
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Full lifetime access</p>
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Certificate of completion</p>
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Access on mobile & desktop</p>
      </div>
    </div>
  </div>
);