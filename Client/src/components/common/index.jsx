import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, BookOpen } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${s} animate-spin rounded-full border-b-2 border-primary-600`} />
    </div>
  );
};

export const StarRating = ({ value = 0, max = 5, size = 'sm' }) => {
  const s = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${s} ${i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{Number(value).toFixed(1)}</span>
    </div>
  );
};

export const CourseCard = ({ course }) => {
  const price = course.price - Math.round((course.price * (course.discount || 0)) / 100);
  return (
    <Link to={`/courses/${course._id}`} className="card overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary-400" />
          </div>
        )}
        {course.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{course.discount}% OFF</span>
        )}
        <span className="absolute top-2 right-2 badge bg-gray-900/70 text-white capitalize">{course.level}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-primary-600 font-medium mb-1">{course.category?.name || 'Uncategorized'}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 flex-1">{course.name}</h3>
        <p className="text-xs text-gray-500 mb-2">
          By {course.instructor?.firstName} {course.instructor?.lastName}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.totalStudents || course.studentsEnrolled?.length || 0}</span>
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{Number(course.averageRating || 0).toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString()}</span>
            {course.discount > 0 && (
              <span className="text-sm text-gray-400 line-through ml-2">₹{course.price?.toLocaleString()}</span>
            )}
          </div>
          <span className="badge bg-primary-50 text-primary-700">View</span>
        </div>
      </div>
    </Link>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    {Icon && <Icon className="w-16 h-16 text-gray-300" />}
    <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
    {description && <p className="text-gray-500 max-w-sm">{description}</p>}
    {action}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const ProgressBar = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const StatCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
};
