import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

import {
  BookOpen, Users, Star, Award, ArrowRight, Play,
  CheckCircle, ChevronLeft, ChevronRight, TrendingUp,
  Shield, Clock, Globe, Zap, Trophy, Heart, Quote
} from 'lucide-react';


import { CourseCard, StarRating, Spinner } from '../../components/common/index.jsx';
import { useCourses } from '../../context/CourseContext';
import { useCategories } from '../../context/CategoryContext';
import * as api from '../../api/services';

// ── AUTO SLIDER ───────────────────────────────────────────────
function useAutoSlider(length, interval = 4000) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, interval);
  }, [length, interval]);

  useEffect(() => {
    reset();
    return () => clearInterval(timerRef.current);
  }, [reset]);

  const goTo = (i) => { setCurrent(i); reset(); };
  const prev = () => { setCurrent((p) => (p - 1 + length) % length); reset(); };
  const next = () => { setCurrent((p) => (p + 1) % length); reset(); };

  return { current, goTo, prev, next };
}

// ── HERO SLIDES DATA ──────────────────────────────────────────
const heroSlides = [
  {
    badge: '🚀 India\'s Fastest Growing EdTech',
    title: 'Unlock Your Potential with',
    highlight: 'Expert-Led Courses',
    desc: 'Learn from industry professionals. Build real skills. Advance your career with hands-on, project-based learning.',
    bg: 'from-indigo-900 via-primary-800 to-purple-900',
    accent: 'text-amber-300',
    cta: { label: 'Explore Courses', to: '/courses' },
    stat: '10,000+ Students Enrolled',
  },
  {
    badge: '🎓 Certified Learning Programs',
    title: 'Build Industry-Ready',
    highlight: 'Technical Skills',
    desc: 'Structured roadmaps, live projects, and mentorship — everything you need to land your dream job.',
    bg: 'from-emerald-900 via-teal-800 to-cyan-900',
    accent: 'text-emerald-300',
    cta: { label: 'View Programs', to: '/courses' },
    stat: '200+ Courses Available',
  },
  {
    badge: '💼 Career-Focused Learning',
    title: 'Go From Beginner to',
    highlight: 'Job-Ready Developer',
    desc: 'Real-world projects, code reviews, and placement support. Your career transformation starts here.',
    bg: 'from-rose-900 via-pink-800 to-purple-900',
    accent: 'text-rose-300',
    cta: { label: 'Start Learning', to: '/register' },
    stat: '50+ Expert Instructors',
  },
  {
    badge: '⚡ Learn at Your Own Pace',
    title: 'Master New Skills on',
    highlight: 'Your Own Schedule',
    desc: 'Lifetime access to all content. Learn anytime, anywhere, on any device. No deadlines, no pressure.',
    bg: 'from-orange-900 via-amber-800 to-yellow-900',
    accent: 'text-yellow-300',
    cta: { label: 'Get Started Free', to: '/register' },
    stat: '4.8★ Average Rating',
  },
];

// ── HERO SECTION WITH SLIDER ──────────────────────────────────
const Hero = () => {
  const { current, goTo, prev, next } = useAutoSlider(heroSlides.length, 5000);
  const slide = heroSlides[current];

  return (
    <section className={`relative bg-gradient-to-br ${slide.bg} text-white overflow-hidden transition-all duration-700 min-h-[85vh] flex flex-col justify-center`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-96 h-96 filter blur-3xl" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-white rounded-full w-96 h-96 filter blur-3xl" />
        <div className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full top-1/2 left-1/2 filter blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative w-full px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-4xl">
          {/* Badge */}
          <div key={`badge-${current}`} className="animate-fade-in">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-white border rounded-full bg-white/15 backdrop-blur-sm border-white/20">
              {slide.badge}
            </span>
          </div>

          {/* Title */}
          <div key={`title-${current}`} className="animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              {slide.title}{' '}
              <span className={`${slide.accent} relative inline-block`}>
                {slide.highlight}
                <svg className="absolute left-0 w-full -bottom-2" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q150 2 298 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
                </svg>
              </span>
            </h1>
          </div>

          {/* Description */}
          <div key={`desc-${current}`} className="animate-slide-up-delay">
            <p className="max-w-2xl mb-8 text-lg leading-relaxed sm:text-xl text-white/80">
              {slide.desc}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to={slide.cta.to}
              className="group bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5">
              {slide.cta.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/courses"
              className="flex items-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 border group bg-white/10 backdrop-blur-sm border-white/30 rounded-2xl hover:bg-white/20">
              <Play className="w-4 h-4 fill-white" /> Watch Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              ['10,000+', 'Active Students'],
              ['200+', 'Courses'],
              ['50+', 'Instructors'],
              ['4.8★', 'Rating'],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black text-white sm:text-3xl">{v}</p>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider controls */}
      <div className="absolute left-0 right-0 flex items-center justify-center gap-6 bottom-8">
        {/* Prev button */}
        <button onClick={prev}
          className="flex items-center justify-center w-10 h-10 transition-colors border rounded-full bg-white/10 border-white/20 hover:bg-white/25 backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>

        {/* Next button */}
        <button onClick={next}
          className="flex items-center justify-center w-10 h-10 transition-colors border rounded-full bg-white/10 border-white/20 hover:bg-white/25 backdrop-blur-sm">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute font-mono text-sm top-8 right-8 text-white/40">
        {String(current + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
      </div>
    </section>
  );
};

// ── STATS BAR ─────────────────────────────────────────────────
const StatsBar = ({ avgRating }) => (
  <div className="py-5 text-white bg-gray-900 border-b border-gray-800">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-center gap-6 text-sm sm:gap-10">
        {[
          { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, label: 'Platform Rating', value: avgRating },
          { icon: <Users className="w-4 h-4 text-blue-400" />, label: 'Active Learners', value: '10,000+' },
          { icon: <BookOpen className="w-4 h-4 text-green-400" />, label: 'Courses Live', value: '200+' },
          { icon: <Trophy className="w-4 h-4 text-purple-400" />, label: 'Certificates Issued', value: '5,000+' },
          { icon: <Globe className="w-4 h-4 text-rose-400" />, label: 'Cities Reached', value: '150+' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            {icon}
            <span className="text-gray-400">{label}:</span>
            <span className="font-bold text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── CATEGORIES ────────────────────────────────────────────────
const categoryIcons = ['💻', '📊', '🎨', '📱', '🤖', '📷', '🎵', '✍️', '🔐', '📈'];
const categoryColors = [
  'hover:bg-blue-50 hover:border-blue-300',
  'hover:bg-purple-50 hover:border-purple-300',
  'hover:bg-pink-50 hover:border-pink-300',
  'hover:bg-green-50 hover:border-green-300',
  'hover:bg-amber-50 hover:border-amber-300',
  'hover:bg-red-50 hover:border-red-300',
  'hover:bg-indigo-50 hover:border-indigo-300',
  'hover:bg-teal-50 hover:border-teal-300',
  'hover:bg-orange-50 hover:border-orange-300',
  'hover:bg-cyan-50 hover:border-cyan-300',
];

const CategoriesSection = ({ categories = [] }) => (
  <section className="py-20 bg-white">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <span className="inline-block bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Explore Topics</span>
        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">Browse by Category</h2>
        <p className="max-w-xl mx-auto text-lg text-gray-500">Find the perfect course for your goals across 10+ categories</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(categories ?? []).slice(0, 10).map((cat, i) => (
          <Link key={cat._id} to={`/courses?category=${cat._id}`}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 transition-all duration-200 group ${categoryColors[i % categoryColors.length]}`}>
            <span className="text-3xl">{categoryIcons[i % categoryIcons.length]}</span>
            <span className="text-sm font-semibold leading-tight text-center text-gray-700 group-hover:text-gray-900">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// ── FEATURES ──────────────────────────────────────────────────
const features = [
  { icon: <Zap className="w-6 h-6" />, title: 'Learn at Your Pace', desc: 'Lifetime access with no deadlines. Start and stop anytime.', color: 'bg-amber-100 text-amber-600' },
  { icon: <Shield className="w-6 h-6" />, title: 'Verified Instructors', desc: 'Every instructor is vetted by our quality team before publishing.', color: 'bg-blue-100 text-blue-600' },
  { icon: <Trophy className="w-6 h-6" />, title: 'Get Certified', desc: 'Earn industry-recognized certificates on course completion.', color: 'bg-purple-100 text-purple-600' },
  { icon: <Globe className="w-6 h-6" />, title: 'Learn Anywhere', desc: 'Access on mobile, tablet, or desktop — online or offline.', color: 'bg-green-100 text-green-600' },
  { icon: <Users className="w-6 h-6" />, title: 'Community Access', desc: 'Join 10,000+ learners, ask questions, share progress.', color: 'bg-rose-100 text-rose-600' },
  { icon: <Heart className="w-6 h-6" />, title: 'Money Back', desc: '30-day refund policy — no questions asked, guaranteed.', color: 'bg-teal-100 text-teal-600' },
];

const FeaturesSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <span className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Why EduFlect</span>
        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">Everything You Need to Succeed</h2>
        <p className="max-w-xl mx-auto text-lg text-gray-500">We built EduFlect for one reason — to help you actually learn and grow.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="p-6 transition-all duration-200 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
              {f.icon}
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">{f.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── COURSE SLIDER ─────────────────────────────────────────────
const CourseSlider = ({ courses = [], loading }) => {
  const totalPages = Math.max(1, Math.ceil((courses?.length ?? 0) / 4));
  const { current, prev, next, goTo } = useAutoSlider(totalPages, 3500);
  const itemsPerPage = 4;
  const start = current * itemsPerPage;
  const visible = (courses ?? []).slice(start, start + itemsPerPage);

  return (
    <section className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Trending Now</span>
            <h2 className="mb-1 text-3xl font-black text-gray-900 sm:text-4xl">Featured Courses</h2>
            <p className="text-gray-500">Handpicked by our expert team</p>
          </div>
          <div className="items-center hidden gap-3 sm:flex">
            <button onClick={prev} className="flex items-center justify-center w-10 h-10 transition-colors border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:text-primary-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="flex items-center justify-center w-10 h-10 transition-colors border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:text-primary-600">
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link to="/courses" className="flex items-center gap-1 text-sm btn-secondary">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading ? <Spinner size="lg" className="py-16" /> : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((course) => <CourseCard key={course._id} course={course} />)}
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(courses.length / itemsPerPage) }, (_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-primary-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`} />
              ))}
            </div>
          </>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/courses" className="btn-primary">View All Courses</Link>
        </div>
      </div>
    </section>
  );
};

// ── HOW IT WORKS ──────────────────────────────────────────────
const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up for free in under 60 seconds. No credit card required.' },
  { num: '02', title: 'Find Your Course', desc: 'Browse 200+ courses across 10+ categories. Filter by level or topic.' },
  { num: '03', title: 'Start Learning', desc: 'Watch video lessons, complete exercises, and track your progress.' },
  { num: '04', title: 'Get Certified', desc: 'Complete the course and download your certificate to share on LinkedIn.' },
];

const HowItWorks = () => (
  <section className="py-20 text-white bg-gray-900">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <span className="inline-block bg-white/10 text-white/80 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Simple Process</span>
        <h2 className="mb-3 text-3xl font-black sm:text-4xl">How EduFlect Works</h2>
        <p className="max-w-xl mx-auto text-lg text-gray-400">Four simple steps to transform your career</p>
      </div>
      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connecting line */}
        <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-600 to-purple-600 z-0" />
        {steps.map((step, i) => (
          <div key={step.num} className="relative p-6 transition-colors border bg-white/5 border-white/10 rounded-2xl hover:bg-white/10">
            <div className="flex items-center justify-center mb-5 text-xl font-black shadow-lg w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 shadow-primary-900/50">
              {step.num}
            </div>
            <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-gray-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── FACULTY ───────────────────────────────────────────────────
const FacultyCard = ({ instructor }) => (
  <div className="p-6 text-center transition-all duration-200 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1">
    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 overflow-hidden text-2xl font-black text-white rounded-full shadow-lg bg-gradient-to-br from-primary-400 to-indigo-600">
      {instructor.profile?.avatar
        ? <img src={instructor.profile.avatar} alt="" className="object-cover w-full h-full" />
        : `${instructor.firstName?.[0]}${instructor.lastName?.[0]}`}
    </div>
    <h3 className="text-lg font-bold text-gray-900">{instructor.firstName} {instructor.lastName}</h3>
    <p className="text-sm text-primary-600 font-medium mt-0.5">Expert Instructor</p>
    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{instructor.profile?.bio || 'Passionate educator with years of industry experience.'}</p>
    <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
      <span className="text-sm font-bold text-gray-800">{instructor.avgRating || '4.9'}</span>
      <span className="text-sm text-gray-400">· {instructor.totalStudents || 0} students</span>
    </div>
  </div>
);

// ── REVIEWS SLIDER ────────────────────────────────────────────
const ReviewsSlider = ({ reviews = [], avgRating }) => {
  const totalPages = Math.max(1, Math.ceil((reviews?.length ?? 0) / 3));
  const { current, prev, next, goTo } = useAutoSlider(totalPages, 4500);
  const visible = (reviews ?? []).slice(current * 3, current * 3 + 3);

  return (
    <section className="py-20 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Student Reviews</span>
          <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">What Our Students Say</h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className="w-6 h-6 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-2xl font-black text-gray-900">{avgRating}</span>
            <span className="text-gray-500">out of 5 · {reviews.length} reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]">
          {visible.map((review) => (
            <div key={review._id} className="relative p-6 transition-shadow bg-white border border-gray-100 rounded-2xl hover:shadow-md">
              <Quote className="absolute w-8 h-8 text-primary-100 top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center overflow-hidden text-sm font-bold text-white bg-gray-300 rounded-full w-11 h-11 bg-gradient-to-br from-primary-400 to-indigo-500 shrink-0">
                  {review.user?.profile?.avatar
                    ? <img src={review.user.profile.avatar} alt="" className="object-cover w-full h-full " />
                    : `${review.user?.firstName?.[0]}${review.user?.lastName?.[0]}`}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{review.user?.firstName} {review.user?.lastName}</p>
                  <p className="text-xs text-gray-400">{review.course?.name}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600 line-clamp-4">"{review.review}"</p>
            </div>
          ))}
        </div>

        {/* Dots + arrows */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="flex items-center justify-center transition-colors border-2 border-gray-200 w-9 h-9 rounded-xl hover:border-primary-500">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(reviews.length / 3) }, (_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${i === current ? 'w-7 h-2.5 bg-primary-600' : 'w-2.5 h-2.5 bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={next} className="flex items-center justify-center transition-colors border-2 border-gray-200 w-9 h-9 rounded-xl hover:border-primary-500">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ── NUMBERS SECTION ───────────────────────────────────────────
const NumbersSection = () => (
  <section className="py-20 text-white bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-black sm:text-4xl">EduFlect by the Numbers</h2>
        <p className="text-lg text-primary-200">Growing every day with learners across India</p>
      </div>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          { value: '10,000+', label: 'Students Enrolled', icon: <Users className="w-7 h-7" /> },
          { value: '200+', label: 'Total Courses', icon: <BookOpen className="w-7 h-7" /> },
          { value: '50+', label: 'Expert Instructors', icon: <Award className="w-7 h-7" /> },
          { value: '₹50L+', label: 'Student Savings', icon: <TrendingUp className="w-7 h-7" /> },
        ].map(({ value, label, icon }) => (
          <div key={label} className="p-6 text-center transition-colors border bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl hover:bg-white/15">
            <div className="flex justify-center mb-3 text-white/70">{icon}</div>
            <p className="mb-1 text-3xl font-black sm:text-4xl">{value}</p>
            <p className="text-sm text-primary-200">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── CTA SECTION ───────────────────────────────────────────────
const CTASection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-4xl px-4 mx-auto text-center">
      <div className="relative p-12 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl sm:p-16">
        {/* Decorative circles */}
        <div className="absolute w-48 h-48 rounded-full -top-12 -right-12 bg-primary-600/20" />
        <div className="absolute w-64 h-64 rounded-full -bottom-12 -left-12 bg-purple-600/20" />

        <div className="relative">
          <span className="inline-block bg-primary-500/20 text-primary-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">🎓 Start Today</span>
          <h2 className="mb-4 text-3xl font-black text-white sm:text-5xl">Ready to Transform Your Career?</h2>
          <p className="max-w-xl mx-auto mb-10 text-lg text-gray-400">Join 10,000+ students who chose EduFlect to build real skills and land better jobs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="group bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-xl shadow-primary-900/30 hover:-translate-y-0.5">
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/courses"
              className="px-8 py-4 font-bold text-white transition-all duration-200 border bg-white/10 border-white/20 rounded-2xl hover:bg-white/20">
              Browse Courses
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required · 30-day money back guarantee</p>
        </div>
      </div>
    </div>
  </section>
);

// ── MAIN HOMEPAGE ─────────────────────────────────────────────
export default function HomePage() {
  
  const { list: courses, loading: coursesLoading, fetchCourses } = useCourses();
  const { list: categories, fetchCategories } = useCategories();
  const [reviews, setReviews] = useState([]);
  const [faculty, setFaculty] = useState([]);
  console.log("review", reviews);

  useEffect(() => {
    fetchCourses({ limit: 12, sort: 'newest' });
    fetchCategories();
    api.getTopReviews()
      .then((r) => setReviews(r.data?.data || []))
      .catch((err) => {
        // Silently fail on 401 (unauthorized) - don't redirect
        if (err.response?.status !== 401) {
          console.error('Failed to fetch reviews:', err);
        }
      });
    api.adminGetAllUsers({ role: 'instructor', limit: 6 })
      .then((r) => setFaculty(r.data?.data?.users || []))
      .catch((err) => {
        // Silently fail on 401 (unauthorized) - don't redirect
        if (err.response?.status !== 401) {
          console.error('Failed to fetch instructors:', err);
        }
      });
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div>
      {/* 1. Hero with auto slider */}
      <Hero />

      {/* 2. Stats bar */}
      <StatsBar avgRating={avgRating} />

      {/* 3. Categories */}
      <CategoriesSection categories={categories} />

      {/* 4. Featured courses with slider */}
      <CourseSlider courses={courses} loading={coursesLoading} />

      {/* 5. Features / Why Us */}
      <FeaturesSection />

      {/* 6. How it works */}
      <HowItWorks />

      {/* 7. Faculty */}
      {faculty.length > 0 && (
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Our Team</span>
              <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">Meet Our Instructors</h2>
              <p className="max-w-xl mx-auto text-lg text-gray-500">Industry veterans who have been there, done that — and now they teach.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {faculty.slice(0, 6).map((f) => <FacultyCard key={f._id} instructor={f} />)}
            </div>
          </div>
        </section>
      )}

      {/* 8. Numbers */}
      <NumbersSection />

      {/* 9. Reviews slider */}
      {reviews.length > 0 && <ReviewsSlider reviews={reviews} avgRating={avgRating} />}

      {/* 10. Final CTA */}
      <CTASection />
    </div>
  );
}