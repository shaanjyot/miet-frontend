'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { FaThLarge, FaList, FaTags, FaUserCircle, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUserMd, FaChevronDown } from "react-icons/fa";
import { getApiUrl } from '@/utils/api';

interface Blog {
  id?: number;
  title: string;
  description: string;
  category: 'Therapy' | 'Mental Health' | 'Education' | 'Support' | 'Technology';
  thumbnail: string;
  author: string;
  status: 'active' | 'inactive' | 'published' | 'draft' | 'pending' | 'archived' | 'live' | 'scheduled' | 'private' | 'public' | 'review' | 'approved' | 'rejected' | 'trash' | 'deleted';
  created_at?: string;
  updated_at?: string;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'blogs'>('blogs');

  // Blog state
  const [blogForm, setBlogForm] = useState<Partial<Blog>>({
    title: '',
    description: '',
    category: 'Therapy',
    thumbnail: '',
    author: '',
    status: 'active'
  });
  const [blogEditId, setBlogEditId] = useState<number | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState<number | null>(null);
  const [deleteBlogName, setDeleteBlogName] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("admin_jwt");
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Blog CRUD
  async function fetchBlogs() {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl('api/blogs'));
      if (res.ok) {
        const data = await res.json();
        console.log('Blogs fetched:', data);
        const blogsArray = data.blogs || data;
        setBlogs(blogsArray);
      } else {
        console.error('Failed to fetch blogs:', res.status);
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBlogSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    try {
      const token = localStorage.getItem("admin_jwt");
      const method = blogEditId ? "PUT" : "POST";
      const url = blogEditId
        ? getApiUrl(`api/blogs/${blogEditId}`)
        : getApiUrl('api/blogs');

      let res: Response;

      // Use FormData if file is uploaded, otherwise use JSON
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('title', blogForm.title || '');
        formData.append('description', blogForm.description || '');
        formData.append('category', blogForm.category || 'Therapy');
        formData.append('author', blogForm.author || '');
        formData.append('status', blogForm.status || 'active');
        formData.append('thumbnail', thumbnailFile);

        const headers: HeadersInit = { Authorization: `Bearer ${token}` };
        // Don't set Content-Type header when using FormData - browser will set it with boundary

        res = await fetch(url, {
          method,
          headers,
          body: formData,
        });
      } else {
        // Use JSON when no file is uploaded
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        };

        res = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(blogForm),
        });
      }

      if (res.ok) {
        setBlogForm({ title: '', description: '', category: 'Therapy', thumbnail: '', author: '', status: 'active' });
        setThumbnailFile(null);
        setThumbnailPreview('');
        setBlogEditId(null);
        setShowBlogModal(false);
        fetchBlogs();
        alert(blogEditId ? 'Blog updated successfully!' : 'Blog added successfully!');
      } else {
        const errorData = await res.text();
        alert(`Failed to save blog: ${res.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog. Please try again.');
    }
  }

  async function handleBlogEdit(blog: Blog) {
    setBlogEditId(blog.id ?? null);
    setBlogForm(blog);
    setThumbnailFile(null);
    setThumbnailPreview(blog.thumbnail || '');
    setShowBlogModal(true);
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear thumbnail URL when file is selected
      setBlogForm({ ...blogForm, thumbnail: '' });
    }
  }

  async function handleBlogDelete() {
    if (!deleteBlogId) return;

    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl(`api/blogs/${deleteBlogId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setBlogs(blogs.filter(b => b.id !== deleteBlogId));
        setDeleteBlogId(null);
        setDeleteBlogName('');
        setShowBlogModal(false);
        alert('Blog deleted successfully!');
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog');
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_jwt");
    router.replace("/admin/login");
  }

  // Sidebar menu items
  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: <FaThLarge size={20} /> },
    { key: 'blogs', label: 'Blogs & Media', icon: <FaList size={20} /> },
  ];

  if (loading) {
    return (
      <>
        <TopBar />
        <section style={{ background: 'var(--card)', padding: '2.5rem 0', textAlign: 'center', minHeight: '100vh' }} aria-label="Blogs">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '24px', color: '#5a67d8', fontWeight: '600' }}>Loading Blogs...</div>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5a67d8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 280 : 80,
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {sidebarOpen && (
              <h1 style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: '700' }}>Admin Panel</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              {sidebarOpen ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
            </button>
          </div>
        </div>

        <nav style={{ padding: '16px 0' }}>
          {menu.map(item => (
            <div key={item.key}>
              <button
                onClick={() => setActiveMenu(item.key as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  background: activeMenu === item.key ? 'var(--accent)' : 'transparent',
                  color: activeMenu === item.key ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              background: 'none',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            <FaSignOutAlt size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 280 : 80,
        padding: '32px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Blogs CRUD */}
        <section>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#22543d', marginBottom: 18 }}>Manage Blogs</h2>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <select
              value={blogForm.category}
              onChange={e => setBlogForm(f => ({ ...f, category: e.target.value as 'Therapy' | 'Mental Health' | 'Education' | 'Support' | 'Technology' }))}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', minWidth: 140 }}
            >
              <option value="Therapy">Therapy</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Education">Education</option>
              <option value="Support">Support</option>
              <option value="Technology">Technology</option>
            </select>
            <button
              style={{ background: '#22543d', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
              onClick={() => {
                setBlogForm({ title: '', description: '', category: 'Therapy', thumbnail: '', author: '', status: 'active' });
                setBlogEditId(null);
                setThumbnailFile(null);
                setThumbnailPreview('');
                setShowBlogModal(true);
              }}
            >
              + Add Blog
            </button>
          </div>

          {/* Blog Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#e2e8f0' }}>
                <th style={{ padding: 10, textAlign: 'left', color: '#22543d' }}>Thumbnail</th>
                <th style={{ padding: 10, textAlign: 'left', color: '#22543d' }}>Category</th>
                <th style={{ padding: 10, textAlign: 'left', color: '#22543d' }}>Title</th>
                <th style={{ padding: 10, textAlign: 'left', color: '#22543d' }}>Author</th>
                <th style={{ padding: 10, textAlign: 'left', color: '#22543d' }}>Status</th>
                <th style={{ padding: 10, textAlign: 'left', color: '#22543d' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id ?? blog.title} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 10 }}>
                    {blog.thumbnail ? (
                      <img
                        src={blog.thumbnail}
                        alt="Thumbnail"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 50,
                        height: 50,
                        background: '#f1f5f9',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: 12
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 10 }}>{blog.category}</td>
                  <td style={{ padding: 10 }}>{blog.title}</td>
                  <td style={{ padding: 10 }}>{blog.author}</td>
                  <td style={{ padding: 10 }}>{blog.status}</td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => handleBlogEdit(blog)} style={{ background: '#e2e8f0', color: '#22543d', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => {
                      setDeleteBlogId(blog.id ?? null);
                      setDeleteBlogName(blog.title || 'this blog');
                      setShowBlogModal(false);
                    }} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Blog Modal */}
          {showBlogModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(34,37,77,0.32)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setShowBlogModal(false); }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 480, boxShadow: '0 4px 32px rgba(90,103,216,0.13)', position: 'relative' }}>
                <button onClick={() => setShowBlogModal(false)} aria-label="Close blog modal" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#5a67d8', cursor: 'pointer' }}>×</button>
                <h2 style={{ color: '#22543d', fontWeight: 700, marginBottom: 18 }}>{blogEditId ? 'Edit' : 'Add'} Blog</h2>
                <form
                  onSubmit={handleBlogSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <label style={{ fontWeight: 600, color: '#22543d' }}>Category</label>
                  <select
                    value={blogForm.category}
                    onChange={e => setBlogForm(f => ({ ...f, category: e.target.value as 'Therapy' | 'Mental Health' | 'Education' | 'Support' | 'Technology' }))}
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  >
                    <option value="Therapy">Therapy</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Education">Education</option>
                    <option value="Support">Support</option>
                    <option value="Technology">Technology</option>
                  </select>
                  <label style={{ fontWeight: 600, color: '#22543d' }}>Title</label>
                  <input type="text" value={blogForm.title || ''} onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }} />
                  <label style={{ fontWeight: 600, color: '#22543d' }}>Description</label>
                  <textarea value={blogForm.description || ''} onChange={e => setBlogForm(f => ({ ...f, description: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', minHeight: 60 }} />
                  <label style={{ fontWeight: 600, color: '#22543d' }}>Author</label>
                  <input type="text" value={blogForm.author || ''} onChange={e => setBlogForm(f => ({ ...f, author: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }} />
                  <label style={{ fontWeight: 600, color: '#22543d' }}>Thumbnail Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', width: '100%' }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                    Upload an image file (max 5MB) or use URL below
                  </div>
                  <label style={{ fontWeight: 600, color: '#22543d', marginTop: 12 }}>Or Enter Thumbnail URL</label>
                  <input
                    type="text"
                    value={blogForm.thumbnail || ''}
                    onChange={e => {
                      setBlogForm(f => ({ ...f, thumbnail: e.target.value }));
                      if (e.target.value) {
                        setThumbnailFile(null);
                        setThumbnailPreview(e.target.value);
                      }
                    }}
                    placeholder="Enter thumbnail URL (optional if uploading file)"
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}
                  />
                  {(thumbnailPreview || blogForm.thumbnail) && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Preview:</div>
                      <img
                        src={thumbnailPreview || blogForm.thumbnail}
                        alt="Thumbnail preview"
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <label style={{ fontWeight: 600, color: '#22543d' }}>Status</label>
                  <select value={blogForm.status} onChange={e => setBlogForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' | 'published' | 'draft' | 'pending' | 'archived' | 'live' | 'scheduled' | 'private' | 'public' | 'review' | 'approved' | 'rejected' | 'trash' | 'deleted' }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="archived">Archived</option>
                    <option value="live">Live</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="trash">Trash</option>
                    <option value="deleted">Deleted</option>
                  </select>
                  <button type="submit" style={{ background: '#22543d', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 12 }}>{blogEditId ? 'Update' : 'Add'} Blog</button>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteBlogId && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 4000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: '#dc2626', marginBottom: '16px', fontSize: '20px' }}>Delete Blog</h3>
                <p style={{ marginBottom: '24px', color: '#374151' }}>
                  Are you sure you want to delete <strong>{deleteBlogName}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => { setDeleteBlogId(null); setDeleteBlogName(''); }}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBlogDelete}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
