import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ChevronDown, ChevronUp, ArrowLeft, BookOpen } from 'lucide-react';
import { ProgressBar, Spinner } from '../../components/common/index.jsx';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.getCourseProgress(courseId);
        setProgressData(data.data);
        setCompletedIds(data.data.progress?.completedSubSections?.map((s) => s._id || s) || []);
        if (data.data.course?.sections?.[0]?.subSections?.[0]) {
          setActiveSubSection(data.data.course.sections[0].subSections[0]);
          setExpandedSections({ 0: true });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load course');
      } finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const isCompleted = (subId) => completedIds.includes(subId);

  const toggleComplete = async (subSection) => {
    const payload = { courseId, subSectionId: subSection._id };
    try {
      if (isCompleted(subSection._id)) {
        await api.markIncomplete(payload);
        setCompletedIds((prev) => prev.filter((id) => id !== subSection._id));
      } else {
        await api.markComplete(payload);
        setCompletedIds((prev) => [...prev, subSection._id]);
      }
    } catch { toast.error('Failed to update progress'); }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;
  if (!progressData) return <div className="text-center py-24 text-gray-500">Course not found or not enrolled</div>;

  const { course, totalSubSections } = progressData;
  const completedCount = completedIds.length;
  const completionPercentage = totalSubSections > 0 ? Math.round((completedCount / totalSubSections) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-bold text-gray-900 line-clamp-2">{course?.name}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{completedCount}/{totalSubSections} completed</span>
              <span>{completionPercentage}%</span>
            </div>
            <ProgressBar value={completionPercentage} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {course?.sections?.map((section, si) => (
            <div key={section._id} className="border-b border-gray-100">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50" onClick={() => setExpandedSections((p) => ({ ...p, [si]: !p[si] }))}>
                <span className="font-medium text-sm">{section.name}</span>
                {expandedSections[si] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {expandedSections[si] && (
                <div>
                  {section.subSections?.map((sub) => {
                    const done = isCompleted(sub._id);
                    const active = activeSubSection?._id === sub._id;
                    return (
                      <div key={sub._id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-primary-50 border-r-2 border-primary-600' : 'hover:bg-gray-50'}`} onClick={() => setActiveSubSection(sub)}>
                        {done ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />}
                        <span className={`text-sm ${active ? 'text-primary-700 font-medium' : done ? 'text-gray-500' : 'text-gray-700'}`}>{sub.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {activeSubSection ? (
          <div className="max-w-4xl mx-auto p-6">
            {activeSubSection.videoUrl ? (
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                <video src={activeSubSection.videoUrl} controls className="w-full h-full" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center text-gray-400"><BookOpen className="w-16 h-16 mx-auto mb-2" /><p>No video for this lesson</p></div>
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{activeSubSection.name}</h1>
              <button onClick={() => toggleComplete(activeSubSection)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ml-4 ${isCompleted(activeSubSection._id) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                {isCompleted(activeSubSection._id) ? <><CheckCircle className="w-4 h-4" /> Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
              </button>
            </div>
            {activeSubSection.description && <p className="text-gray-600 mb-4">{activeSubSection.description}</p>}
            {activeSubSection.content && (
              <div className="card p-6"><h3 className="font-semibold mb-3">Lesson Notes</h3><p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{activeSubSection.content}</p></div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center"><BookOpen className="w-16 h-16 mx-auto mb-3" /><p>Select a lesson to start learning</p></div>
          </div>
        )}
      </main>
    </div>
  );
}
