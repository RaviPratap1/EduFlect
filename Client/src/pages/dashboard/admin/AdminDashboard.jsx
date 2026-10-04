import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Tag, CreditCard, LayoutDashboard, Trash2, Edit, Plus, ToggleLeft, ToggleRight, Menu } from 'lucide-react';
import { useCourses } from '../../../context/CourseContext';
import { useCategories } from '../../../context/CategoryContext';
import { StatCard, Spinner, EmptyState, Modal } from '../../../components/common/index.jsx';
import * as api from '../../../api/services';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/admin/users', label: 'Users', icon: Users },
  { to: '/dashboard/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/dashboard/admin/categories', label: 'Categories', icon: Tag },
  { to: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard },
];

const Sidebar = ({ open, setOpen }) => (
  <>
    {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white z-40 flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-5 border-b border-gray-700"><p className="text-lg font-bold">🛡️ Admin Panel</p><p className="text-gray-400 text-sm mt-0.5">EduFlect</p></div>
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

function Overview() {
  const { adminCourses, fetchAdminCourses } = useCourses();
  const { list: categories, fetchCategories } = useCategories();
  const [stats, setStats] = useState({ users: 0, students: 0, instructors: 0 });

  useEffect(() => {
    fetchAdminCourses();
    fetchCategories();
    api.adminGetAllUsers().then((r) => {
      const users = r.data?.data?.users || [];
      setStats({ users: r.data?.data?.total || 0, students: users.filter((u) => u.role === 'student').length, instructors: users.filter((u) => u.role === 'instructor').length });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Overview</h1>
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} color="primary" />
        <StatCard icon={Users} label="Students" value={stats.students} color="green" />
        <StatCard icon={Users} label="Instructors" value={stats.instructors} color="amber" />
        <StatCard icon={BookOpen} label="Total Courses" value={adminCourses.length} color="red" />
      </div>
      <div className="p-5 card">
        <h2 className="mb-4 font-semibold">Recent Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100">{['Course','Instructor','Students','Status'].map((h) => <th key={h} className="pb-3 pr-4 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {adminCourses.slice(0, 8).map((c) => (
                <tr key={c._id}>
                  <td className="py-3 pr-4 font-medium max-w-[200px] truncate">{c.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{c.instructor?.firstName} {c.instructor?.lastName}</td>
                  <td className="py-3 pr-4">{c.studentsEnrolled?.length || 0}</td>
                  <td className="py-3"><span className={`badge ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.adminGetAllUsers({ role: roleFilter }); setUsers(data.data.users || []); }
    catch { toast.error('Failed to load users'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.adminDeleteUser(id); setUsers((p) => p.filter((u) => u._id !== id)); toast.success('User deleted'); }
    catch { toast.error('Failed'); }
  };

  const updateRole = async (id, role) => {
    try { await api.adminUpdateUserRole(id, role); load(); toast.success('Role updated'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-40 input-field">
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {loading ? <Spinner /> : (
        <div className="overflow-hidden card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50"><tr>{['Name','Email','Role','Joined','Actions'].map((h) => <th key={h} className="px-4 py-3 font-medium text-left text-gray-600">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3"><select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="px-2 py-1 text-xs border border-gray-200 rounded"><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><button onClick={() => deleteUser(u._id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesPanel() {
  const { adminCourses, loading, fetchAdminCourses, togglePublish, deleteCourse } = useCourses();
  useEffect(() => { fetchAdminCourses(); }, []);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">All Courses</h1>
      {loading ? <Spinner /> : (
        <div className="overflow-hidden card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50"><tr>{['Course','Instructor','Category','Price','Students','Status','Actions'].map((h) => <th key={h} className="px-4 py-3 font-medium text-left text-gray-600">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {adminCourses.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.instructor?.firstName} {c.instructor?.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{c.category?.name}</td>
                    <td className="px-4 py-3">{Number(c.price) === 0 ? 'Free' : `₹${c.price?.toLocaleString()}`}</td>
                    <td className="px-4 py-3">{c.studentsEnrolled?.length || 0}</td>
                    <td className="px-4 py-3"><span className={`badge ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.isPublished ? 'Live' : 'Draft'}</span></td>
                    <td className="flex gap-2 px-4 py-3">
                      <button onClick={() => togglePublish(c._id)} className="p-1 text-primary-600 hover:text-primary-800">{c.isPublished ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}</button>
                      <button onClick={() => { if (confirm('Delete course?')) deleteCourse(c._id); }} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesPanel() {
  const { list, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [modal, setModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setForm({ name: '', description: '' }); setModal({ open: true, data: null }); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description || '' }); setModal({ open: true, data: cat }); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (modal.data) { await updateCategory(modal.data._id, form); }
    else { await createCategory(form); }
    setModal({ open: false, data: null });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between p-4 card">
              <div><p className="font-semibold">{cat.name}</p><p className="text-sm text-gray-500">{cat.description || '—'}</p></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 text-blue-500 rounded-lg hover:bg-blue-50"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteCategory(cat._id)} className="p-2 text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <div><label className="block mb-1 text-sm font-medium">Name *</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" /></div>
          <div><label className="block mb-1 text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="h-24 resize-none input-field" /></div>
          <button onClick={handleSave} className="justify-center w-full btn-primary">{modal.data ? 'Update' : 'Create'} Category</button>
        </div>
      </Modal>
    </div>
  );
}

function PaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminGetAllPayments().then((r) => setPayments(r.data?.data?.payments || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Payment Transactions</h1>
      {loading ? <Spinner /> : (
        <div className="overflow-hidden card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50"><tr>{['User','Course','Amount','Status','Date'].map((h) => <th key={h} className="px-4 py-3 font-medium text-left text-gray-600">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{p.user?.firstName} {p.user?.lastName}<br /><span className="text-xs text-gray-400">{p.user?.email}</span></td>
                    <td className="px-4 py-3 max-w-[180px] truncate">{p.course?.name}</td>
                    <td className="px-4 py-3 font-medium">₹{(p.amount / 100).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`badge ${p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <span className="font-semibold">Admin Panel</span>
        </div>
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="users" element={<UsersPanel />} />
            <Route path="courses" element={<CoursesPanel />} />
            <Route path="categories" element={<CategoriesPanel />} />
            <Route path="payments" element={<PaymentsPanel />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
