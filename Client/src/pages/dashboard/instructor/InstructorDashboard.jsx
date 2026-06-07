import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Users, Star, DollarSign, Menu, ChevronDown, ChevronUp, Film, Upload } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCourses } from '../../../context/CourseContext';
import { useCategories } from '../../../context/CategoryContext';
import { StatCard, Spinner, EmptyState, Modal } from '../../../components/common/index.jsx';
import * as api from '../../../api/services';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard/instructor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/instructor/courses', label: 'My Courses', icon: BookOpen },
  { to: '/dashboard/instructor/profile', label: 'Profile', icon: Users },
];

const Sidebar = ({ open, setOpen }) => (
  <>
    {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white z-40 flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-5 border-b border-gray-700"><p className="text-lg font-bold">📚 Instructor Panel</p><p className="text-gray-400 text-sm mt-0.5">EduFlect</p></div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>
    </aside>
  </>
);

// ── Course Form Modal ─────────────────────────────────────────
function CourseFormModal({ isOpen, onClose, editing, categories }) {
  const { createCourse, updateCourse, loading } = useCourses();
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', discount: '0', level: 'beginner', language: 'Hindi/English', whatYouWillLearn: '', requirements: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '', description: editing.description || '',
        category: editing.category?._id || editing.category || '',
        price: editing.price || '', discount: editing.discount || '0',
        level: editing.level || 'beginner', language: editing.language || 'Hindi/English',
        whatYouWillLearn: (editing.whatYouWillLearn || []).join('\n'),
        requirements: (editing.requirements || []).join('\n'),
      });
      setPreview(editing.thumbnail || null);
      setThumbnail(null);
    } else {
      setForm({ name: '', description: '', category: '', price: '', discount: '0', level: 'beginner', language: 'Hindi/English', whatYouWillLearn: '', requirements: '' });
      setThumbnail(null); setPreview(null);
    }
  }, [editing, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'whatYouWillLearn' || k === 'requirements') fd.append(k, JSON.stringify(v.split('\n').map((s) => s.trim()).filter(Boolean)));
      else fd.append(k, v);
    });
    if (thumbnail) fd.append('thumbnail', thumbnail);
    if (editing) { const res = await updateCourse(editing._id, fd); if (res.success) onClose(); }
    else { const res = await createCourse(fd); if (res.success) onClose(); }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Course' : 'Create New Course'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block mb-1 text-sm font-medium">Course Name *</label><input value={form.name} onChange={set('name')} className="input-field" required placeholder="e.g. Complete React Course" /></div>
        <div><label className="block mb-1 text-sm font-medium">Description</label><textarea value={form.description} onChange={set('description')} className="h-24 resize-none input-field" placeholder="What is this course about?" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block mb-1 text-sm font-medium">Category *</label><select value={form.category} onChange={set('category')} className="input-field" required><option value="">Select</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
          <div><label className="block mb-1 text-sm font-medium">Level</label><select value={form.level} onChange={set('level')} className="input-field">{['beginner','intermediate','advanced'].map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block mb-1 text-sm font-medium">Price (₹) *</label><input type="number" min="0" value={form.price} onChange={set('price')} className="input-field" required placeholder="999" /></div>
          <div><label className="block mb-1 text-sm font-medium">Discount (%)</label><input type="number" min="0" max="100" value={form.discount} onChange={set('discount')} className="input-field" placeholder="0" /></div>
        </div>
        <div><label className="block mb-1 text-sm font-medium">Language</label><input value={form.language} onChange={set('language')} className="input-field" placeholder="Hindi/English" /></div>
        <div><label className="block mb-1 text-sm font-medium">What students will learn (one per line)</label><textarea value={form.whatYouWillLearn} onChange={set('whatYouWillLearn')} className="h-20 resize-none input-field" placeholder={`Build real projects\nLearn best practices`} /></div>
        <div><label className="block mb-1 text-sm font-medium">Requirements (one per line)</label><textarea value={form.requirements} onChange={set('requirements')} className="h-16 resize-none input-field" placeholder="Basic JavaScript knowledge" /></div>
        <div>
          <label className="block mb-1 text-sm font-medium">Thumbnail Image</label>
          {preview && <img src={preview} alt="preview" className="object-cover w-full h-32 mb-2 rounded-lg" />}
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setThumbnail(f); setPreview(URL.createObjectURL(f)); } }} className="text-sm w-full" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">{loading ? 'Saving...' : editing ? 'Update Course' : 'Create Course'}</button>
      </form>
    </Modal>
  );
}

// ── Section Manager — FIXED: sections show, edit, responsive ──
function SectionManager({ course, onRefresh }) {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [expanded, setExpanded] = useState({});
  const [editingSection, setEditingSection] = useState(null); // { id, name }
  const [newSubName, setNewSubName] = useState({});
  const [newSubDesc, setNewSubDesc] = useState({});
  const [newSubVideo, setNewSubVideo] = useState({});
  const [newSubVideoPreview, setNewSubVideoPreview] = useState({});
  const [uploadingLesson, setUploadingLesson] = useState({});
  const [loadingSections, setLoadingSections] = useState(true);

  // Load fresh course data with sections populated
  const loadSections = async () => {
    try {
      setLoadingSections(true);
      const { data } = await api.getCourse(course._id);
      setSections(data.data?.sections || []);
    } catch {
      // fallback to prop data
      setSections(course.sections || []);
    } finally { setLoadingSections(false); }
  };

  useEffect(() => { loadSections(); }, [course._id]);

  // ── Section CRUD ────────────────────────────────────────────
  const addSection = async () => {
    if (!newSectionName.trim()) return;
    try {
      const { data } = await api.createSection({ name: newSectionName, courseId: course._id });
      setSections((prev) => [...prev, { ...data.data, subSections: [] }]);
      setNewSectionName('');
      toast.success('Section added');
    } catch { toast.error('Failed to add section'); }
  };

  const saveEditSection = async (sectionId) => {
    if (!editingSection?.name?.trim()) return;
    try {
      await api.updateSection(sectionId, { name: editingSection.name });
      setSections((prev) => prev.map((s) => s._id === sectionId ? { ...s, name: editingSection.name } : s));
      setEditingSection(null);
      toast.success('Section updated');
    } catch { toast.error('Failed to update section'); }
  };

  const deleteSection = async (id) => {
    if (!confirm('Delete this section and all its lessons?')) return;
    try {
      await api.deleteSection(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
      toast.success('Section deleted');
    } catch { toast.error('Failed to delete section'); }
  };

  // ── Lesson CRUD ─────────────────────────────────────────────
  const handleVideoFileChange = (sectionId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewSubVideo((prev) => ({ ...prev, [sectionId]: file }));
    setNewSubVideoPreview((prev) => ({ ...prev, [sectionId]: URL.createObjectURL(file) }));
  };

  const addSubSection = async (sectionId) => {
    const name = newSubName[sectionId];
    const videoFile = newSubVideo[sectionId];
    if (!name?.trim()) return toast.error('Lesson name is required');
    const fd = new FormData();
    fd.append('name', name);
    fd.append('sectionId', sectionId);
    if (newSubDesc[sectionId]) fd.append('description', newSubDesc[sectionId]);
    if (videoFile) fd.append('video', videoFile);
    setUploadingLesson((prev) => ({ ...prev, [sectionId]: true }));
    try {
      const { data } = await api.createSubSection(fd);
      setSections((prev) => prev.map((s) => s._id === sectionId ? { ...s, subSections: [...(s.subSections || []), data.data] } : s));
      setNewSubName((prev) => ({ ...prev, [sectionId]: '' }));
      setNewSubDesc((prev) => ({ ...prev, [sectionId]: '' }));
      setNewSubVideo((prev) => ({ ...prev, [sectionId]: null }));
      setNewSubVideoPreview((prev) => ({ ...prev, [sectionId]: null }));
      toast.success('Lesson added');
    } catch { toast.error('Failed to add lesson'); }
    finally { setUploadingLesson((prev) => ({ ...prev, [sectionId]: false })); }
  };

  const deleteSubSection = async (subId, sectionId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.deleteSubSection(subId);
      setSections((prev) => prev.map((s) => s._id === sectionId ? { ...s, subSections: s.subSections.filter((ss) => ss._id !== subId) } : s));
      toast.success('Lesson deleted');
    } catch { toast.error('Failed to delete lesson'); }
  };

  if (loadingSections) return <Spinner className="py-8" />;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Curriculum ({sections.length} sections)</h3>

      {/* Add section */}
      <div className="flex gap-2">
        <input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="New section name (e.g. Introduction)" className="flex-1 input-field" onKeyDown={(e) => e.key === 'Enter' && addSection()} />
        <button onClick={addSection} className="px-4 btn-primary shrink-0"><Plus className="w-4 h-4" /></button>
      </div>

      {sections.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No sections yet. Add your first section above.</p>}

      {/* Section list */}
      {sections.map((section) => (
        <div key={section._id} className="overflow-hidden border border-gray-200 rounded-xl">
          {/* Section header */}
          <div className="flex items-center gap-2 p-3 bg-gray-50">
            <button className="flex items-center flex-1 gap-2 font-medium text-left min-w-0" onClick={() => setExpanded((prev) => ({ ...prev, [section._id]: !prev[section._id] }))}>
              {expanded[section._id] ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              {editingSection?.id === section._id ? (
                <input
                  value={editingSection.name}
                  onChange={(e) => setEditingSection((p) => ({ ...p, name: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-2 py-1 text-sm border border-primary-400 rounded-lg outline-none"
                  autoFocus
                />
              ) : (
                <span className="truncate">{section.name} <span className="text-sm font-normal text-gray-400">({section.subSections?.length || 0} lessons)</span></span>
              )}
            </button>
            <div className="flex gap-1 shrink-0">
              {editingSection?.id === section._id ? (
                <>
                  <button onClick={() => saveEditSection(section._id)} className="px-2 py-1 text-xs text-white bg-green-500 rounded-lg hover:bg-green-600">Save</button>
                  <button onClick={() => setEditingSection(null)} className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                </>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setEditingSection({ id: section._id, name: section.name }); setExpanded((prev) => ({ ...prev, [section._id]: true })); }} className="p-1 text-blue-400 hover:text-blue-600 rounded">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => deleteSection(section._id)} className="p-1 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Lessons + add lesson */}
          {expanded[section._id] && (
            <div className="p-3 space-y-3">
              {/* Existing lessons */}
              {(section.subSections || []).map((sub) => (
                <div key={sub._id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-100 rounded-lg">
                  <Film className="w-4 h-4 text-primary-400 shrink-0 hidden sm:block" />
                  <span className="flex-1 font-medium break-all">{sub.name}</span>
                  <div className="flex items-center gap-2 ml-0 sm:ml-auto">
                    {sub.duration > 0 && <span className="text-xs text-gray-400">{sub.duration} min</span>}
                    {sub.videoUrl && (
                      <video src={sub.videoUrl} controls className="w-full sm:w-48 rounded-lg max-h-28 bg-black" />
                    )}
                    <button onClick={() => deleteSubSection(sub._id, section._id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

              {/* Add lesson form */}
              <div className="pt-3 space-y-2 border-t border-gray-100">
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Add Lesson</p>
                <input value={newSubName[section._id] || ''} onChange={(e) => setNewSubName((prev) => ({ ...prev, [section._id]: e.target.value }))} placeholder="Lesson title (e.g. Variables and Data Types)" className="text-sm input-field" />
                <input value={newSubDesc[section._id] || ''} onChange={(e) => setNewSubDesc((prev) => ({ ...prev, [section._id]: e.target.value }))} placeholder="Short description (optional)" className="text-sm input-field" />
                {/* Video picker - responsive */}
                <label className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 transition-colors border-2 border-gray-200 border-dashed cursor-pointer rounded-xl hover:border-primary-400 hover:bg-primary-50">
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1 w-full">
                    {newSubVideo[section._id] ? (
                      <p className="text-sm font-medium text-primary-700 break-all">{newSubVideo[section._id].name}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Click to select video <span className="text-xs">(MP4, MOV — max 500MB)</span></p>
                    )}
                  </div>
                  <input type="file" accept="video/mp4,video/quicktime,video/avi,video/webm" onChange={(e) => handleVideoFileChange(section._id, e)} className="hidden" />
                </label>
                {/* Video preview - responsive */}
                {newSubVideoPreview[section._id] && (
                  <video src={newSubVideoPreview[section._id]} controls className="w-full rounded-lg max-h-48 bg-black" />
                )}
                <button onClick={() => addSubSection(section._id)} disabled={uploadingLesson[section._id]} className="justify-center w-full px-4 py-2 text-sm btn-primary">
                  {uploadingLesson[section._id] ? <><span className="mr-2 animate-spin">⏳</span>Uploading...</> : <><Plus className="w-3.5 h-3.5 mr-1" />Add Lesson</>}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────
function Overview() {
  const { user } = useAuth();
  const { instructorCourses, fetchInstructorCourses } = useCourses();
  useEffect(() => { fetchInstructorCourses(); }, []);
  const totalStudents = instructorCourses.reduce((s, c) => s + (c.studentsEnrolled?.length || 0), 0);
  const totalRevenue = instructorCourses.reduce((s, c) => s + ((c.studentsEnrolled?.length || 0) * (c.price - (c.price * (c.discount || 0)) / 100)), 0);
  const avgRating = instructorCourses.length ? (instructorCourses.reduce((s, c) => s + (c.averageRating || 0), 0) / instructorCourses.length).toFixed(1) : 0;
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Welcome, {user?.firstName}! 👋</h1>
      <p className="mb-6 text-gray-500">Here's how your courses are performing</p>
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses" value={instructorCourses.length} color="primary" />
        <StatCard icon={Users} label="Total Students" value={totalStudents} color="green" />
        <StatCard icon={Star} label="Avg Rating" value={avgRating} color="amber" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${Math.round(totalRevenue).toLocaleString()}`} color="red" />
      </div>
      <div className="p-5 card">
        <h2 className="mb-4 font-semibold">Your Courses</h2>
        {instructorCourses.length === 0 ? <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to start teaching!" /> : (
          <div className="space-y-3">
            {instructorCourses.slice(0, 5).map((c) => (
              <div key={c._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 text-primary-600 shrink-0"><BookOpen className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0"><p className="font-medium truncate">{c.name}</p><p className="text-sm text-gray-500">{c.studentsEnrolled?.length || 0} students • ₹{c.price?.toLocaleString()}</p></div>
                <span className={`badge shrink-0 ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.isPublished ? 'Live' : 'Draft'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Courses ────────────────────────────────────────────────
function MyCoursesPanel() {
  const { instructorCourses, loading, fetchInstructorCourses, togglePublish, deleteCourse } = useCourses();
  const { list: categories, fetchCategories } = useCategories();
  const [modal, setModal] = useState({ open: false, editing: null });
  const [sectionModal, setSectionModal] = useState({ open: false, course: null });

  useEffect(() => { fetchInstructorCourses(); fetchCategories(); }, []);

  const handleSectionModalOpen = (course) => {
    setSectionModal({ open: true, course });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Course</button>
      </div>

      {loading ? <Spinner /> : instructorCourses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course and start teaching!" action={<button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">Create Course</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {instructorCourses.map((course) => (
            <div key={course._id} className="overflow-hidden card">
              {course.thumbnail && <img src={course.thumbnail} alt={course.name} className="object-cover w-full h-36" />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="flex-1 mr-2 font-semibold line-clamp-2">{course.name}</h3>
                  <span className={`badge shrink-0 ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{course.isPublished ? 'Live' : 'Draft'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.studentsEnrolled?.length || 0}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{Number(course.averageRating || 0).toFixed(1)}</span>
                  <span>₹{course.price?.toLocaleString()}</span>
                  <span className="text-gray-400">{course.sections?.length || 0} sections</span>
                </div>
                {/* Action buttons - responsive wrap */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setModal({ open: true, editing: course })} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => togglePublish(course._id)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                    {course.isPublished ? <ToggleRight className="w-3.5 h-3.5 text-green-600" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleSectionModalOpen(course)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Film className="w-3.5 h-3.5" /> Curriculum</button>
                  <button onClick={() => { if (confirm('Delete this course permanently?')) deleteCourse(course._id); }} className="text-red-500 hover:bg-red-50 border border-red-200 rounded-lg text-xs px-3 py-1.5 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CourseFormModal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })} editing={modal.editing} categories={categories} />

      {/* Curriculum modal - full screen on mobile */}
      <Modal isOpen={sectionModal.open} onClose={() => setSectionModal({ open: false, course: null })} title={`Curriculum — ${sectionModal.course?.name || ''}`}>
        {sectionModal.course && (
          <SectionManager
            course={sectionModal.course}
            onRefresh={() => fetchInstructorCourses()}
          />
        )}
      </Modal>
    </div>
  );
}

// ── Profile Panel ─────────────────────────────────────────────
function ProfilePanel() {
  const { user, fetchMe } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '', phone: '', gender: 'other' });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || '', lastName: user.lastName || '', bio: user.profile?.bio || '', phone: user.profile?.phone || '', gender: user.profile?.gender || 'other' });
      setPreviewUrl(user.profile?.avatar || null);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.updateProfile(form);
      if (avatar) { const fd = new FormData(); fd.append('avatar', avatar); await api.uploadAvatar(fd); }
      await fetchMe();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
      <div className="max-w-xl">
        <div className="p-6 card">
          <div className="flex items-center gap-5 pb-6 mb-6 border-b border-gray-100">
            <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-2xl font-bold rounded-full bg-primary-100 text-primary-600 shrink-0">
              {previewUrl ? <img src={previewUrl} alt="avatar" className="object-cover w-full h-full" /> : `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
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
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────
export default function InstructorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <span className="font-semibold">Instructor Panel</span>
        </div>
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="courses" element={<MyCoursesPanel />} />
            <Route path="profile" element={<ProfilePanel />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
