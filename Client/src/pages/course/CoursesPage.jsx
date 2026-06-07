import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, BookOpen } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useCategories } from '../../context/CategoryContext';
import { CourseCard, Spinner, EmptyState } from '../../components/common/index.jsx';

export default function CoursesPage() {
  const { list, loading, total, pages, fetchCourses } = useCourses();
  const { list: categories, fetchCategories } = useCategories();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const q = { page, sort, limit: 12 };
    if (search) q.search = search;
    if (category) q.category = category;
    fetchCourses(q);
  }, [page, sort, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses({ page: 1, sort, limit: 12, ...(search && { search }), ...(category && { category }) });
  };

  const clearFilters = () => {
    setSearch(''); setCategory(''); setSort('newest'); setPage(1);
    fetchCourses({ page: 1, sort: 'newest', limit: 12 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">All Courses</h1>
        <p className="text-gray-500">{total} courses available</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="input-field pl-9" />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field sm:w-44">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input-field sm:w-40">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low</option>
          <option value="price_desc">Price: High</option>
        </select>
        {(search || category) && (
          <button onClick={clearFilters} className="btn-secondary text-sm flex items-center gap-1">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>
      {loading ? <Spinner size="lg" className="py-24" /> : list.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Try different search terms or filters" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((course) => <CourseCard key={course._id} course={course} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
