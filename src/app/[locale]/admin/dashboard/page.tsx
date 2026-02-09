"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Image from 'next/image';
import { FaThLarge, FaList, FaTags, FaUserCircle, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUserMd, FaChevronDown, FaSearch, FaEdit, FaTrash, FaPlus, FaEye, FaImages, FaCog } from "react-icons/fa";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { getApiUrl } from "@/utils/api";
import { useNotifications } from "@/components/NotificationSystem";

interface Category {
  id: number;
  name: string;
  created_at: string;
}
interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  created_at: string;
}

interface Consultant {
  id?: number;
  user_id?: number;
  username?: string;
  password?: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  description?: string;
  tagline?: string;
  location_lat?: string;
  location_lng?: string;
  address?: string;
  speciality?: string;
  id_proof_type?: string;
  id_proof_url?: string;
  aadhar?: string;
  bank_account?: string;
  bank_ifsc?: string;
  status?: 'online' | 'offline';
  featured?: boolean;
  category_ids?: number[] | string[];
  subcategory_ids?: number[] | string[];
  slots?: string[];
  city?: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  status?: string;
  created_at?: string;
}

// Extend the form state to allow confirmPassword (not persisted to backend)
type ConsultantForm = Partial<Consultant> & { confirmPassword?: string; category_ids: string[]; subcategory_ids: string[] };

interface ServiceType {
  id?: number;
  name: string;
  description: string;
  delivery_mode: string;
  service_type: string;
  appointment_type?: string;
  event_type?: string;
  test_type?: string;
  revenue_type?: string;
  price?: string;
  renewal_date?: string;
  center?: string;
  test_redirect_url?: string;
  consultant_ids?: string[];
  category_ids?: string[];
  subcategory_ids?: string[];
  suggestions?: { title: string; description: string; redirect_url: string }[];
  subscription_start?: string;
  subscription_end?: string;
  discount?: string;
  monthly_price?: string;
  yearly_price?: string;
  center_address?: string;
  center_lat?: string;
  center_lng?: string;
  event_start?: string;
  event_end?: string;
  event_image?: string;
  event_meet_link?: string;
  created_at?: string;
}

// Product types and state (moved outside component for linter)
export type ProductType = 'Course' | 'E-book' | 'App' | 'Gadget';
export interface Product {
  id?: number;
  type: ProductType;
  product_type?: string; // Backend field name
  title?: string;
  name?: string;
  description: string;
  price?: string;
  thumbnail?: string;
  status: 'active' | 'inactive';
  featured?: boolean;
  video_url?: string;
  pdf_url?: string;
  icon_url?: string;
  product_image?: string;
  thumbnailFile?: File;
  pdfFile?: File;
  iconFile?: File;
  productImageFile?: File;
  // Additional fields used in forms/UI (optional)
  author?: string;
  download_link?: string;
  purchase_link?: string;
  subtitle?: string;
  duration?: string;
  total_lectures?: number;
  language?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  learning_objectives?: string[];
  requirements?: string[];
  course_content?: { section: string; lectures: number; duration: string; items: string[] }[];
  instructor_name?: string;
  instructor_title?: string;
  instructor_bio?: string;
  instructor_image?: string;
  instructorImageFile?: File;
  rating?: number;
  total_ratings?: number;
  enrolled_students?: number;
  pdf_file?: string; // filename helper when uploading PDFs
  icon?: string; // preview URL for icon
}

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

interface Webinar {
  id?: number;
  webinar_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_attendees?: number;
  current_attendees?: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  google_meet_link?: string;
  google_calendar_event_id?: string;
  price?: number;
  is_free?: boolean;
  organizer_email?: string;
  attendee_emails?: string[];
  meeting_notes?: string;
  recording_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface Consultation {
  id?: number;
  appointment_id?: string;
  consultant_id: number;
  user_id?: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  meeting_type: 'consultation' | 'webinar';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  google_meet_link?: string;
  google_calendar_event_id?: string;
  price?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_id?: string;
  attendee_emails?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [catName, setCatName] = useState("");
  const [subName, setSubName] = useState("");
  const [subCatId, setSubCatId] = useState<number | "">("");
  const [catEditId, setCatEditId] = useState<number | null>(null);
  const [subEditId, setSubEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ailmentsExpanded, setAilmentsExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'categories' | 'subcategories' | 'consultants' | 'users' | 'services' | 'products' | 'blogs' | 'webinars' | 'consultations' | 'gallery' | 'cms'>('dashboard');
  const [isClient, setIsClient] = useState(false);
  // Consultant state
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantForm, setConsultantForm] = useState<ConsultantForm>({
    category_ids: [],
    subcategory_ids: [],
    username: '',
    password: '',
    name: '',
    email: '',
    city: '',
    status: 'offline',
    featured: false
  });
  const [consultantEditId, setConsultantEditId] = useState<number | null>(null);
  const [consultantProfile, setConsultantProfile] = useState<Consultant | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false); // for superadmin
  const [showConsultantProfileModal, setShowConsultantProfileModal] = useState(false); // for consultant details
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  const [consultantSlots, setConsultantSlots] = useState<{ date: string; time: string; endTime?: string }[]>([]);
  const [slotDuration, setSlotDuration] = useState<number>(60); // Default 60 minutes
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState<{ id?: number; username: string; password?: string; role: string }>({ username: '', password: '', role: 'consultant' });
  const [userEditId, setUserEditId] = useState<number | null>(null);
  // Services state
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    delivery_mode: 'online',
    service_type: 'appointment',
    appointment_type: '',
    event_type: '',
    test_type: '',
    revenue_type: 'paid',
    price: '',
    renewal_date: '',
    center: '',
    test_redirect_url: '',
    consultant_ids: [],
    category_ids: [],
    subcategory_ids: [],
    suggestions: [{ title: '', description: '', redirect_url: '' }],
    subscription_start: '',
    subscription_end: '',
    discount: '',
    monthly_price: '',
    yearly_price: '',
    center_address: '',
    center_lat: '',
    center_lng: '',
    event_start: '',
    event_end: '',
    event_image: null as File | null,
    event_meet_link: '',
  });
  const [serviceEditId, setServiceEditId] = useState<number | null>(null);
  const [selectedConsultantIds, setSelectedConsultantIds] = useState<number[]>([]);
  const [consultantAvailability, setConsultantAvailability] = useState<Record<number, string[]>>({}); // consultantId -> array of slots
  const [consultationDate, setConsultationDate] = useState('');
  // Track if consultant form has been loaded for editing
  const [consultantFormLoaded, setConsultantFormLoaded] = useState(false);
  // Services state for list and modal
  const [services, setServices] = useState<ServiceType[]>([]);
  const [serviceProfile, setServiceProfile] = useState<ServiceType | null>(null);
  const [showServiceProfileModal, setShowServiceProfileModal] = useState(false);
  // Add state for name and email
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  // Add these states at the top of your component
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  // Add these states at the top of your component
  const [serviceFormLoading, setServiceFormLoading] = useState(false);
  const [serviceFormMessage, setServiceFormMessage] = useState('');
  // Product types and state
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<Partial<Product>>({ type: 'Course', status: 'active', featured: false });
  const [productEditId, setProductEditId] = useState<number | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductProfileModal, setShowProductProfileModal] = useState(false);
  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConsultantId, setDeleteConsultantId] = useState<number | null>(null);
  const [deleteConsultantName, setDeleteConsultantName] = useState<string>('');
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteProductName, setDeleteProductName] = useState<string>('');

  // Real-time dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Table states for all CRUD operations
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Webinar state
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [webinarForm, setWebinarForm] = useState<Webinar>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    max_attendees: 100,
    price: 0,
    is_free: true,
    attendee_emails: [],
    meeting_notes: '',
    status: 'scheduled'
  });
  const [showWebinarModal, setShowWebinarModal] = useState(false);
  const [webinarEditId, setWebinarEditId] = useState<number | null>(null);

  // Consultation state
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [consultationForm, setConsultationForm] = useState<Consultation>({
    consultant_id: 0,
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    meeting_type: 'consultation',
    price: 0,
    attendee_emails: [],
    notes: '',
    status: 'scheduled',
    payment_status: 'pending'
  });
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationEditId, setConsultationEditId] = useState<number | null>(null);

  // Google OAuth state
  const [googleOAuthSetup, setGoogleOAuthSetup] = useState(false);

  // Modal states for all CRUD operations
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showConsultantModal, setShowConsultantModal] = useState(false);

  // Blog state
  const [blogs, setBlogs] = useState<Blog[]>([]);
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

  // Gallery state
  interface GalleryImage {
    id?: number;
    title: string;
    description: string;
    image_path: string;
    display_order: number;
    status: 'active' | 'inactive';
    created_at?: string;
  }
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryEditId, setGalleryEditId] = useState<number | null>(null);
  const [galleryEditForm, setGalleryEditForm] = useState<Partial<GalleryImage>>({});
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);

  // CMS state
  interface CmsItem {
    id?: number;
    page_key: string;
    section_key: string;
    field_key: string;
    field_value: string;
    field_type: 'text' | 'textarea' | 'html' | 'image' | 'number' | 'json';
  }
  const [cmsContent, setCmsContent] = useState<CmsItem[]>([]);
  const [cmsForm, setCmsForm] = useState<CmsItem>({
    page_key: 'home',
    section_key: '',
    field_key: '',
    field_value: '',
    field_type: 'text'
  });
  const [cmsEditId, setCmsEditId] = useState<number | null>(null);
  const [showCmsModal, setShowCmsModal] = useState(false);
  const [cmsPageFilter, setCmsPageFilter] = useState('all');

  // Client-side hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle OAuth success message
  useEffect(() => {
    if (!isClient) return;

    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const message = urlParams.get('message');

    if (oauthSuccess === 'true' && message) {
      alert(decodeURIComponent(message));
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      setGoogleOAuthSetup(true);
    }
  }, [isClient]);

  // Auth check
  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem("admin_jwt");
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router, isClient]);

  // Fetch categories/subcategories
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (activeMenu === 'consultants') fetchConsultants();
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === 'services') fetchConsultants();
  }, [activeMenu]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("api/categories"), {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_jwt")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      setCategories(await res.json());
    } catch {
      // setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }
  async function fetchSubcategories() {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("api/subcategories"), {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_jwt")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      setSubcategories(await res.json());
    } catch {
      // setError("Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  }

  async function fetchConsultants() {
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl("api/consultants"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const consultants = await res.json();
        // For each consultant, fetch their slots from the backend
        const consultantsWithSlots = await Promise.all(
          consultants.map(async (c: Consultant) => {
            try {
              const slotRes = await fetch(getApiUrl(`api/consultants/${c.id}/availability`), {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (slotRes.ok) {
                const slots = await slotRes.json();
                return {
                  ...c,
                  slots: slots.map((slot: { date: string; start_time: string; end_time: string; id: number }) => `${slot.date} ${slot.start_time}${slot.end_time ? '-' + slot.end_time : ''}`),
                };
              } else {
                return { ...c, slots: [] };
              }
            } catch (error) {

              return { ...c, slots: [] };
            }
          })
        );
        setConsultants(consultantsWithSlots);
      } else {

        setConsultants([]);
      }
    } catch (error) {

      setConsultants([]);
    }
  }

  // Fetch users
  async function fetchUsers() {
    const token = localStorage.getItem("admin_jwt");
    const res = await fetch(getApiUrl("api/users"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setUsers(await res.json());
  }
  useEffect(() => {
    if (activeMenu === 'users') fetchUsers();
  }, [activeMenu]);

  // Fetch services
  async function fetchServices() {
    const token = localStorage.getItem('admin_jwt');
    const res = await fetch(getApiUrl("api/services"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setServices(await res.json());
    }
  }
  useEffect(() => {
    if (activeMenu === 'services') fetchServices();
  }, [activeMenu]);

  // Fetch products
  async function fetchProducts() {
    try {
      const res = await fetch(getApiUrl('api/products'));
      if (res.ok) {
        const data = await res.json();

        // Extract products array from response
        const productsArray = data.products || data;

        setProducts(productsArray);
      } else {

        setProducts([]);
      }
    } catch (error) {

      setProducts([]);
    }
  }

  useEffect(() => {
    if (activeMenu === 'products') fetchProducts();
  }, [activeMenu]);

  // Fetch webinars
  async function fetchWebinars() {
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl("api/webinars"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWebinars(data.webinars || []);
      }
    } catch (error) {

      setWebinars([]);
    }
  }

  useEffect(() => {
    if (activeMenu === 'webinars') fetchWebinars();
  }, [activeMenu]);

  // Fetch consultations
  async function fetchConsultations() {
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl("api/admin/consultations"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
      }
    } catch (error) {

      setConsultations([]);
    }
  }

  useEffect(() => {
    if (activeMenu === 'consultations') {
      fetchConsultations();
      fetchConsultants(); // Also fetch consultants for the dropdown
    }
  }, [activeMenu]);

  // Debug: Log products state changes
  useEffect(() => {


    if (Array.isArray(products)) {


    }
  }, [products]);

  // Category CRUD
  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const method = catEditId ? "PUT" : "POST";
      const url = catEditId ? getApiUrl(`api/categories/${catEditId}`) : getApiUrl("api/categories");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_jwt")}`,
        },
        body: JSON.stringify({ name: catName }),
      });
      if (!res.ok) throw new Error("Failed to save category");
      setCatName("");
      setCatEditId(null);
      setShowCategoryModal(false);
      fetchCategories();
    } catch {
      // setError("Failed to save category");
    } finally {
      setLoading(false);
    }
  }
  async function handleCatEdit(cat: Category) {
    setCatEditId(cat.id);
    setCatName(cat.name);
  }
  async function handleCatDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`api/categories/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_jwt")}` },
      });
      if (!res.ok) throw new Error();
      fetchCategories();
    } catch {
      // setError("Failed to delete category");
    } finally {
      setLoading(false);
    }
  }

  // Subcategory CRUD
  async function handleSubSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const method = subEditId ? "PUT" : "POST";
      const url = subEditId ? getApiUrl(`api/subcategories/${subEditId}`) : getApiUrl("api/subcategories");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_jwt")}`,
        },
        body: JSON.stringify({ name: subName, category_id: subCatId }),
      });
      if (!res.ok) throw new Error("Failed to save subcategory");
      setSubName("");
      setSubCatId("");
      setSubEditId(null);
      setShowSubcategoryModal(false);
      fetchSubcategories();
    } catch {
      // setError("Failed to save subcategory");
    } finally {
      setLoading(false);
    }
  }
  async function handleSubEdit(sub: Subcategory) {
    setSubEditId(sub.id);
    setSubName(sub.name);
    setSubCatId(sub.category_id);
  }
  async function handleSubDelete(id: number) {
    if (!confirm("Delete this subcategory?")) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`api/subcategories/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_jwt")}` },
      });
      if (!res.ok) throw new Error();
      fetchSubcategories();
    } catch {
      // setError("Failed to delete subcategory");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_jwt");
    router.replace("/admin/login");
  }

  // Sidebar menu items
  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: <FaThLarge size={20} /> },
    {
      key: 'ailments',
      label: 'Ailments',
      icon: <FaTags size={20} />,
      children: [
        { key: 'categories', label: 'Categories', icon: <FaTags size={18} /> },
        { key: 'subcategories', label: 'Subcategories', icon: <FaList size={18} /> },
      ],
    },
    { key: 'consultants', label: 'Consultants', icon: <FaUserMd size={20} /> },
    { key: 'users', label: 'Users', icon: <FaUserCircle size={20} /> },
    { key: 'services', label: 'Services', icon: <FaTags size={20} /> },
    { key: 'products', label: 'Products', icon: <FaList size={20} /> },
    { key: 'blogs', label: 'Blogs & Media', icon: <FaList size={20} /> },
    { key: 'webinars', label: 'Webinars', icon: <FaList size={20} /> },
    { key: 'consultations', label: 'Consultations', icon: <FaUserMd size={20} /> },
    { key: 'gallery', label: 'Gallery', icon: <FaImages size={20} /> },
    { key: 'cms', label: 'CMS / Pages', icon: <FaCog size={20} /> },
  ];

  // Helper to save slots to backend
  async function saveConsultantSlots(consultantId: number, slots: { date: string; time: string; endTime?: string }[]) {
    // First, fetch existing slots and delete them all (for update)
    const token = localStorage.getItem("admin_jwt");
    const res = await fetch(getApiUrl(`api/consultants/${consultantId}/availability`), { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const existing = await res.json();
      for (const slot of existing) {
        await fetch(getApiUrl(`api/consultants/${consultantId}/availability/${slot.id}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      }
    }
    // Add new slots
    for (const slot of slots) {
      if (slot.date && slot.time) {
        await fetch(getApiUrl(`api/consultants/${consultantId}/availability`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ date: slot.date, start_time: slot.time, end_time: slot.endTime || '' })
        });
      }
    }
  }

  // Consultant CRUD
  async function handleConsultantSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    // Validate Gmail address
    if (!consultantForm.email || !consultantForm.email.endsWith('@gmail.com')) {
      alert('Please enter a valid Gmail address for the consultant. Gmail is required for Google Meet invitations and calendar integration.');
      return;
    }

    try {
      const token = localStorage.getItem("admin_jwt");
      const method = consultantEditId ? "PUT" : "POST";
      const url = consultantEditId ? getApiUrl(`api/consultants/${consultantEditId}`) : getApiUrl('api/consultants');

      // Convert category_ids and subcategory_ids to number[] before submitting
      const payload = {
        ...consultantForm,
        category_ids: Array.isArray(consultantForm.category_ids) ? consultantForm.category_ids.map(Number) : [],
        subcategory_ids: Array.isArray(consultantForm.subcategory_ids) ? consultantForm.subcategory_ids.map(Number) : [],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        let consultantId = consultantEditId;
        if (!consultantEditId) {
          const data = await res.json();
          consultantId = data.id;
        }
        if (consultantId) {
          await saveConsultantSlots(consultantId, consultantSlots);
        }
        setConsultantForm({
          category_ids: [],
          subcategory_ids: [],
          username: '',
          password: '',
          name: '',
          email: '',
          city: '',
          status: 'offline',
          featured: false
        });
        setConsultantEditId(null);
        setConsultantSlots([]);
        setConsultantFormLoaded(false);
        setShowConsultantModal(false);
        fetchConsultants();

      } else {
        const errorData = await res.text();

        alert(`Failed to save consultant: ${res.status} ${errorData}`);
      }
    } catch (error) {

      alert('Error saving consultant. Please try again.');
    }
  }
  async function handleConsultantEdit(c: Consultant) {
    if (typeof c.id === 'number') {
      setConsultantEditId(c.id);
      setConsultantForm({
        ...c,
        category_ids: Array.isArray(c.category_ids) ? c.category_ids.map(id => String(id)) : [],
        subcategory_ids: Array.isArray(c.subcategory_ids) ? c.subcategory_ids.map(id => String(id)) : [],
      });
      // Fetch slots from backend
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl(`api/consultants/${c.id}/availability`), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const slots = await res.json();
        setConsultantSlots(slots.map((slot: { date: string; start_time: string; end_time: string; id: number }) => ({ date: slot.date, time: slot.start_time, endTime: slot.end_time })));
      } else {
        setConsultantSlots([]);
      }
      setConsultantFormLoaded(true);
    }
  }
  // Show delete confirmation modal
  function showDeleteConsultantModal(id: number, name: string) {
    setDeleteConsultantId(id);
    setDeleteConsultantName(name);
    setShowDeleteModal(true);
  }
  // Refactor delete handlers to use modal
  async function handleConsultantDelete() {
    if (!deleteConsultantId) return;
    const token = localStorage.getItem("admin_jwt");
    const res = await fetch(getApiUrl(`api/consultants/${deleteConsultantId}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchConsultants();
      setShowDeleteModal(false);
      setDeleteConsultantId(null);
      setDeleteConsultantName('');
    }
  }
  async function handleConsultantProfile(id?: number) {
    if (typeof id !== 'number') return;
    const token = localStorage.getItem("admin_jwt");
    const res = await fetch(getApiUrl(`api/consultants/${id}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setConsultantProfile(await res.json());
  }
  const handleConsultantFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setConsultantForm({ ...consultantForm, [e.target.name]: e.target.value });
  }
  const handleConsultantFormCancel = () => {
    setConsultantEditId(null);
    setConsultantForm({
      category_ids: [],
      subcategory_ids: [],
      username: '',
      password: '',
      name: '',
      email: '',
      city: '',
      status: 'offline',
      featured: false
    });
    setConsultantSlots([]);
    setConsultantFormLoaded(false);
  };

  // File upload placeholder
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'id_proof_url') {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(getApiUrl('api/upload'), {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      // Use the URL as-is
      setConsultantForm(f => ({ ...f, [field]: data.url }));
    } catch {
      alert('Image upload failed.');
    }
  }

  // Multi-select handlers
  const handleConsultantMultiSelect = (field: string, values: string[] | number[]) => {
    setConsultantForm(f => ({ ...f, [field]: values }));
  };
  // // Availability handlers
  // function handleAddAvailability() {
  //   if (availDate && availTime && availEndTime) {
  //     setAvailability(prev => [...prev, { date: availDate, time: availTime, endTime: availEndTime }]);
  //     setAvailDate('');
  //     setAvailTime('');
  //     setAvailEndTime('');
  //   }
  // }
  // Use My Location
  function handleUseMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setConsultantForm(f => ({ ...f, location_lat: String(pos.coords.latitude), location_lng: String(pos.coords.longitude) }));
      });
    } else {
      alert('Geolocation not supported.');
    }
  }

  function handleMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      setConsultantForm(f => ({
        ...f,
        location_lat: String(event.latLng!.lat()),
        location_lng: String(event.latLng!.lng())
      }));
    }
  }

  const defaultMapCenter = { lat: 28.6139, lng: 77.2090 };

  async function handleToggleConsultantStatus(c: Consultant) {
    const token = localStorage.getItem("admin_jwt");
    const newStatus = c.status === 'online' ? 'offline' : 'online';
    await fetch(getApiUrl(`api/consultants/${c.id}/status`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchConsultants();
  }

  // Users CRUD
  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("admin_jwt");
    const method = userEditId ? "PUT" : "POST";
    const url = userEditId ? getApiUrl(`api/users/${userEditId}`) : getApiUrl('api/users');
    const body = userEditId ? { username: userForm.username, role: userForm.role } : userForm;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setUserForm({ username: '', password: '', role: 'consultant' });
      setUserEditId(null);
      setShowUserModal(false);
      fetchUsers();
    }
  }
  async function handleUserEdit(u: User) {
    setUserEditId(u.id);
    setUserForm({ id: u.id, username: u.username, role: u.role });
  }
  async function handleUserDelete(id: number) {
    if (!confirm("Delete this user?")) return;
    const token = localStorage.getItem("admin_jwt");
    const res = await fetch(getApiUrl(`api/users/${id}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchUsers();
  }
  function handleUserFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  }
  function handleUserFormCancel() {
    setUserForm({ username: '', password: '', role: 'consultant' });
    setUserEditId(null);
  }

  async function handleToggleUserStatus(u: User) {
    const token = localStorage.getItem("admin_jwt");
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    await fetch(getApiUrl(`api/users/${u.id}/status`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchUsers();
  }

  // Service CRUD
  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServiceFormLoading(true);
    setServiceFormMessage('');
    const token = localStorage.getItem('admin_jwt');
    const method = serviceEditId ? 'PUT' : 'POST';
    const url = serviceEditId ? getApiUrl(`api/services/${serviceEditId}`) : getApiUrl('api/services');
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(serviceForm),
      });
      if (res.ok) {
        setServiceForm({
          name: '',
          description: '',
          delivery_mode: 'online',
          service_type: 'appointment',
          appointment_type: '',
          event_type: '',
          test_type: '',
          revenue_type: 'paid',
          price: '',
          renewal_date: '',
          center: '',
          test_redirect_url: '',
          consultant_ids: [],
          category_ids: [],
          subcategory_ids: [],
          suggestions: [{ title: '', description: '', redirect_url: '' }],
          subscription_start: '',
          subscription_end: '',
          discount: '',
          monthly_price: '',
          yearly_price: '',
          center_address: '',
          center_lat: '',
          center_lng: '',
          event_start: '',
          event_end: '',
          event_image: null as File | null,
          event_meet_link: '',
        });
        setServiceEditId(null);
        setShowServiceModal(false);
        fetchServices();
        setServiceFormMessage('Service submitted successfully!');
      } else {
        setServiceFormMessage('Error submitting service.');
      }
    } catch (err) {
      setServiceFormMessage('Error submitting service.');

    } finally {
      setServiceFormLoading(false);
    }
  }
  const handleServiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).selectedOptions;
      setServiceForm(f => ({ ...f, [name]: Array.from(options, opt => opt.value) }));
    } else {
      setServiceForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleAddSuggestion() {
    setServiceForm(f => ({ ...f, suggestions: [...f.suggestions, { title: '', description: '', redirect_url: '' }] }));
  }
  function handleRemoveSuggestion(idx: number) {
    setServiceForm(f => ({ ...f, suggestions: f.suggestions.filter((_, i) => i !== idx) }));
  }
  function handleSuggestionChange(idx: number, field: string, value: string) {
    setServiceForm(f => ({ ...f, suggestions: f.suggestions.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));
  }

  // When consultant_ids changes in serviceForm, update selectedConsultantIds and fetch/simulate availability
  useEffect(() => {
    const ids = (serviceForm.consultant_ids || []).map(Number).filter(Boolean);
    setSelectedConsultantIds(ids);
    // Fetch actual slots from the consultants array
    const avail: Record<number, string[]> = {};
    for (const id of ids) {
      const consultant = consultants.find(c => c.id === id);
      if (consultant && Array.isArray(consultant.slots)) {
        avail[id] = (consultant.slots as (string | { date: string; time: string; endTime?: string })[]).map(slot => {
          if (typeof slot === 'string') {
            return slot;
          } else if (typeof slot === 'object' && 'date' in slot && 'time' in slot) {
            return `${slot.date} ${slot.time}${slot.endTime ? '-' + slot.endTime : ''}`;
          }
          return '';
        }).filter(Boolean);
      } else {
        avail[id] = [];
      }
    }
    setConsultantAvailability(avail);
  }, [serviceForm.consultant_ids, consultants]);

  // Helper: get all available dates for selected consultants
  const getAvailableDates = () => {
    const allSlots = selectedConsultantIds.flatMap(cid => consultantAvailability[cid] || []);
    // Extract unique dates from slots (format: 'YYYY-MM-DD HH:MM-HH:MM')
    const dates = Array.from(new Set(allSlots.map(slot => slot.split(' ')[0])));
    return dates;
  };

  // Helper: get all blocked dates (dates with no available slots for any selected consultant)
  const getBlockedDates = () => {
    // Get all dates in the next 90 days
    const today = new Date();
    const blocked: string[] = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      if (!getAvailableDates().includes(dateStr)) {
        blocked.push(dateStr);
      }
    }
    return blocked;
  };

  // Helper: format date as DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper: format time as HH:MMAM/PM
  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m}${ampm}`;
  };

  // Helper: get available time slots for a given date, formatted
  const getTimeSlotsForDate = (date: string) => {
    return selectedConsultantIds.flatMap(cid =>
      (consultantAvailability[cid] || [])
        .filter(slot => slot.startsWith(date))
        .map(slot => {
          const time = slot.split(' ')[1];
          if (!time) return '';
          const [start, end] = time.split('-');
          if (end) {
            return `${formatTime(start)} - ${formatTime(end)}`;
          } else {
            return formatTime(start);
          }
        })
    );
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Add, edit, and remove slot handlers
  const handleAddSlot = () => {
    setConsultantSlots(slots => [...slots, { date: '', time: '', endTime: '' }]);
  };

  // Add slot with auto-calculated end time
  const handleAddSlotWithDuration = (date: string, startTime: string) => {
    const endTime = calculateEndTime(startTime, slotDuration);
    setConsultantSlots(slots => [...slots, { date, time: startTime, endTime }]);
  };

  // Quick add multiple slots for a time period
  const handleQuickAddSlots = (date: string, period: 'morning' | 'afternoon' | 'evening') => {
    if (!date) return;

    const periodTimes: { [key: string]: string[] } = {
      morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
      afternoon: ['12:00', '13:00', '14:00', '15:00', '16:00'],
      evening: ['17:00', '18:00', '19:00', '20:00']
    };

    // Filter times based on duration to avoid overlap
    const times = periodTimes[period];
    const newSlots: { date: string; time: string; endTime: string }[] = [];

    for (let i = 0; i < times.length; i++) {
      const startTime = times[i];
      const endTime = calculateEndTime(startTime, slotDuration);

      // Check if end time exceeds period boundary
      const endHour = parseInt(endTime.split(':')[0]);
      if (period === 'morning' && endHour > 12) continue;
      if (period === 'afternoon' && endHour > 17) continue;
      if (period === 'evening' && endHour > 21) continue;

      // Check if slot already exists
      const exists = consultantSlots.some(
        slot => slot.date === date && slot.time === startTime
      );
      if (!exists) {
        newSlots.push({ date, time: startTime, endTime });
      }
    }

    if (newSlots.length > 0) {
      setConsultantSlots(slots => [...slots, ...newSlots]);
    }
  };

  const handleSlotChange = (idx: number, field: string, value: string) => {
    setConsultantSlots(slots => slots.map((slot, i) => {
      if (i !== idx) return slot;
      const updatedSlot = { ...slot, [field]: value };
      // Auto-calculate end time when start time changes and duration is set
      if (field === 'time' && value && slotDuration) {
        updatedSlot.endTime = calculateEndTime(value, slotDuration);
      }
      return updatedSlot;
    }));
  };
  const handleRemoveSlot = (idx: number) => {
    setConsultantSlots(slots => slots.filter((_, i) => i !== idx));
  };

  // Ensure form fields are hydrated after consultantForm is loaded for editing
  useEffect(() => {
    if (consultantEditId && consultantFormLoaded) {
      // Ensure category_ids and subcategory_ids are strings for select value
      setConsultantForm(f => ({
        ...f,
        category_ids: Array.isArray(f.category_ids) ? f.category_ids.map(id => String(id)) : [],
        subcategory_ids: Array.isArray(f.subcategory_ids) ? f.subcategory_ids.map(id => String(id)) : [],
      }));
    }
  }, [consultantEditId, consultantFormLoaded]);

  // Event image change handler
  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServiceForm(prev => ({ ...prev, event_image: file }));
    }
  };

  // Generate Google Meet link
  const generateMeetLink = () => {
    // This is a placeholder and should be replaced with actual implementation
    return `https://meet.google.com/new?authuser=0&hs=177&authuser=0`;
  };

  // View service details
  async function handleServiceProfile(id: number) {
    const token = localStorage.getItem('admin_jwt');
    const res = await fetch(getApiUrl(`api/services/${id}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setServiceProfile(await res.json());
      setShowServiceProfileModal(true);
    }
  }

  // Edit service
  async function handleServiceEdit(s: ServiceType) {
    setServiceEditId(s.id ?? null);
    setServiceForm({ ...s, event_image: null as File | null, appointment_type: '', event_type: '', test_type: '', revenue_type: 'paid', price: '', renewal_date: '', center: '', test_redirect_url: '', consultant_ids: [], category_ids: [], subcategory_ids: [], suggestions: [{ title: '', description: '', redirect_url: '' }], subscription_start: '', subscription_end: '', discount: '', monthly_price: '', yearly_price: '', center_address: '', center_lat: '', center_lng: '', event_start: '', event_end: '', event_meet_link: '' });
  }

  // Delete service
  async function handleServiceDelete(id: number) {
    if (!confirm('Delete this service?')) return;
    const token = localStorage.getItem('admin_jwt');
    const res = await fetch(getApiUrl(`api/services/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchServices();
  }

  // Form submit handler for name and email
  const handleSimpleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage('');
    const data = { name: formName, email: formEmail };

    try {
      const res = await fetch(getApiUrl('submit-form'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setFormMessage('Form submitted successfully!');

    } catch (err) {
      setFormMessage('Error submitting form.');

    } finally {
      setFormLoading(false);
    }
  };

  // Fetch products on mount and after adding
  useEffect(() => {
    if (activeMenu === 'products') fetchProducts();
  }, [activeMenu]);

  // Fetch blogs on mount and after adding
  useEffect(() => {
    if (activeMenu === 'blogs') fetchBlogs();
  }, [activeMenu]);

  // Auto-select first child when ailments is expanded
  useEffect(() => {
    if (ailmentsExpanded && activeMenu !== 'categories' && activeMenu !== 'subcategories') {
      setActiveMenu('categories');
    }
  }, [ailmentsExpanded]);

  // Auto-expand ailments when categories or subcategories are active
  useEffect(() => {
    if (activeMenu === 'categories' || activeMenu === 'subcategories') {
      setAilmentsExpanded(true);
    }
  }, [activeMenu]);

  // Table utility functions
  const filterAndSortData = (data: any[], searchTerm: string, sortField: string, sortDirection: 'asc' | 'desc') => {
    let filteredData = data;

    // Filter by search term
    if (searchTerm) {
      filteredData = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort data
    if (sortField) {
      filteredData.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  };

  const paginateData = (data: any[], currentPage: number, itemsPerPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Blog CRUD
  async function fetchBlogs() {
    try {
      const res = await fetch(getApiUrl('api/blogs'));
      if (res.ok) {
        const data = await res.json();

        const blogsArray = data.blogs || data;
        setBlogs(blogsArray);
      } else {

        setBlogs([]);
      }
    } catch (error) {

      setBlogs([]);
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(blogForm),
      });

      if (res.ok) {
        setBlogForm({ title: '', description: '', category: 'Therapy', thumbnail: '', author: '', status: 'active' });
        setBlogEditId(null);
        setShowBlogModal(false);
        fetchBlogs();
        addNotification({
          type: 'success',
          title: 'Success',
          message: blogEditId ? 'Blog updated successfully!' : 'Blog added successfully!'
        });
      } else {
        const errorData = await res.text();
        addNotification({
          type: 'error',
          title: 'Error',
          message: `Failed to save blog: ${res.status} ${errorData}`
        });
      }
    } catch (error) {

      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error saving blog. Please try again.'
      });
    }
  }

  async function handleBlogEdit(blog: Blog) {
    setBlogEditId(blog.id ?? null);
    setBlogForm(blog);
    setShowBlogModal(true);
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
        setShowDeleteModal(false);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Blog deleted successfully!'
        });
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {

      alert('Error deleting blog');
    }
  }

  // Gallery CRUD
  async function fetchGallery() {
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl('api/gallery?status=all'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  }

  async function handleGalleryUpload(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (galleryFiles.length === 0) { alert('Please select at least one image'); return; }
    const token = localStorage.getItem("admin_jwt");
    if (!token) {
      alert('Please log in to the admin panel first.');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      galleryFiles.forEach(file => formData.append('images', file));
      formData.append('title', galleryTitle);
      formData.append('description', galleryDescription);
      formData.append('status', 'active');

      const res = await fetch(getApiUrl('api/gallery'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGalleryFiles([]);
        setGalleryTitle('');
        setGalleryDescription('');
        setGalleryPreview([]);
        setShowGalleryModal(false);
        fetchGallery();
        addNotification({ type: 'success', title: 'Success', message: 'Images uploaded successfully!' });
      } else {
        const msg = data.error || data.message || `Upload failed (${res.status})`;
        addNotification({ type: 'error', title: 'Upload failed', message: msg });
        alert(msg);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error uploading images';
      addNotification({ type: 'error', title: 'Upload error', message: msg });
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGalleryUpdate(id: number) {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_jwt");
      const formData = new FormData();
      if (galleryEditForm.title !== undefined) formData.append('title', galleryEditForm.title);
      if (galleryEditForm.description !== undefined) formData.append('description', galleryEditForm.description);
      if (galleryEditForm.status) formData.append('status', galleryEditForm.status);
      if (galleryEditForm.display_order !== undefined) formData.append('display_order', String(galleryEditForm.display_order));

      const res = await fetch(getApiUrl(`api/gallery/${id}`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setGalleryEditId(null);
        setGalleryEditForm({});
        fetchGallery();
        addNotification({ type: 'success', title: 'Success', message: 'Gallery image updated!' });
      } else {
        alert('Failed to update gallery image');
      }
    } catch (error) {
      alert('Error updating gallery image');
    } finally {
      setLoading(false);
    }
  }

  async function handleGalleryDelete(id: number) {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl(`api/gallery/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGallery();
        addNotification({ type: 'success', title: 'Success', message: 'Gallery image deleted!' });
      } else {
        alert('Failed to delete gallery image');
      }
    } catch (error) {
      alert('Error deleting gallery image');
    }
  }

  function getGalleryImageUrl(img: GalleryImage) {
    if (!img.image_path) return '/intro.webp';
    if (img.image_path.startsWith('http')) return img.image_path;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const cleanUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const cleanPath = img.image_path.startsWith('/') ? img.image_path : `/${img.image_path}`;
    return `${cleanUrl}${cleanPath}`;
  }

  // CMS CRUD
  async function fetchCmsContent() {
    try {
      const token = localStorage.getItem("admin_jwt");
      const url = cmsPageFilter === 'all' ? 'api/cms' : `api/cms/${cmsPageFilter}`;
      const res = await fetch(getApiUrl(url), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCmsContent(data.raw || []);
      }
    } catch (error) {
      console.error('Error fetching CMS content:', error);
    }
  }

  async function handleCmsSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!cmsForm.page_key || !cmsForm.section_key || !cmsForm.field_key) {
      alert('Page, Section, and Field Key are required');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl('api/cms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(cmsForm)
      });
      if (res.ok) {
        setCmsForm({ page_key: 'home', section_key: '', field_key: '', field_value: '', field_type: 'text' });
        setCmsEditId(null);
        setShowCmsModal(false);
        fetchCmsContent();
        addNotification({ type: 'success', title: 'Success', message: 'CMS content saved!' });
      } else {
        alert('Failed to save CMS content');
      }
    } catch (error) {
      alert('Error saving CMS content');
    } finally {
      setLoading(false);
    }
  }

  async function handleCmsDelete(id: number) {
    if (!confirm('Are you sure you want to delete this CMS entry?')) return;
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl(`api/cms/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCmsContent();
        addNotification({ type: 'success', title: 'Success', message: 'CMS content deleted!' });
      } else {
        alert('Failed to delete CMS content');
      }
    } catch (error) {
      alert('Error deleting CMS content');
    }
  }

  // Fetch gallery and CMS on menu change
  useEffect(() => {
    if (activeMenu === 'gallery') fetchGallery();
    if (activeMenu === 'cms') fetchCmsContent();
  }, [activeMenu, cmsPageFilter]);

  // Webinar form handlers
  async function handleWebinarSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("admin_jwt");
      const method = webinarEditId ? "PUT" : "POST";
      const url = webinarEditId
        ? getApiUrl(`api/webinars/${webinarEditId}`)
        : getApiUrl("api/webinars");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(webinarForm),
      });

      if (res.ok) {
        setWebinarForm({
          title: '',
          description: '',
          start_time: '',
          end_time: '',
          duration_minutes: 60,
          max_attendees: 100,
          price: 0,
          is_free: true,
          attendee_emails: [],
          meeting_notes: '',
          status: 'scheduled'
        });
        setWebinarEditId(null);
        setShowWebinarModal(false);
        fetchWebinars();
        addNotification({
          type: 'success',
          title: 'Success',
          message: webinarEditId ? 'Webinar updated successfully!' : 'Webinar scheduled successfully!'
        });
      } else {
        const errorData = await res.text();
        alert(`Failed to save webinar: ${res.status} ${errorData}`);
      }
    } catch (error) {

      alert('Error saving webinar. Please try again.');
    }
  }

  async function handleWebinarEdit(webinar: Webinar) {
    setWebinarEditId(webinar.id ?? null);
    setWebinarForm(webinar);
    setShowWebinarModal(true);
  }

  async function handleWebinarDelete(webinarId: number) {
    if (!confirm('Are you sure you want to delete this webinar?')) return;

    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl(`api/webinars/${webinarId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setWebinars(webinars.filter(w => w.id !== webinarId));
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Webinar deleted successfully!'
        });
      } else {
        alert('Failed to delete webinar');
      }
    } catch (error) {

      alert('Error deleting webinar');
    }
  }

  // Consultation form handlers
  async function handleConsultationSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("admin_jwt");
      const method = consultationEditId ? "PUT" : "POST";
      const url = consultationEditId
        ? getApiUrl(`api/admin/consultations/${consultationEditId}`)
        : getApiUrl("api/admin/consultations");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(consultationForm),
      });

      if (res.ok) {
        setConsultationForm({
          consultant_id: 0,
          title: '',
          description: '',
          start_time: '',
          end_time: '',
          duration_minutes: 60,
          meeting_type: 'consultation',
          price: 0,
          attendee_emails: [],
          notes: '',
          status: 'scheduled',
          payment_status: 'pending'
        });
        setConsultationEditId(null);
        setShowConsultationModal(false);
        fetchConsultations();
        alert(consultationEditId ? 'Consultation updated successfully!' : 'Consultation scheduled successfully!');
      } else {
        const errorData = await res.text();
        alert(`Failed to save consultation: ${res.status} ${errorData}`);
      }
    } catch (error) {

      alert('Error saving consultation. Please try again.');
    }
  }

  async function handleConsultationEdit(consultation: Consultation) {
    setConsultationEditId(consultation.id ?? null);
    setConsultationForm(consultation);
    setShowConsultationModal(true);
  }

  async function handleConsultationDelete(consultation: any) {
    const consultationId = consultation.id;
    if (!consultationId) {
      alert('Invalid consultation ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this consultation?')) return;

    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl(`api/admin/consultations/${consultationId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setConsultations(consultations.filter(c => c.id !== consultationId));
        alert('Consultation deleted successfully!');
      } else {
        alert('Failed to delete consultation');
      }
    } catch (error) {

      alert('Error deleting consultation');
    }
  }

  // Google OAuth setup handler
  async function handleGoogleOAuthSetup() {
    try {
      const token = localStorage.getItem("admin_jwt");
      const res = await fetch(getApiUrl("api/auth/admin/google"), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        window.open(data.authUrl, '_blank');
        setGoogleOAuthSetup(true);
        alert('Google OAuth setup initiated. Please complete the authorization in the popup window.');
      } else {
        alert('Failed to initiate Google OAuth setup');
      }
    } catch (error) {

      alert('Error setting up Google OAuth');
    }
  }

  // Reusable Table Component
  const DataTable = ({
    data,
    columns,
    onEdit,
    onDelete,
    onView,
    searchPlaceholder = "Search...",
    title = "Data Table"
  }: {
    data: any[];
    columns: { key: string; label: string; sortable?: boolean; render?: (value: any, row: any) => React.ReactNode }[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onView?: (item: any) => void;
    searchPlaceholder?: string;
    title?: string;
  }) => {
    const filteredData = filterAndSortData(data, searchTerm, sortField, sortDirection);
    const paginatedData = paginateData(filteredData, currentPage, itemsPerPage);
    const totalPages = getTotalPages(filteredData.length, itemsPerPage);

    return (
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h3 style={{
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: 700,
              color: '#667eea',
              margin: 0
            }}>{title}</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px'
                }} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="admin-search-input"
                  style={{
                    backgroundColor: '#2d3748',
                    color: '#ffffff',
                    border: '1px solid #4a5568',
                    borderRadius: '6px',
                    padding: '8px 33px',
                    fontSize: '14px',
                    minWidth: '250px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#1e293b';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4a5568';
                    e.target.style.backgroundColor = '#2d3748';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff'
              }}>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: column.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={column.sortable ? (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)' : undefined}
                    onMouseLeave={column.sortable ? (e) => e.currentTarget.style.background = 'transparent' : undefined}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {column.label}
                      {column.sortable && (
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>
                          {sortField === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'center',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={row.id || index} style={{
                  background: index % 2 === 0 ? '#f8fafc' : '#fff',
                  transition: 'all 0.2s ease'
                }}>
                  {columns.map((column) => (
                    <td key={column.key} style={{
                      padding: '16px 20px',
                      fontSize: '16px',
                      color: '#374151'
                    }}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td style={{
                      padding: '16px 20px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '2px solid rgba(102, 126, 234, 0.3)',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                          >
                            <FaEye size={14} /> View
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '2px solid rgba(102, 126, 234, 0.3)',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                          >
                            <FaEdit size={14} /> Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            style={{
                              background: 'rgba(220, 38, 38, 0.1)',
                              color: '#dc2626',
                              border: '2px solid rgba(220, 38, 38, 0.3)',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'}
                          >
                            <FaTrash size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(102, 126, 234, 0.1)',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  background: currentPage === 1 ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.2)',
                  color: currentPage === 1 ? '#9ca3af' : '#667eea',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    background: currentPage === page ? 'rgba(102, 126, 234, 0.9)' : 'rgba(102, 126, 234, 0.1)',
                    color: currentPage === page ? '#fff' : '#667eea',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => currentPage !== page && (e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)')}
                  onMouseLeave={(e) => currentPage !== page && (e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)')}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  background: currentPage === totalPages ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.2)',
                  color: currentPage === totalPages ? '#9ca3af' : '#667eea',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#667eea',
          fontWeight: '600'
        }}>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', display: 'flex', flexDirection: 'column' }}>
      <style jsx global>{`
        @media (max-width: 768px) {
          .admin-header {
            padding: 0 16px !important;
          }
          .admin-sidebar {
            width: 70px !important;
          }
          .admin-main {
            padding: 24px 16px !important;
          }
          .admin-modal {
            min-width: 95vw !important;
            max-width: 95vw !important;
            padding: 24px !important;
          }
          .admin-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .admin-header {
            height: 60px !important;
          }
          .admin-sidebar {
            width: 60px !important;
          }
          .admin-main {
            padding: 20px 12px !important;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chart-bar {
          transition: all 0.3s ease;
        }

        .chart-bar:hover {
          transform: scaleY(1.1);
        }

        .order-card {
          animation: slideIn 0.5s ease-out;
        }

        /* Dark Mode Form Elements */
        input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], input[type="url"], input[type="search"], input[type="date"], input[type="time"], input[type="datetime-local"], textarea, select {
            background-color: #2d3748 !important;
            color: #ffffff !important;
            border: 1px solid #4a5568 !important;
            border-radius: 6px !important;
            padding: 8px 33px !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
        }

        input:focus, textarea:focus, select:focus {
            border-color: #667eea !important;
            background-color: #1e293b !important;
            outline: none !important;
        }

        /* Special case for search input with icon */
        .admin-search-input {
            padding-left: 40px !important;
        }

        ::placeholder {
            color: #94a3b8 !important;
            opacity: 1;
        }
      `}</style>
      {/* Header */}
      <div style={{
        height: 70,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              marginRight: 8,
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            aria-label="Toggle sidebar"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          <span style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>MIET Admin Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <FaUserCircle size={24} color="#fff" /> Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(220, 38, 38, 0.9)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
      {/* Profile Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(34,37,77,0.32)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setShowProfileModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 4px 32px rgba(90,103,216,0.13)', position: 'relative' }}>
            <button onClick={() => setShowProfileModal(false)} aria-label="Close profile modal" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#5a67d8', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: '#22543d', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Superadmin Profile</h2>
            <div style={{ color: '#5a67d8', fontWeight: 600, marginBottom: 8 }}>Username: admin</div>
            <div style={{ color: '#22543d', fontWeight: 500, marginBottom: 8 }}>Role: Superadmin</div>
            <div style={{ color: '#a0aec0', fontSize: 15 }}>You are logged in as the superadmin.</div>
          </div>
        </div>
      )}
      {/* Main layout: sidebar + content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? 240 : 70,
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
          padding: sidebarOpen ? '32px 0 0 0' : '32px 0 0 0',
          minHeight: 'calc(100vh - 70px)',
          boxShadow: '4px 0 20px rgba(102, 126, 234, 0.15)',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
            padding: '0 16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: 12,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Image src="/miet-main.webp" alt="MieT Logo" width={48} height={48} style={{ borderRadius: 12, background: '#fff' }} priority />
            </div>
            {sidebarOpen && (
              <span style={{
                fontFamily: 'Righteous, cursive',
                fontSize: 24,
                color: '#fff',
                fontWeight: 700,
                marginBottom: 8,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>MieT</span>
            )}
          </div>
          <nav style={{ width: '100%' }}>
            {menu.map((item) => (
              'children' in item && Array.isArray(item.children) ? (
                <div key={item.key} style={{ width: '100%' }}>
                  <button
                    onClick={() => {
                      // Toggle the ailments expansion
                      if (item.key === 'ailments') {
                        setAilmentsExpanded(!ailmentsExpanded);
                        // If expanding and no child is active, set the first child as active
                        if (!ailmentsExpanded && item.children && item.children.length > 0) {
                          setActiveMenu(item.children[0].key as typeof activeMenu);
                        }
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarOpen ? 16 : 0,
                      width: '100%',
                      background: (item.key === 'ailments' && ailmentsExpanded) || item.children.some((c) => c.key === activeMenu) ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: '#fff',
                      border: 'none',
                      borderRadius: sidebarOpen ? '0 12px 12px 0' : '0',
                      padding: sidebarOpen ? '16px 28px' : '16px 0',
                      fontWeight: 600,
                      fontSize: 16,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      transition: 'all 0.2s ease',
                      margin: '4px 0',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    aria-label={item.label}
                    onMouseEnter={(e) => {
                      if (!((item.key === 'ailments' && ailmentsExpanded) || (item.children && item.children.some((c) => c.key === activeMenu)))) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!((item.key === 'ailments' && ailmentsExpanded) || (item.children && item.children.some((c) => c.key === activeMenu)))) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      background: (item.key === 'ailments' && ailmentsExpanded) || item.children.some((c) => c.key === activeMenu) ? 'rgba(102, 126, 234, 0.9)' : 'rgba(102, 126, 234, 0.6)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      {React.cloneElement(item.icon, { color: '#fff' })}
                    </div>
                    {sidebarOpen && <span style={{ marginLeft: 8 }}>{item.label}</span>}
                    {sidebarOpen && (
                      (item.key === 'ailments' && ailmentsExpanded) || item.children.some((c) => c.key === activeMenu)
                        ? <FaChevronDown style={{ marginLeft: 'auto', opacity: 0.8 }} />
                        : <FaChevronRight style={{ marginLeft: 'auto', opacity: 0.6 }} />
                    )}
                  </button>
                  {sidebarOpen && item.children && ((item.key === 'ailments' && ailmentsExpanded) || item.children.some((c) => c.key === activeMenu)) && (
                    <div style={{ marginLeft: 24 }}>
                      {item.children!.map((child) => (
                        <button
                          key={child.key}
                          onClick={() => setActiveMenu(child.key as typeof activeMenu)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            width: '100%',
                            background: activeMenu === child.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0 8px 8px 0',
                            padding: '12px 24px',
                            fontWeight: 500,
                            fontSize: 15,
                            cursor: 'pointer',
                            justifyContent: 'flex-start',
                            transition: 'all 0.2s ease',
                            margin: '2px 0',
                            position: 'relative'
                          }}
                          aria-label={child.label}
                          onMouseEnter={(e) => {
                            if (activeMenu !== child.key) {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (activeMenu !== child.key) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <div style={{
                            background: activeMenu === child.key ? 'rgba(102, 126, 234, 0.8)' : 'rgba(102, 126, 234, 0.4)',
                            borderRadius: '6px',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}>
                            {React.cloneElement(child.icon, { color: '#fff' })}
                          </div>
                          <span style={{ marginLeft: 8 }}>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={item.key}
                  onClick={() => setActiveMenu(item.key as typeof activeMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: sidebarOpen ? 16 : 0,
                    width: '100%',
                    background: activeMenu === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: sidebarOpen ? '0 12px 12px 0' : '0',
                    padding: sidebarOpen ? '16px 28px' : '16px 0',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    transition: 'all 0.2s ease',
                    margin: '4px 0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  aria-label={item.label}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.key) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    background: activeMenu === item.key ? 'rgba(102, 126, 234, 0.9)' : 'rgba(102, 126, 234, 0.6)',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    {React.cloneElement(item.icon, { color: '#fff' })}
                  </div>
                  {sidebarOpen && <span style={{ marginLeft: 8 }}>{item.label}</span>}
                </button>
              )
            ))}
          </nav>
        </aside>
        {/* Main content */}
        <main style={{
          flex: 1,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '32px 24px',
          minHeight: 'calc(100vh - 70px)',
          overflow: 'auto'
        }}>
          {/* Dashboard view with charts/tables */}
          {activeMenu === 'dashboard' && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 700,
                color: '#667eea',
                marginBottom: 24,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Dashboard Overview</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
                marginBottom: 32
              }}>
                {/* Ailments Overview Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                  padding: 32,
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 12 }}>Ailments</div>
                  <div style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{categories.length + subcategories.length}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    {categories.length} Categories • {subcategories.length} Subcategories
                  </div>
                </div>

                {/* Consultants Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(118, 75, 162, 0.2)',
                  padding: 32,
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 12 }}>Consultants</div>
                  <div style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{consultants.length}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    {consultants.filter(c => c.status === 'online').length} Online • {consultants.filter(c => c.status === 'offline').length} Offline
                  </div>
                </div>

                {/* Services Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                  padding: 32,
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 12 }}>Services</div>
                  <div style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{services.length}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    {services.filter(s => s.service_type === 'appointment').length} Appointments • {services.filter(s => s.service_type === 'subscription').length} Subscriptions
                  </div>
                </div>

                {/* Products Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(118, 75, 162, 0.2)',
                  padding: 32,
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 12 }}>Products</div>
                  <div style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{products.length}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    {products.filter(p => p.type === 'Course').length} Courses • {products.filter(p => p.type === 'E-book').length} E-books
                  </div>
                </div>
              </div>

              {/* Real-time Charts Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 24,
                marginBottom: 32
              }}>
                {/* Activity Chart */}
                <div style={{
                  background: '#fff',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
                  padding: 32,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#667eea',
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}>Monthly Activity</h3>
                  <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'space-around',
                    gap: '8px'
                  }}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' });
                      const height = Math.floor(Math.random() * 80) + 20;
                      return (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '24px',
                            height: `${height}px`,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px 12px 0 0',
                            marginBottom: '8px'
                          }} />
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Distribution Chart */}
                <div style={{
                  background: '#fff',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
                  padding: 32,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#667eea',
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}>Category Distribution</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {categories.slice(0, 5).map((cat, index) => {
                      const percentage = Math.floor((cat.id || 1) / categories.length * 100);
                      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
                      return (
                        <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: colors[index % colors.length]
                          }} />
                          <div style={{ flex: 1, fontSize: '14px', color: '#374151' }}>{cat.name}</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Real-time Orders Section */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
                padding: 32,
                border: '1px solid rgba(102, 126, 234, 0.1)',
                marginBottom: 32
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#667eea'
                  }}>Recent Orders</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Live Updates</span>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Sample Orders - Replace with real data */}
                  {[
                    { id: 1, customer: 'John Doe', service: 'Therapy Session', amount: '$150', status: 'completed', time: '2 min ago' },
                    { id: 2, customer: 'Jane Smith', service: 'Consultation', amount: '$80', status: 'pending', time: '5 min ago' },
                    { id: 3, customer: 'Mike Johnson', service: 'Course Purchase', amount: '$299', status: 'processing', time: '8 min ago' },
                    { id: 4, customer: 'Sarah Wilson', service: 'Subscription', amount: '$99/month', status: 'active', time: '12 min ago' }
                  ].map(order => (
                    <div key={order.id} style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{order.customer}</div>
                        <div style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: order.status === 'completed' ? '#d1fae5' :
                            order.status === 'pending' ? '#fef3c7' :
                              order.status === 'processing' ? '#dbeafe' : '#e0e7ff',
                          color: order.status === 'completed' ? '#065f46' :
                            order.status === 'pending' ? '#92400e' :
                              order.status === 'processing' ? '#1e40af' : '#3730a3'
                        }}>
                          {order.status}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{order.service}</div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>{order.amount}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3b8' }}>{order.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Categories CRUD */}
          {activeMenu === 'categories' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Categories</h2>
                <button
                  onClick={() => {
                    setCatEditId(null);
                    setCatName("");
                    setShowCategoryModal(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FaPlus size={16} /> Add Category
                </button>
              </div>

              <DataTable
                data={categories}
                columns={[
                  { key: 'name', label: 'Name', sortable: true },
                  {
                    key: 'created_at',
                    label: 'Created',
                    sortable: true,
                    render: (value) => new Date(value).toLocaleString()
                  }
                ]}
                onEdit={(cat) => {
                  setCatEditId(cat.id);
                  setCatName(cat.name);
                  setShowCategoryModal(true);
                }}
                onDelete={(cat) => handleCatDelete(cat.id)}
                searchPlaceholder="Search categories..."
                title="Categories"
              />
            </section>
          )}
          {/* Subcategories CRUD */}
          {activeMenu === 'subcategories' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Subcategories</h2>
                <button
                  onClick={() => {
                    setSubEditId(null);
                    setSubName("");
                    setSubCatId("");
                    setShowSubcategoryModal(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FaPlus size={16} /> Add Subcategory
                </button>
              </div>

              <DataTable
                data={subcategories}
                columns={[
                  { key: 'name', label: 'Name', sortable: true },
                  {
                    key: 'category_id',
                    label: 'Category',
                    sortable: true,
                    render: (value) => categories.find(c => c.id === value)?.name || "-"
                  },
                  {
                    key: 'created_at',
                    label: 'Created',
                    sortable: true,
                    render: (value) => new Date(value).toLocaleString()
                  }
                ]}
                onEdit={(sub) => {
                  setSubEditId(sub.id);
                  setSubName(sub.name);
                  setSubCatId(sub.category_id);
                  setShowSubcategoryModal(true);
                }}
                onDelete={(sub) => handleSubDelete(sub.id)}
                searchPlaceholder="Search subcategories..."
                title="Subcategories"
              />
            </section>
          )}
          {/* Consultants CRUD */}
          {activeMenu === 'consultants' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Consultants</h2>
                <button
                  onClick={() => {
                    setConsultantEditId(null);
                    setConsultantForm({
                      username: '',
                      password: '',
                      confirmPassword: '',
                      name: '',
                      email: '',
                      phone: '',
                      tagline: '',
                      speciality: '',
                      city: '',
                      address: '',
                      description: '',
                      aadhar: '',
                      bank_account: '',
                      bank_ifsc: '',
                      status: 'offline',
                      featured: false,
                      category_ids: [],
                      subcategory_ids: [],
                      location_lat: '',
                      location_lng: '',
                      image: undefined,
                      id_proof_url: undefined
                    });
                    setConsultantSlots([]);
                    setShowConsultantModal(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FaPlus size={16} /> Add Consultant
                </button>
              </div>

              <DataTable
                data={consultants}
                columns={[
                  {
                    key: 'image',
                    label: 'Image',
                    sortable: false,
                    render: (value, row) => (
                      value ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${value}`}
                          alt={row.name}
                          width={44}
                          height={44}
                          style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          unoptimized
                        />
                      ) : (
                        <span style={{ display: 'inline-block', width: 44, height: 44, borderRadius: 8, background: '#e2e8f0' }} />
                      )
                    )
                  },
                  { key: 'username', label: 'Username', sortable: true },
                  { key: 'name', label: 'Name', sortable: true },
                  { key: 'email', label: 'Email', sortable: true },
                  {
                    key: 'status',
                    label: 'Status',
                    sortable: true,
                    render: (value, row) => (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={value === 'online'}
                          onChange={() => handleToggleConsultantStatus(row)}
                          style={{ width: 32, height: 18 }}
                        />
                        <span style={{ color: value === 'online' ? '#38a169' : '#e53e3e', fontWeight: 600 }}>
                          {value === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </label>
                    )
                  }
                ]}
                onView={(consultant) => {
                  handleConsultantProfile(consultant.id);
                  setShowConsultantProfileModal(true);
                }}
                onEdit={(consultant) => {
                  handleConsultantEdit(consultant);
                  setShowConsultantModal(true);
                }}
                onDelete={(consultant) => showDeleteConsultantModal(consultant.id!, consultant.name)}
                searchPlaceholder="Search consultants..."
                title="Consultants"
              />
            </section>
          )}

          {/* Consultant Modal */}
          {showConsultantModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }} onClick={e => { if (e.target === e.currentTarget) setShowConsultantModal(false); }}>
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: '32px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                width: '100%',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowConsultantModal(false)}
                  aria-label="Close consultant modal"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                >
                  ×
                </button>

                <h2 style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 700,
                  color: '#667eea',
                  marginBottom: '32px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>{consultantEditId ? 'Edit' : 'Add'} Consultant</h2>

                <form id="consultant-form" onSubmit={handleConsultantSubmit} style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '32px',
                  alignItems: 'flex-start'
                }}>
                  {/* Left Column */}
                  <div style={{ flex: '1 1 400px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Username</label>
                        <input
                          name="username"
                          value={consultantForm.username || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Username"
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          readOnly={!!consultantEditId}
                          onFocus={(e) => !consultantEditId && (e.target.style.borderColor = '#667eea')}
                          onBlur={(e) => !consultantEditId && (e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)')}
                        />
                      </div>
                      {!consultantEditId && (
                        <div style={{ flex: '1', minWidth: '200px' }}>
                          <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Password</label>
                          <input
                            name="password"
                            type="password"
                            value={consultantForm.password || ''}
                            onChange={handleConsultantFormChange}
                            placeholder="Password"
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                          />
                        </div>
                      )}
                    </div>

                    {!consultantEditId && (
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                          <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Confirm Password</label>
                          <input
                            name="confirmPassword"
                            type="password"
                            value={consultantForm.confirmPassword || ''}
                            onChange={handleConsultantFormChange}
                            placeholder="Confirm Password"
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Name</label>
                        <input
                          name="name"
                          value={consultantForm.name || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Name"
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Gmail Address *</label>
                        <input
                          name="email"
                          type="email"
                          value={consultantForm.email || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="consultant@gmail.com"
                          required
                          pattern="[a-zA-Z0-9._%+-]+@gmail\.com$"
                          title="Please enter a valid Gmail address"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                        <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          Gmail address is required for Google Meet invitations and calendar integration
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Phone</label>
                        <input
                          name="phone"
                          value={consultantForm.phone || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Phone"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Tagline</label>
                        <input
                          name="tagline"
                          value={consultantForm.tagline || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Tagline"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Speciality</label>
                      <input
                        name="speciality"
                        value={consultantForm.speciality || ''}
                        onChange={handleConsultantFormChange}
                        placeholder="Speciality"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '16px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>City</label>
                        <input
                          name="city"
                          value={consultantForm.city || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="City (e.g., Delhi)"
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Address</label>
                        <input
                          name="address"
                          value={consultantForm.address || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Full Address (e.g., 123 Main St, Delhi, 110001)"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Description</label>
                      <textarea
                        name="description"
                        value={consultantForm.description || ''}
                        onChange={handleConsultantFormChange}
                        placeholder="Description"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          minHeight: '80px',
                          fontSize: '16px',
                          resize: 'vertical',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Aadhar</label>
                        <input
                          name="aadhar"
                          value={consultantForm.aadhar || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Aadhar"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Bank Account</label>
                        <input
                          name="bank_account"
                          value={consultantForm.bank_account || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Bank Account"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Bank IFSC</label>
                        <input
                          name="bank_ifsc"
                          value={consultantForm.bank_ifsc || ''}
                          onChange={handleConsultantFormChange}
                          placeholder="Bank IFSC"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Status</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="status"
                            checked={consultantForm.status === 'online'}
                            onChange={e => setConsultantForm(f => ({ ...f, status: e.target.checked ? 'online' : 'offline' }))}
                            style={{ width: '32px', height: '18px' }}
                          />
                          <span style={{ color: consultantForm.status === 'online' ? '#38a169' : '#e53e3e', fontWeight: 600 }}>
                            {consultantForm.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </label>
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Featured</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="featured"
                            checked={consultantForm.featured || false}
                            onChange={e => setConsultantForm(f => ({ ...f, featured: e.target.checked }))}
                            style={{ width: '32px', height: '18px' }}
                          />
                          <span style={{ color: consultantForm.featured ? '#38a169' : '#e53e3e', fontWeight: 600 }}>
                            {consultantForm.featured ? 'Featured' : 'Not Featured'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Categories</label>
                        <select
                          multiple
                          value={Array.isArray(consultantForm.category_ids) ? consultantForm.category_ids.map(id => String(id)) : []}
                          onChange={e => handleConsultantMultiSelect('category_ids', Array.from(e.target.selectedOptions, opt => Number(opt.value)))}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            minHeight: '80px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Subcategories</label>
                        <select
                          multiple
                          value={Array.isArray(consultantForm.subcategory_ids) ? consultantForm.subcategory_ids.map(id => String(id)) : []}
                          onChange={e => handleConsultantMultiSelect('subcategory_ids', Array.from(e.target.selectedOptions, opt => Number(opt.value)))}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            minHeight: '80px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        >
                          {subcategories
                            .filter(s => {
                              if (!Array.isArray(consultantForm.category_ids)) return false;
                              return consultantForm.category_ids.map(Number).includes(Number(s.category_id));
                            })
                            .map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ flex: '1 1 400px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Appointment Calendar Section */}
                    <div>
                      <label style={{ fontWeight: 600, color: '#374151', marginBottom: '12px', display: 'block' }}>Appointment Calendar</label>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>

                        {/* Duration Selector */}
                        <div style={{ marginBottom: '20px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                          <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Slot Duration</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                              { value: 30, label: '30 min' },
                              { value: 45, label: '45 min' },
                              { value: 60, label: '1 hour' },
                              { value: 90, label: '1.5 hours' },
                              { value: 120, label: '2 hours' }
                            ].map(option => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setSlotDuration(option.value)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  border: slotDuration === option.value ? '2px solid #667eea' : '1px solid #ddd',
                                  background: slotDuration === option.value ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                                  color: slotDuration === option.value ? '#fff' : '#374151',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            End time will be auto-calculated based on selected duration
                          </div>
                        </div>

                        {/* Quick Add Slots */}
                        <div style={{ marginBottom: '20px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                          <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Quick Add Slots</label>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div>
                              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Select Date</label>
                              <input
                                type="date"
                                id="quickAddDate"
                                min={new Date().toISOString().split('T')[0]}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(102, 126, 234, 0.2)',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const dateInput = document.getElementById('quickAddDate') as HTMLInputElement;
                                if (dateInput?.value) handleQuickAddSlots(dateInput.value, 'morning');
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #f59e0b',
                                background: '#fef3c7',
                                color: '#92400e',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              🌅 Morning
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const dateInput = document.getElementById('quickAddDate') as HTMLInputElement;
                                if (dateInput?.value) handleQuickAddSlots(dateInput.value, 'afternoon');
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #3b82f6',
                                background: '#dbeafe',
                                color: '#1e40af',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              ☀️ Afternoon
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const dateInput = document.getElementById('quickAddDate') as HTMLInputElement;
                                if (dateInput?.value) handleQuickAddSlots(dateInput.value, 'evening');
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #8b5cf6',
                                background: '#ede9fe',
                                color: '#5b21b6',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              🌙 Evening
                            </button>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            Click a period to add all slots for that time range (6-12 AM, 12-5 PM, 5-9 PM)
                          </div>
                        </div>

                        {/* Existing Slots List */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                            Available Time Slots ({consultantSlots.length})
                          </label>
                          {consultantSlots.length === 0 && <div style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No slots added yet. Use Quick Add or Add Time Slot below.</div>}

                          {/* Group slots by date */}
                          {(() => {
                            const slotsByDate = consultantSlots.reduce((acc, slot, idx) => {
                              if (!acc[slot.date]) acc[slot.date] = [];
                              acc[slot.date].push({ ...slot, idx });
                              return acc;
                            }, {} as { [date: string]: (typeof consultantSlots[0] & { idx: number })[] });

                            return Object.entries(slotsByDate)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([date, slots]) => (
                                <div key={date} style={{ marginBottom: '16px' }}>
                                  <div style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#667eea',
                                    marginBottom: '8px',
                                    padding: '4px 8px',
                                    background: '#f0f4ff',
                                    borderRadius: '4px',
                                    display: 'inline-block'
                                  }}>
                                    {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {slots.map((slot) => (
                                      <div key={slot.idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        background: '#fff',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(102, 126, 234, 0.2)',
                                        fontSize: '13px'
                                      }}>
                                        <span style={{ fontWeight: 500 }}>{slot.time} - {slot.endTime || '?'}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSlot(slot.idx)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#e53e3e',
                                            cursor: 'pointer',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                          })()}

                          {/* Manual Add Slot */}
                          <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: '#fff',
                            borderRadius: '8px',
                            border: '1px dashed rgba(102, 126, 234, 0.3)'
                          }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Add Individual Slot</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Date</label>
                                <input
                                  type="date"
                                  id="manualSlotDate"
                                  min={new Date().toISOString().split('T')[0]}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    fontSize: '13px'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Start Time</label>
                                <input
                                  type="time"
                                  id="manualSlotTime"
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    fontSize: '13px'
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const dateInput = document.getElementById('manualSlotDate') as HTMLInputElement;
                                  const timeInput = document.getElementById('manualSlotTime') as HTMLInputElement;
                                  if (dateInput?.value && timeInput?.value) {
                                    handleAddSlotWithDuration(dateInput.value, timeInput.value);
                                    timeInput.value = '';
                                  }
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '8px 16px',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: 'pointer'
                                }}
                              >
                                Add Slot
                              </button>
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                              End time: auto-calculated ({slotDuration} min duration)
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', color: '#667eea', textAlign: 'center' }}>
                          Slots are organized by date. Past dates cannot be selected.
                        </div>
                      </div>
                    </div>

                    {/* Map Section */}
                    <div>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: 700,
                          fontSize: '14px',
                          marginBottom: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Use My Location
                      </button>
                      <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Location (select on map)</label>
                      <div style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        marginBottom: '12px'
                      }}>
                        {isLoaded && (
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={{
                              lat: consultantForm.location_lat ? parseFloat(consultantForm.location_lat) : defaultMapCenter.lat,
                              lng: consultantForm.location_lng ? parseFloat(consultantForm.location_lng) : defaultMapCenter.lng,
                            }}
                            zoom={consultantForm.location_lat && consultantForm.location_lng ? 13 : 5}
                            onClick={handleMapClick}
                          >
                            {consultantForm.location_lat && consultantForm.location_lng && (
                              <Marker
                                position={{ lat: parseFloat(consultantForm.location_lat), lng: parseFloat(consultantForm.location_lng) }}
                                icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                              />
                            )}
                          </GoogleMap>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#667eea', textAlign: 'center' }}>
                        Lat: {consultantForm.location_lat || '-'}<br />Lng: {consultantForm.location_lng || '-'}
                      </div>
                    </div>

                    {/* File Uploads */}
                    <div>
                      <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Consultant Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'image')}
                        style={{
                          marginBottom: '12px',
                          padding: '8px',
                          border: '1px dashed rgba(102, 126, 234, 0.3)',
                          borderRadius: '8px',
                          width: '100%'
                        }}
                      />
                      {consultantForm.image && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${consultantForm.image}`}
                          alt="Consultant"
                          width={80}
                          height={80}
                          style={{ borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(102, 126, 234, 0.2)' }}
                          unoptimized
                        />
                      )}
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>ID Proof (upload)</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={e => handleFileUpload(e, 'id_proof_url')}
                        style={{
                          marginBottom: '8px',
                          padding: '8px',
                          border: '1px dashed rgba(102, 126, 234, 0.3)',
                          borderRadius: '8px',
                          width: '100%'
                        }}
                      />
                      {consultantForm.id_proof_url && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${consultantForm.id_proof_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#667eea',
                            textDecoration: 'underline',
                            fontSize: '14px',
                            display: 'block',
                            textAlign: 'center'
                          }}
                        >
                          View Uploaded Document
                        </a>
                      )}
                    </div>
                  </div>
                </form>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '32px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={() => handleConsultantSubmit()}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      fontWeight: 700,
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {consultantEditId ? 'Update' : 'Add'} Consultant
                  </button>
                  {consultantEditId && (
                    <button
                      type="button"
                      onClick={handleConsultantFormCancel}
                      style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        fontWeight: 700,
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users CRUD */}
          {activeMenu === 'users' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Users</h2>
                <button
                  onClick={() => {
                    setUserEditId(null);
                    setUserForm({ username: '', password: '', role: 'consultant' });
                    setShowUserModal(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FaPlus size={16} /> Add User
                </button>
              </div>

              <DataTable
                data={users}
                columns={[
                  { key: 'username', label: 'Username', sortable: true },
                  { key: 'role', label: 'Role', sortable: true },
                  {
                    key: 'status',
                    label: 'Status',
                    sortable: true,
                    render: (value, row) => (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={value !== 'inactive'}
                          onChange={() => handleToggleUserStatus(row)}
                          style={{ width: 32, height: 18 }}
                        />
                        <span style={{ color: value !== 'inactive' ? '#38a169' : '#e53e3e', fontWeight: 600 }}>
                          {value !== 'inactive' ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    )
                  },
                  {
                    key: 'created_at',
                    label: 'Created',
                    sortable: true,
                    render: (value) => value ? new Date(value).toLocaleString() : ''
                  }
                ]}
                onEdit={(user) => {
                  setUserEditId(user.id);
                  setUserForm({ id: user.id, username: user.username, role: user.role });
                  setShowUserModal(true);
                }}
                onDelete={(user) => handleUserDelete(user.id)}
                searchPlaceholder="Search users..."
                title="Users"
              />
            </section>
          )}
          {/* Services CRUD */}
          {activeMenu === 'services' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Services</h2>
                <button
                  onClick={() => {
                    setServiceForm({
                      name: '',
                      description: '',
                      delivery_mode: 'online',
                      service_type: 'appointment',
                      appointment_type: '',
                      consultant_ids: [],
                      subscription_start: '',
                      subscription_end: '',
                      discount: '',
                      monthly_price: '',
                      yearly_price: '',
                      center: '',
                      center_address: '',
                      event_start: '',
                      event_end: '',
                      event_image: null,
                      event_meet_link: '',
                      test_type: '',
                      test_redirect_url: '',
                      price: '',
                      category_ids: [],
                      subcategory_ids: [],
                      suggestions: [{ title: '', description: '', redirect_url: '' }],
                      event_type: '',
                      revenue_type: '',
                      renewal_date: '',
                      center_lat: '',
                      center_lng: ''
                    });
                    setServiceEditId(null);
                    setShowServiceModal(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FaPlus size={16} /> Add Service
                </button>
              </div>

              <DataTable
                data={services}
                columns={[
                  { key: 'name', label: 'Name', sortable: true },
                  { key: 'service_type', label: 'Type', sortable: true },
                  { key: 'delivery_mode', label: 'Delivery', sortable: true },
                  {
                    key: 'price',
                    label: 'Price',
                    sortable: true,
                    render: (value) => value ? `$${value}` : '-'
                  },
                  {
                    key: 'created_at',
                    label: 'Created',
                    sortable: true,
                    render: (value) => value ? value.split('T')[0] : '-'
                  }
                ]}
                onView={(service) => {
                  if (service.id !== undefined) {
                    handleServiceProfile(service.id);
                  }
                }}
                onEdit={(service) => {
                  handleServiceEdit(service);
                  setShowServiceModal(true);
                }}
                onDelete={(service) => {
                  if (service.id !== undefined) {
                    handleServiceDelete(service.id);
                  }
                }}
                searchPlaceholder="Search services..."
                title="Services"
              />

              {/* Service Profile Modal */}
              {showServiceProfileModal && serviceProfile && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.35)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 2px 12px #e2e8f0', position: 'relative' }}>
                    <button onClick={() => setShowServiceProfileModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                    <h2 style={{ fontWeight: 700, color: '#22543d', marginBottom: 12 }}>{serviceProfile.name}</h2>
                    <div style={{ marginBottom: 8 }}><b>Type:</b> {serviceProfile.service_type}</div>
                    <div style={{ marginBottom: 8 }}><b>Delivery:</b> {serviceProfile.delivery_mode}</div>
                    <div style={{ marginBottom: 8 }}><b>Description:</b> {serviceProfile.description}</div>
                    <div style={{ marginBottom: 8 }}><b>Price:</b> {serviceProfile.price}</div>
                    <div style={{ marginBottom: 8 }}><b>Revenue Type:</b> {serviceProfile.revenue_type}</div>
                    {serviceProfile.service_type === 'subscription' && (
                      <>
                        <div style={{ marginBottom: 8 }}><b>Subscription Start:</b> {serviceProfile.subscription_start}</div>
                        <div style={{ marginBottom: 8 }}><b>Subscription End:</b> {serviceProfile.subscription_end}</div>
                        <div style={{ marginBottom: 8 }}><b>Discount:</b> {serviceProfile.discount}</div>
                        <div style={{ marginBottom: 8 }}><b>Monthly Price:</b> {serviceProfile.monthly_price}</div>
                        <div style={{ marginBottom: 8 }}><b>Yearly Price:</b> {serviceProfile.yearly_price}</div>
                        <div style={{ marginBottom: 8 }}><b>Center Name:</b> {serviceProfile.center}</div>
                        <div style={{ marginBottom: 8 }}><b>Center Address:</b> {serviceProfile.center_address}</div>
                        <div style={{ marginBottom: 8 }}><b>Center Location:</b> {serviceProfile.center_lat}, {serviceProfile.center_lng}</div>
                      </>
                    )}
                    {serviceProfile.service_type === 'event' && (
                      <>
                        <div style={{ marginBottom: 8 }}><b>Event Type:</b> {serviceProfile.event_type}</div>
                        <div style={{ marginBottom: 8 }}><b>Event Start:</b> {serviceProfile.event_start}</div>
                        <div style={{ marginBottom: 8 }}><b>Event End:</b> {serviceProfile.event_end}</div>
                        <div style={{ marginBottom: 8 }}><b>Event Image:</b> {serviceProfile.event_image && (<img src={serviceProfile.event_image} alt="Event" style={{ maxWidth: 180, maxHeight: 120, display: 'block', marginTop: 6 }} />)}</div>
                        <div style={{ marginBottom: 8 }}><b>Google Meet Link:</b> {serviceProfile.event_meet_link}</div>
                        <div style={{ marginBottom: 8 }}><b>Center Name:</b> {serviceProfile.center}</div>
                        <div style={{ marginBottom: 8 }}><b>Center Address:</b> {serviceProfile.center_address}</div>
                        <div style={{ marginBottom: 8 }}><b>Center Location:</b> {serviceProfile.center_lat}, {serviceProfile.center_lng}</div>
                      </>
                    )}
                    <div style={{ marginBottom: 8 }}><b>Created:</b> {serviceProfile.created_at ? new Date(serviceProfile.created_at).toLocaleString() : ''}</div>
                  </div>
                </div>
              )}

              {/* Service Modal */}
              {showServiceModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowServiceModal(false); }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '32px',
                    width: '100%',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                  }}>
                    <button onClick={() => setShowServiceModal(false)} aria-label="Close service modal" style={{
                      position: 'absolute',
                      top: '16px',
                      right: '20px',
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>×</button>

                    <h2 style={{
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      fontWeight: 700,
                      color: '#667eea',
                      marginBottom: '32px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>{serviceEditId ? 'Edit' : 'Add'} Service</h2>

                    <form onSubmit={handleServiceSubmit} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px'
                    }}>
                      {/* Basic Information */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>Name *</label>
                          <input
                            name="name"
                            value={serviceForm.name}
                            onChange={handleServiceFormChange}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>Delivery Mode</label>
                          <select
                            name="delivery_mode"
                            value={serviceForm.delivery_mode}
                            onChange={handleServiceFormChange}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>Service Type</label>
                          <select
                            name="service_type"
                            value={serviceForm.service_type}
                            onChange={handleServiceFormChange}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          >
                            <option value="appointment">Appointment</option>
                            <option value="subscription">Subscription</option>
                            <option value="event">Event</option>
                            <option value="test">Test</option>
                          </select>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>Price</label>
                          <input
                            name="price"
                            type="number"
                            value={serviceForm.price}
                            onChange={handleServiceFormChange}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>Description</label>
                        <textarea
                          name="description"
                          value={serviceForm.description}
                          onChange={handleServiceFormChange}
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                            resize: 'vertical'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      {/* Service Type Specific Fields */}
                      {serviceForm.service_type === 'appointment' && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '24px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Appointment Type</label>
                            <select
                              name="appointment_type"
                              value={serviceForm.appointment_type}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                              <option value="">Select</option>
                              <option value="consultation">Consultation</option>
                              <option value="therapy">Therapy</option>
                            </select>
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Consultants</label>
                            <select
                              name="consultant_ids"
                              multiple
                              value={serviceForm.consultant_ids?.map(String) || []}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                minHeight: '120px'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                              {consultants.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {serviceForm.service_type === 'subscription' && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '24px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Subscription Start Date</label>
                            <input
                              type="date"
                              name="subscription_start"
                              value={serviceForm.subscription_start || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Subscription End Date</label>
                            <input
                              type="date"
                              name="subscription_end"
                              value={serviceForm.subscription_end || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Discount (%)</label>
                            <input
                              type="number"
                              name="discount"
                              value={serviceForm.discount || ''}
                              onChange={handleServiceFormChange}
                              min={0}
                              max={100}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Monthly Price</label>
                            <input
                              type="number"
                              name="monthly_price"
                              value={serviceForm.monthly_price || ''}
                              onChange={handleServiceFormChange}
                              min={0}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Yearly Price</label>
                            <input
                              type="number"
                              name="yearly_price"
                              value={serviceForm.yearly_price || ''}
                              onChange={handleServiceFormChange}
                              min={0}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Center Name</label>
                            <input
                              type="text"
                              name="center"
                              value={serviceForm.center || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Center Address</label>
                            <input
                              type="text"
                              name="center_address"
                              value={serviceForm.center_address || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>
                        </div>
                      )}

                      {serviceForm.service_type === 'event' && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '24px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Event Start Date & Time</label>
                            <input
                              type="datetime-local"
                              name="event_start"
                              value={serviceForm.event_start || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Event End Date & Time</label>
                            <input
                              type="datetime-local"
                              name="event_end"
                              value={serviceForm.event_end || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Event Image</label>
                            <input
                              type="file"
                              name="event_image"
                              accept="image/*"
                              onChange={handleEventImageChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Center Name</label>
                            <input
                              type="text"
                              name="center"
                              value={serviceForm.center || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Center Address</label>
                            <input
                              type="text"
                              name="center_address"
                              value={serviceForm.center_address || ''}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>

                          {serviceForm.delivery_mode === 'online' && (
                            <div>
                              <label style={{
                                display: 'block',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '8px',
                                fontSize: '14px'
                              }}>Google Meet Link</label>
                              <input
                                type="text"
                                name="event_meet_link"
                                value={generateMeetLink()}
                                readOnly
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '14px',
                                  background: '#f9fafb',
                                  color: '#6b7280'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {serviceForm.service_type === 'test' && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '24px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>Test Type</label>
                            <select
                              name="test_type"
                              value={serviceForm.test_type}
                              onChange={handleServiceFormChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                              <option value="">Select</option>
                              <option value="online">Online</option>
                              <option value="offline">Offline</option>
                            </select>
                          </div>

                          {serviceForm.test_type === 'online' && (
                            <div>
                              <label style={{
                                display: 'block',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '8px',
                                fontSize: '14px'
                              }}>Test Redirect URL</label>
                              <input
                                name="test_redirect_url"
                                value={serviceForm.test_redirect_url || ''}
                                onChange={handleServiceFormChange}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '14px',
                                  transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                              />
                            </div>
                          )}

                          {serviceForm.test_type === 'offline' && (
                            <>
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontWeight: 600,
                                  color: '#374151',
                                  marginBottom: '8px',
                                  fontSize: '14px'
                                }}>Center Name</label>
                                <input
                                  type="text"
                                  name="center"
                                  value={serviceForm.center || ''}
                                  onChange={handleServiceFormChange}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                              </div>

                              <div>
                                <label style={{
                                  display: 'block',
                                  fontWeight: 600,
                                  color: '#374151',
                                  marginBottom: '8px',
                                  fontSize: '14px'
                                }}>Center Address</label>
                                <input
                                  type="text"
                                  name="center_address"
                                  value={serviceForm.center_address || ''}
                                  onChange={handleServiceFormChange}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Categories and Subcategories */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>Categories</label>
                          <select
                            name="category_ids"
                            multiple
                            value={serviceForm.category_ids?.map(String) || []}
                            onChange={handleServiceFormChange}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              transition: 'all 0.2s ease',
                              minHeight: '120px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>Subcategories</label>
                          <select
                            name="subcategory_ids"
                            multiple
                            value={serviceForm.subcategory_ids?.map(String) || []}
                            onChange={handleServiceFormChange}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              transition: 'all 0.2s ease',
                              minHeight: '120px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          >
                            {subcategories
                              .filter(s => Array.isArray(serviceForm.category_ids) ? serviceForm.category_ids.map(Number).includes(Number(s.category_id)) : true)
                              .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Call to Action Suggestions */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '16px',
                          fontSize: '14px'
                        }}>Call to Action Suggestions (max 5)</label>
                        {serviceForm.suggestions.map((s, idx) => (
                          <div key={idx} style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '16px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                              gap: '16px',
                              marginBottom: '16px'
                            }}>
                              <input
                                placeholder="Title"
                                value={s.title}
                                onChange={e => handleSuggestionChange(idx, 'title', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '14px',
                                  transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                              />
                              <input
                                placeholder="Redirect URL"
                                value={s.redirect_url}
                                onChange={e => handleSuggestionChange(idx, 'redirect_url', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '14px',
                                  transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                              />
                            </div>
                            <textarea
                              placeholder="Description"
                              value={s.description}
                              onChange={e => handleSuggestionChange(idx, 'description', e.target.value)}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                resize: 'vertical'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            {serviceForm.suggestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSuggestion(idx)}
                                style={{
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '8px 16px',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  marginTop: '12px',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                              >
                                Remove Suggestion
                              </button>
                            )}
                          </div>
                        ))}
                        {serviceForm.suggestions.length < 5 && (
                          <button
                            type="button"
                            onClick={() => handleAddSuggestion()}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 24px',
                              fontWeight: 600,
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            + Add Suggestion
                          </button>
                        )}
                      </div>
                    </form>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '16px',
                      marginTop: '32px',
                      paddingTop: '24px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleServiceSubmit({} as React.FormEvent<HTMLFormElement>)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px 32px',
                          fontWeight: 700,
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          minWidth: '140px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {serviceEditId ? 'Update' : 'Add'} Service
                      </button>
                      {serviceEditId && (
                        <button
                          type="button"
                          onClick={() => {
                            setServiceForm({
                              name: '',
                              description: '',
                              delivery_mode: 'online',
                              service_type: 'appointment',
                              appointment_type: '',
                              consultant_ids: [],
                              subscription_start: '',
                              subscription_end: '',
                              discount: '',
                              monthly_price: '',
                              yearly_price: '',
                              center: '',
                              center_address: '',
                              event_start: '',
                              event_end: '',
                              event_image: null,
                              event_meet_link: '',
                              test_type: '',
                              test_redirect_url: '',
                              price: '',
                              category_ids: [],
                              subcategory_ids: [],
                              suggestions: [{ title: '', description: '', redirect_url: '' }],
                              event_type: '',
                              revenue_type: '',
                              renewal_date: '',
                              center_lat: '',
                              center_lng: ''
                            });
                            setServiceEditId(null);
                            setShowServiceModal(false);
                          }}
                          style={{
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px 32px',
                            fontWeight: 600,
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '140px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {/* Products CRUD */}
          {activeMenu === 'products' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Products</h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={productForm.type}
                    onChange={e => setProductForm(f => ({ ...f, type: e.target.value as ProductType }))}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      minWidth: '140px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  >
                    <option value="Course">Course</option>
                    <option value="E-book">E-book</option>
                    <option value="App">App</option>
                    <option value="Gadget">Gadget</option>
                  </select>
                  <button
                    onClick={() => {
                      setProductForm({ type: 'Course', status: 'active', featured: false });
                      setProductEditId(null);
                      setShowProductModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 24px',
                      fontWeight: 700,
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <FaPlus size={16} /> Add Product
                  </button>
                </div>
              </div>

              <DataTable
                data={Array.isArray(products) ? products.filter(p =>
                  !productForm.type ||
                  p.type?.toLowerCase() === productForm.type.toLowerCase() ||
                  p.product_type?.toLowerCase() === productForm.type.toLowerCase()
                ) : []}
                columns={[
                  {
                    key: 'thumbnail',
                    label: 'Thumbnail',
                    sortable: false,
                    render: (value, row) => {
                      const imgPath = value || row.product_image || row.icon || row.image_url;
                      if (imgPath) {
                        const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
                        const fullUrl = imgPath.startsWith('http') ? imgPath : `${baseUrl}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`;
                        return (
                          <img
                            src={fullUrl}
                            alt="Thumbnail"
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0'
                            }}
                          />
                        );
                      }
                      return (
                        <div style={{
                          width: 50,
                          height: 50,
                          background: '#f1f5f9',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: 12
                        }}>
                          No Image
                        </div>
                      );
                    }
                  },
                  {
                    key: 'type',
                    label: 'Type',
                    sortable: true,
                    render: (value, row) => row.type || row.product_type || '-'
                  },
                  {
                    key: 'title',
                    label: 'Title/Name',
                    sortable: true,
                    render: (value, row) => row.title || row.name || '-'
                  },
                  {
                    key: 'description',
                    label: 'Description',
                    sortable: true,
                    render: (value, row) => (
                      <div style={{
                        maxWidth: 220,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {value || '-'}
                      </div>
                    )
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    sortable: true,
                    render: (value, row) => (
                      <span style={{
                        color: value === 'active' ? '#38a169' : '#e53e3e',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: value === 'active' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)'
                      }}>
                        {value || '-'}
                      </span>
                    )
                  }
                ]}
                onEdit={(product) => {
                  setProductForm({
                    ...product,
                    type: product.type || product.product_type as ProductType,
                    thumbnailFile: undefined,
                    pdfFile: undefined,
                    iconFile: undefined,
                    productImageFile: undefined
                  });
                  setProductEditId(product.id ?? null);
                  setShowProductModal(true);
                }}
                onDelete={(product) => {
                  setDeleteProductId(product.id ?? null);
                  setDeleteProductName(product.title || product.name || 'this product');
                  setShowDeleteModal(true);
                }}
                searchPlaceholder="Search products..."
                title="Products"
              />
              {/* Product Modal */}
              {showProductModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(34,37,77,0.32)',
                  zIndex: 3000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowProductModal(false); }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: 'clamp(20px, 4vw, 40px)',
                    minWidth: '90vw',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                    position: 'relative',
                    overflow: 'auto',
                    width: '100%'
                  }}>
                    <button
                      onClick={() => setShowProductModal(false)}
                      aria-label="Close product modal"
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: 'none',
                        fontSize: 24,
                        color: '#667eea',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                    >
                      ×
                    </button>
                    <h2 style={{
                      color: '#667eea',
                      fontWeight: 700,
                      marginBottom: 32,
                      fontSize: 'clamp(24px, 4vw, 32px)',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>{productEditId ? 'Edit' : 'Add'} Product</h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const formData = new FormData();
                          // Common fields
                          formData.append('type', productForm.type || 'Course');
                          formData.append('product_type', productForm.type || 'Course'); // Try alternative field name
                          formData.append('status', productForm.status || 'active');
                          formData.append('featured', productForm.featured ? 'true' : 'false');
                          // Dynamic fields by type
                          if (productForm.type === 'Course') {
                            if (!productForm.title?.trim()) {
                              alert('Title is required for Course products');
                              return;
                            }
                            if (!productForm.description?.trim()) {
                              alert('Description is required for Course products');
                              return;
                            }
                            if (!productForm.price?.trim()) {
                              alert('Price is required for Course products');
                              return;
                            }
                            if (!productForm.video_url?.trim()) {
                              alert('Video URL is required for Course products');
                              return;
                            }
                            if (!productForm.thumbnailFile) {
                              alert('Thumbnail is required for Course products');
                              return;
                            }

                            formData.append('title', productForm.title.trim());
                            formData.append('subtitle', productForm.subtitle || '');
                            formData.append('description', productForm.description.trim());
                            formData.append('language', productForm.language || '');
                            formData.append('level', productForm.level || 'Beginner');
                            formData.append('price', productForm.price.trim());
                            formData.append('duration', productForm.duration || '');
                            formData.append('total_lectures', String(productForm.total_lectures || 0));
                            formData.append('rating', String(productForm.rating || 0));
                            formData.append('instructor_name', productForm.instructor_name || '');
                            formData.append('instructor_title', productForm.instructor_title || '');
                            formData.append('instructor_bio', productForm.instructor_bio || '');
                            formData.append('video_url', productForm.video_url.trim());
                            formData.append('thumbnail', productForm.thumbnailFile);
                            if (productForm.instructorImageFile) {
                              formData.append('instructor_image', productForm.instructorImageFile);
                            }
                            formData.append('learningObjectives', JSON.stringify(productForm.learning_objectives || []));
                            formData.append('requirements', JSON.stringify(productForm.requirements || []));
                            formData.append('curriculum', JSON.stringify(productForm.course_content || []));
                          } else if (productForm.type === 'E-book') {
                            formData.append('title', productForm.title || '');
                            formData.append('description', productForm.description || '');
                            formData.append('author', productForm.author || '');
                            if (productForm.pdfFile) formData.append('pdf_file', productForm.pdfFile);
                            if (productForm.thumbnailFile) formData.append('thumbnail', productForm.thumbnailFile);
                          } else if (productForm.type === 'App') {
                            formData.append('name', productForm.name || '');
                            formData.append('description', productForm.description || '');
                            formData.append('download_link', productForm.download_link || '');
                            if (productForm.iconFile) formData.append('icon', productForm.iconFile);
                          } else if (productForm.type === 'Gadget') {
                            formData.append('name', productForm.name || '');
                            formData.append('description', productForm.description || '');
                            formData.append('price', productForm.price || '');
                            if (productForm.productImageFile) formData.append('product_image', productForm.productImageFile);
                            formData.append('purchase_link', productForm.purchase_link || '');
                            formData.append('download_link', productForm.download_link || '');
                            if (productForm.iconFile) formData.append('icon', productForm.iconFile);
                          }
                          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;



                          // Try both FormData and JSON to see which works
                          const url = productEditId
                            ? `${backendUrl}/api/products/${productEditId}`
                            : `${backendUrl}/api/products`;
                          const method = productEditId ? 'PUT' : 'POST';

                          const response = await fetch(url, {
                            method: method,
                            body: formData,
                          });
                          if (!response.ok) {
                            const error = await response.json();

                            alert(error.message || 'Failed to add product');
                            return;
                          }
                          // Show success popup
                          setSuccessMessage(productEditId ? 'Product updated successfully!' : 'Product added successfully!');
                          setShowSuccessPopup(true);
                          // Re-fetch products after successful add
                          const res = await fetch(getApiUrl('api/products'));
                          const data = await res.json();



                          // Extract products array from response
                          const productsArray = data.products || data;

                          setProducts(productsArray);

                          setProductForm({
                            type: 'Course',
                            status: 'active',
                            featured: false,
                            title: '',
                            name: '',
                            description: '',
                            price: '',
                            video_url: '',
                            thumbnail: '',
                            thumbnailFile: undefined,
                            author: '',
                            pdf_file: '',
                            pdfFile: undefined,
                            download_link: '',
                            icon: '',
                            iconFile: undefined,
                            product_image: '',
                            productImageFile: undefined,
                            purchase_link: ''
                          });
                          setProductEditId(null);
                          setShowProductModal(false);
                        } catch (error) {

                          alert('Error: Failed to submit product. Please try again.');
                        }
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        maxWidth: '100%',
                        width: '100%'
                      }}
                    >
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Product Type</label>
                        <select
                          value={productForm.type}
                          onChange={e => setProductForm(f => ({ ...f, type: e.target.value as ProductType }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                          required
                        >
                          <option value="Course">Course</option>
                          <option value="E-book">E-book</option>
                          <option value="App">App</option>
                          <option value="Gadget">Gadget</option>
                        </select>
                      </div>
                      {/* Dynamic fields by type */}
                      {productForm.type === 'Course' && (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          {/* Section: Basic Information */}
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              📝 Basic Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Course Title *</label>
                                <input
                                  type="text"
                                  name="title"
                                  value={productForm.title || ''}
                                  onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))}
                                  required
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px', transition: 'border-color 0.2s', outline: 'none' }}
                                  placeholder="e.g., A Mini Course on Time Management"
                                  onFocus={e => e.target.style.borderColor = '#667eea'}
                                  onBlur={e => e.target.style.borderColor = '#cbd5e0'}
                                />
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Course Subtitle *</label>
                                <input
                                  type="text"
                                  name="subtitle"
                                  value={productForm.subtitle || ''}
                                  onChange={e => setProductForm(f => ({ ...f, subtitle: e.target.value }))}
                                  required
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px', transition: 'border-color 0.2s', outline: 'none' }}
                                  placeholder="e.g., 7 steps you can use immediately to become more productive"
                                  onFocus={e => e.target.style.borderColor = '#667eea'}
                                  onBlur={e => e.target.style.borderColor = '#cbd5e0'}
                                />
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Course Description *</label>
                                <textarea
                                  name="description"
                                  value={productForm.description || ''}
                                  onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                                  required
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', minHeight: '120px', fontSize: '15px', resize: 'vertical', lineHeight: '1.5', outline: 'none', transition: 'border-color 0.2s' }}
                                  placeholder="Detailed description of what the course covers..."
                                  onFocus={e => e.target.style.borderColor = '#667eea'}
                                  onBlur={e => e.target.style.borderColor = '#cbd5e0'}
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Language</label>
                                <input
                                  type="text"
                                  name="language"
                                  value={productForm.language || ''}
                                  onChange={e => setProductForm(f => ({ ...f, language: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., English"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Level</label>
                                <select
                                  name="level"
                                  value={productForm.level || 'Beginner'}
                                  onChange={e => setProductForm(f => ({ ...f, level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px', background: 'white' }}
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Section: Pricing & Statistics */}
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              📊 Pricing & Stats
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Price</label>
                                <input
                                  type="text"
                                  name="price"
                                  value={productForm.price || ''}
                                  onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., Free, $49.99"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Duration</label>
                                <input
                                  type="text"
                                  name="duration"
                                  value={productForm.duration || ''}
                                  onChange={e => setProductForm(f => ({ ...f, duration: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., 37min"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Total Lectures</label>
                                <input
                                  type="number"
                                  name="total_lectures"
                                  value={productForm.total_lectures || ''}
                                  onChange={e => setProductForm(f => ({ ...f, total_lectures: parseInt(e.target.value) || 0 }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., 11"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Rating (0-5)</label>
                                <input
                                  type="number"
                                  name="rating"
                                  step="0.1"
                                  min="0"
                                  max="5"
                                  value={productForm.rating || ''}
                                  onChange={e => setProductForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., 4.4"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Total Ratings Count</label>
                                <input
                                  type="number"
                                  name="total_ratings"
                                  value={productForm.total_ratings || ''}
                                  onChange={e => setProductForm(f => ({ ...f, total_ratings: parseInt(e.target.value) || 0 }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., 1500"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Enrolled Students</label>
                                <input
                                  type="number"
                                  name="enrolled_students"
                                  value={productForm.enrolled_students || ''}
                                  onChange={e => setProductForm(f => ({ ...f, enrolled_students: parseInt(e.target.value) || 0 }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., 5000"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Section: Instructor */}
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              🎓 Instructor Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Instructor Name</label>
                                <input
                                  type="text"
                                  name="instructor_name"
                                  value={productForm.instructor_name || ''}
                                  onChange={e => setProductForm(f => ({ ...f, instructor_name: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., John Doe"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Instructor Title</label>
                                <input
                                  type="text"
                                  name="instructor_title"
                                  value={productForm.instructor_title || ''}
                                  onChange={e => setProductForm(f => ({ ...f, instructor_title: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="e.g., Senior Expert"
                                />
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Instructor Bio</label>
                                <textarea
                                  name="instructor_bio"
                                  value={productForm.instructor_bio || ''}
                                  onChange={e => setProductForm(f => ({ ...f, instructor_bio: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', minHeight: '80px', fontSize: '15px', resize: 'vertical' }}
                                  placeholder="Brief description..."
                                />
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Instructor Image</label>
                                <input
                                  type="file"
                                  name="instructor_image"
                                  accept="image/*"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) setProductForm(f => ({ ...f, instructor_image: URL.createObjectURL(file), instructorImageFile: file }));
                                  }}
                                  style={{ padding: '10px 0' }}
                                />
                                {productForm.instructor_image && (
                                  <div style={{ marginTop: '10px' }}>
                                    <img src={productForm.instructor_image} alt="Instructor" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section: Media */}
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              🖼️ Media & Assets
                            </h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Video URL (Preview)</label>
                                <input
                                  type="text"
                                  name="video_url"
                                  value={productForm.video_url || ''}
                                  onChange={e => setProductForm(f => ({ ...f, video_url: e.target.value }))}
                                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }}
                                  placeholder="URL to preview video"
                                />
                              </div>

                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Course Thumbnail</label>
                                <input
                                  type="file"
                                  name="thumbnail"
                                  accept="image/*"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) setProductForm(f => ({ ...f, thumbnail: URL.createObjectURL(file), thumbnailFile: file }));
                                  }}
                                  style={{ padding: '10px 0' }}
                                />
                                {productForm.thumbnail && (
                                  <div style={{ marginTop: '10px' }}>
                                    <img src={productForm.thumbnail} alt="Thumbnail" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section: Curriculum */}
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              📚 Curriculum
                            </h3>

                            <div style={{ marginBottom: '24px' }}>
                              <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '12px', display: 'block', fontSize: '14px' }}>Learning Objectives *</label>
                              <div style={{ border: '1px solid #cbd5e0', borderRadius: '12px', padding: '16px', backgroundColor: 'white' }}>
                                {(productForm.learning_objectives || ['']).map((objective, index) => (
                                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                                    <span style={{ color: '#cbd5e0', fontWeight: 'bold' }}>•</span>
                                    <input
                                      type="text"
                                      value={objective}
                                      onChange={e => {
                                        const newObjectives = [...(productForm.learning_objectives || [''])];
                                        newObjectives[index] = e.target.value;
                                        setProductForm(f => ({ ...f, learning_objectives: newObjectives }));
                                      }}
                                      placeholder="e.g., Master the 7-step time management system"
                                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newObjectives = (productForm.learning_objectives || ['']).filter((_, i) => i !== index);
                                        setProductForm(f => ({ ...f, learning_objectives: newObjectives }));
                                      }}
                                      style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newObjectives = [...(productForm.learning_objectives || ['']), ''];
                                    setProductForm(f => ({ ...f, learning_objectives: newObjectives }));
                                  }}
                                  style={{ marginTop: '8px', padding: '8px 16px', background: '#ebf8ff', color: '#3182ce', border: '1px dashed #3182ce', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', width: '100%' }}
                                >
                                  + Add Objective
                                </button>
                              </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                              <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '12px', display: 'block', fontSize: '14px' }}>Requirements</label>
                              <div style={{ border: '1px solid #cbd5e0', borderRadius: '12px', padding: '16px', backgroundColor: 'white' }}>
                                {(productForm.requirements || ['']).map((requirement, index) => (
                                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                                    <span style={{ color: '#cbd5e0', fontWeight: 'bold' }}>•</span>
                                    <input
                                      type="text"
                                      value={requirement}
                                      onChange={e => {
                                        const newRequirements = [...(productForm.requirements || [''])];
                                        newRequirements[index] = e.target.value;
                                        setProductForm(f => ({ ...f, requirements: newRequirements }));
                                      }}
                                      placeholder="e.g., A willingness to take action..."
                                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newRequirements = (productForm.requirements || ['']).filter((_, i) => i !== index);
                                        setProductForm(f => ({ ...f, requirements: newRequirements }));
                                      }}
                                      style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newRequirements = [...(productForm.requirements || ['']), ''];
                                    setProductForm(f => ({ ...f, requirements: newRequirements }));
                                  }}
                                  style={{ marginTop: '8px', padding: '8px 16px', background: '#ebf8ff', color: '#3182ce', border: '1px dashed #3182ce', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', width: '100%' }}
                                >
                                  + Add Requirement
                                </button>
                              </div>
                            </div>

                            <div>
                              <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '12px', display: 'block', fontSize: '14px' }}>Course Content Sections</label>
                              <div style={{ border: '1px solid #cbd5e0', borderRadius: '12px', padding: '16px', backgroundColor: 'white', maxHeight: '400px', overflowY: 'auto' }}>
                                {(productForm.course_content || [{ section: '', lectures: 0, duration: '', items: [''] }]).map((section, sectionIndex) => (
                                  <div key={sectionIndex} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px', backgroundColor: '#f9f9f9' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                      <input
                                        type="text"
                                        value={section.section}
                                        onChange={e => {
                                          const newContent = [...(productForm.course_content || [])];
                                          newContent[sectionIndex] = { ...section, section: e.target.value };
                                          setProductForm(f => ({ ...f, course_content: newContent }));
                                        }}
                                        placeholder="Section name (e.g., Introduction)"
                                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600 }}
                                      />
                                      <input
                                        type="number"
                                        value={section.lectures}
                                        onChange={e => {
                                          const newContent = [...(productForm.course_content || [])];
                                          newContent[sectionIndex] = { ...section, lectures: parseInt(e.target.value) || 0 };
                                          setProductForm(f => ({ ...f, course_content: newContent }));
                                        }}
                                        placeholder="Lectures count"
                                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                      />
                                      <input
                                        type="text"
                                        value={section.duration}
                                        onChange={e => {
                                          const newContent = [...(productForm.course_content || [])];
                                          newContent[sectionIndex] = { ...section, duration: e.target.value };
                                          setProductForm(f => ({ ...f, course_content: newContent }));
                                        }}
                                        placeholder="Duration"
                                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                      />
                                    </div>

                                    <div style={{ marginBottom: '12px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                                      <label style={{ fontSize: '12px', color: '#718096', marginBottom: '8px', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Lectures</label>
                                      {section.items.map((item, itemIndex) => (
                                        <div key={itemIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                          <span style={{ fontSize: '12px', color: '#cbd5e0' }}>{itemIndex + 1}.</span>
                                          <input
                                            type="text"
                                            value={item}
                                            onChange={e => {
                                              const newContent = [...(productForm.course_content || [])];
                                              const newItems = [...section.items];
                                              newItems[itemIndex] = e.target.value;
                                              newContent[sectionIndex] = { ...section, items: newItems };
                                              setProductForm(f => ({ ...f, course_content: newContent }));
                                            }}
                                            placeholder="Lecture title"
                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newContent = [...(productForm.course_content || [])];
                                              const newItems = section.items.filter((_, i) => i !== itemIndex);
                                              newContent[sectionIndex] = { ...section, items: newItems };
                                              setProductForm(f => ({ ...f, course_content: newContent }));
                                            }}
                                            style={{ padding: '4px 8px', background: 'none', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                                            title="Remove lecture"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...(productForm.course_content || [])];
                                          const newItems = [...section.items, ''];
                                          newContent[sectionIndex] = { ...section, items: newItems };
                                          setProductForm(f => ({ ...f, course_content: newContent }));
                                        }}
                                        style={{ marginTop: '4px', padding: '6px 10px', background: '#f7fafc', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                      >
                                        + Add Lecture Item
                                      </button>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = (productForm.course_content || []).filter((_, i) => i !== sectionIndex);
                                          setProductForm(f => ({ ...f, course_content: newContent }));
                                        }}
                                        style={{ padding: '6px 12px', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                      >
                                        🗑️ Delete Section
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...(productForm.course_content || []), { section: '', lectures: 0, duration: '', items: [''] }];
                                    setProductForm(f => ({ ...f, course_content: newContent }));
                                  }}
                                  style={{ padding: '10px 16px', background: '#ebf8ff', color: '#2c5282', border: '1px dashed #4299e1', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                  <span style={{ fontSize: '18px' }}>+</span> Add New Section
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {productForm.type === 'E-book' && (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              📝 Basic Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Title</label>
                                <input type="text" value={productForm.title || ''} onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Description</label>
                                <textarea value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', minHeight: '100px', fontSize: '15px', resize: 'vertical' }} />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Author</label>
                                <input type="text" value={productForm.author || ''} onChange={e => setProductForm(f => ({ ...f, author: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              📂 Files & Assets
                            </h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>PDF File</label>
                                <input type="file" accept="application/pdf" onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) setProductForm(f => ({ ...f, pdf_file: file.name, pdfFile: file }));
                                }} style={{ padding: '10px 0' }} />
                                {productForm.pdf_file && <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>📄 {productForm.pdf_file}</div>}
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Thumbnail</label>
                                <input type="file" accept="image/*" onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) setProductForm(f => ({ ...f, thumbnail: URL.createObjectURL(file), thumbnailFile: file }));
                                }} style={{ padding: '10px 0' }} />
                                {productForm.thumbnail && <div style={{ marginTop: '10px' }}><img src={productForm.thumbnail} alt="Thumbnail" style={{ width: 100, height: 140, objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0' }} /></div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {productForm.type === 'App' && (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              📱 App Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>App Name</label>
                                <input type="text" value={productForm.name || ''} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Description</label>
                                <textarea value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', minHeight: '100px', fontSize: '15px', resize: 'vertical' }} />
                              </div>
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              ⬇️ Download & Assets
                            </h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Download Link</label>
                                <input type="text" value={productForm.download_link || ''} onChange={e => setProductForm(f => ({ ...f, download_link: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>App Icon</label>
                                <input type="file" accept="image/*" onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) setProductForm(f => ({ ...f, icon: URL.createObjectURL(file), iconFile: file }));
                                }} style={{ padding: '10px 0' }} />
                                {productForm.icon && <div style={{ marginTop: '10px' }}><img src={productForm.icon} alt="Icon" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '16px', border: '2px solid #e2e8f0' }} /></div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {productForm.type === 'Gadget' && (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              🎧 Gadget Info
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Product Name</label>
                                <input type="text" value={productForm.name || ''} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Description</label>
                                <textarea value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', minHeight: '100px', fontSize: '15px', resize: 'vertical' }} />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Price</label>
                                <input type="number" value={productForm.price || ''} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              🔗 Links & Images
                            </h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Purchase Link</label>
                                <input type="text" value={productForm.purchase_link || ''} onChange={e => setProductForm(f => ({ ...f, purchase_link: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Download Link</label>
                                <input type="text" value={productForm.download_link || ''} onChange={e => setProductForm(f => ({ ...f, download_link: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', fontSize: '15px' }} />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Product Image</label>
                                <input type="file" accept="image/*" onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) setProductForm(f => ({ ...f, product_image: URL.createObjectURL(file), productImageFile: file }));
                                }} style={{ padding: '10px 0' }} />
                                {productForm.product_image && <div style={{ marginTop: '10px' }}><img src={productForm.product_image} alt="Product" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0' }} /></div>}
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#4a5568', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Icon</label>
                                <input type="file" accept="image/*" onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) setProductForm(f => ({ ...f, icon: URL.createObjectURL(file), iconFile: file }));
                                }} style={{ padding: '10px 0' }} />
                                {productForm.icon && <div style={{ marginTop: '10px' }}><img src={productForm.icon} alt="Icon" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '12px', border: '2px solid #e2e8f0' }} /></div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status and Featured Section */}
                      <div style={{
                        gridColumn: '1 / -1',
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                      }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ⚙️ Settings
                        </h3>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{
                              fontWeight: 600,
                              color: '#4a5568',
                              fontSize: '14px',
                              marginBottom: '8px',
                              display: 'block'
                            }}>Status</label>
                            <select
                              value={productForm.status}
                              onChange={e => setProductForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e0',
                                fontSize: '15px',
                                width: '100%',
                                background: '#fff',
                                outline: 'none'
                              }}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            marginTop: '28px'
                          }}>
                            <input
                              type="checkbox"
                              id="featured"
                              checked={productForm.featured || false}
                              onChange={e => setProductForm(f => ({ ...f, featured: e.target.checked }))}
                              style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                accentColor: '#667eea'
                              }}
                            />
                            <label
                              htmlFor="featured"
                              style={{
                                fontWeight: 600,
                                color: productForm.featured ? '#22c55e' : '#4a5568',
                                cursor: 'pointer',
                                fontSize: '15px',
                                margin: 0,
                                userSelect: 'none'
                              }}
                            >
                              {productForm.featured ? 'Featured Product' : 'Set as Featured'}
                            </label>
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px 40px',
                          fontWeight: 700,
                          fontSize: '18px',
                          cursor: 'pointer',
                          marginTop: 24,
                          gridColumn: '1 / -1',
                          justifySelf: 'center',
                          minWidth: '200px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {productEditId ? 'Update' : 'Add'} Product
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}
          {/* Blogs CRUD */}
          {activeMenu === 'blogs' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Blogs</h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={blogForm.category}
                    onChange={e => setBlogForm(f => ({ ...f, category: e.target.value as 'Therapy' | 'Mental Health' | 'Education' | 'Support' | 'Technology' }))}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      minWidth: '140px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  >
                    <option value="Therapy">Therapy</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Education">Education</option>
                    <option value="Support">Support</option>
                    <option value="Technology">Technology</option>
                  </select>
                  <button
                    onClick={() => {
                      setBlogForm({ title: '', description: '', category: 'Therapy', thumbnail: '', author: '', status: 'active' });
                      setBlogEditId(null);
                      setShowBlogModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 24px',
                      fontWeight: 700,
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <FaPlus size={16} /> Add Blog
                  </button>
                </div>
              </div>

              <DataTable
                data={blogs}
                columns={[
                  {
                    key: 'thumbnail',
                    label: 'Thumbnail',
                    sortable: false,
                    render: (value) => (
                      value ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${value}`}
                          alt="Thumbnail"
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 50,
                          height: 50,
                          background: '#f1f5f9',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: 12
                        }}>
                          No Image
                        </div>
                      )
                    )
                  },
                  { key: 'category', label: 'Category', sortable: true },
                  { key: 'title', label: 'Title', sortable: true },
                  { key: 'author', label: 'Author', sortable: true },
                  { key: 'status', label: 'Status', sortable: true },
                  {
                    key: 'created_at',
                    label: 'Created',
                    sortable: true,
                    render: (value) => value ? value.split('T')[0] : '-'
                  }
                ]}
                onView={(blog) => {
                  // Handle blog view if needed
                }}
                onEdit={(blog) => {
                  setBlogForm(blog);
                  setBlogEditId(blog.id ?? null);
                  setShowBlogModal(true);
                }}
                onDelete={(blog) => {
                  setDeleteBlogId(blog.id ?? null);
                  setDeleteBlogName(blog.title || 'this blog');
                  setShowDeleteModal(true);
                }}
                searchPlaceholder="Search blogs..."
                title="Blogs"
              />
              {/* Blog Modal */}
              {showBlogModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(34,37,77,0.32)',
                  zIndex: 3000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowBlogModal(false); }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '40px',
                    minWidth: '90vw',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                    position: 'relative',
                    overflow: 'auto'
                  }}>
                    <button
                      onClick={() => setShowBlogModal(false)}
                      aria-label="Close blog modal"
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: 'none',
                        fontSize: 24,
                        color: '#667eea',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                    >
                      ×
                    </button>
                    <h2 style={{
                      color: '#667eea',
                      fontWeight: 700,
                      marginBottom: 32,
                      fontSize: 'clamp(24px, 4vw, 32px)',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>{blogEditId ? 'Edit' : 'Add'} Blog</h2>
                    <form
                      onSubmit={handleBlogSubmit}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 24,
                        maxWidth: '100%'
                      }}
                    >
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Category</label>
                        <select
                          value={blogForm.category}
                          onChange={e => setBlogForm(f => ({ ...f, category: e.target.value as 'Therapy' | 'Mental Health' | 'Education' | 'Support' | 'Technology' }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                          required
                        >
                          <option value="Therapy">Therapy</option>
                          <option value="Mental Health">Mental Health</option>
                          <option value="Education">Education</option>
                          <option value="Support">Support</option>
                          <option value="Technology">Technology</option>
                        </select>
                      </div>
                      <div>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Title</label>
                        <input
                          type="text"
                          value={blogForm.title || ''}
                          onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))}
                          required
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Description</label>
                        <textarea
                          value={blogForm.description || ''}
                          onChange={e => setBlogForm(f => ({ ...f, description: e.target.value }))}
                          required
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            minHeight: 80,
                            resize: 'vertical'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Author</label>
                        <input
                          type="text"
                          value={blogForm.author || ''}
                          onChange={e => setBlogForm(f => ({ ...f, author: e.target.value }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Thumbnail</label>
                        <input
                          type="text"
                          value={blogForm.thumbnail || ''}
                          onChange={e => setBlogForm(f => ({ ...f, thumbnail: e.target.value }))}
                          placeholder="Enter thumbnail URL"
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                        />
                        {blogForm.thumbnail && (
                          <img
                            src={blogForm.thumbnail}
                            alt="Thumbnail"
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: '12px',
                              marginTop: 8,
                              border: '2px solid rgba(102, 126, 234, 0.2)'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <label style={{
                          fontWeight: 600,
                          color: '#667eea',
                          fontSize: '16px',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Status</label>
                        <select
                          value={blogForm.status}
                          onChange={e => setBlogForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' | 'published' | 'draft' | 'pending' | 'archived' | 'live' | 'scheduled' | 'private' | 'public' | 'review' | 'approved' | 'rejected' | 'trash' | 'deleted' }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            width: '100%',
                            background: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(102, 234, 0.2)'}
                        >
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
                      </div>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px 40px',
                          fontWeight: 700,
                          fontSize: '18px',
                          cursor: 'pointer',
                          marginTop: 24,
                          gridColumn: '1 / -1',
                          justifySelf: 'center',
                          minWidth: '200px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {blogEditId ? 'Update' : 'Add'} Blog
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Webinars CRUD */}
          {activeMenu === 'webinars' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Webinars</h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {!googleOAuthSetup && (
                    <button
                      onClick={handleGoogleOAuthSetup}
                      style={{
                        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🔗 Setup Google OAuth
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setWebinarForm({
                        title: '',
                        description: '',
                        start_time: '',
                        end_time: '',
                        duration_minutes: 60,
                        max_attendees: 100,
                        price: 0,
                        is_free: true,
                        attendee_emails: [],
                        meeting_notes: '',
                        status: 'scheduled'
                      });
                      setWebinarEditId(null);
                      setShowWebinarModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaPlus size={16} />
                    Schedule Webinar
                  </button>
                </div>
              </div>

              <DataTable
                data={webinars}
                columns={[
                  { key: 'title', label: 'Title', sortable: true },
                  { key: 'organizer_email', label: 'Organizer', sortable: true },
                  { key: 'start_time', label: 'Start Time', sortable: true, render: (value) => new Date(value).toLocaleString() },
                  { key: 'duration_minutes', label: 'Duration (min)', sortable: true },
                  { key: 'max_attendees', label: 'Max Attendees', sortable: true },
                  { key: 'price', label: 'Price', sortable: true, render: (value, row) => row.is_free ? 'Free' : `₹${value}` },
                  {
                    key: 'status', label: 'Status', sortable: true, render: (value) => (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: value === 'scheduled' ? '#e3f2fd' : value === 'live' ? '#e8f5e8' : '#ffebee',
                        color: value === 'scheduled' ? '#1976d2' : value === 'live' ? '#388e3c' : '#d32f2f'
                      }}>
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'google_meet_link', label: 'Meet Link', render: (value) => value ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '12px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#e3f2fd',
                        border: '1px solid #667eea',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                      }}>
                        🎥 Join Meeting
                      </a>
                    ) : 'Not available'
                  },
                  {
                    key: 'google_calendar_event_id', label: 'Calendar Event', render: (value, row) => {
                      if (!value) return 'Not added';

                      // Create Google Calendar URL with actual event data
                      const startDate = new Date(row.start_time);
                      const endDate = new Date(row.end_time);
                      const startStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(row.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(row.description || '')}&location=Online&sf=true&output=xml`;

                      return (
                        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" style={{
                          color: '#4caf50',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#e8f5e8',
                          border: '1px solid #4caf50',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease'
                        }}>
                          📅 View in Calendar
                        </a>
                      );
                    }
                  }
                ]}
                onEdit={handleWebinarEdit}
                onDelete={handleWebinarDelete}
              />

              {/* Webinar Modal */}
              {showWebinarModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(34,37,77,0.32)',
                  zIndex: 3000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowWebinarModal(false); }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '40px',
                    minWidth: '90vw',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                    position: 'relative',
                    overflow: 'auto'
                  }}>
                    <button
                      onClick={() => setShowWebinarModal(false)}
                      aria-label="Close webinar modal"
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: 'none',
                        fontSize: 24,
                        color: '#667eea',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ×
                    </button>
                    <h2 style={{
                      fontSize: 'clamp(24px, 4vw, 32px)',
                      fontWeight: 700,
                      color: '#667eea',
                      marginBottom: 32,
                      textAlign: 'center'
                    }}>
                      {webinarEditId ? 'Edit Webinar' : 'Schedule New Webinar'}
                    </h2>
                    <form onSubmit={handleWebinarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Title *</label>
                          <input
                            type="text"
                            value={webinarForm.title}
                            onChange={e => setWebinarForm(f => ({ ...f, title: e.target.value }))}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Start Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={webinarForm.start_time}
                            onChange={e => {
                              const startTime = new Date(e.target.value);
                              const endTime = new Date(webinarForm.end_time);
                              const duration = endTime && endTime > startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 60;
                              setWebinarForm(f => ({
                                ...f,
                                start_time: e.target.value,
                                duration_minutes: duration
                              }));
                            }}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>End Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={webinarForm.end_time}
                            onChange={e => {
                              const startTime = new Date(webinarForm.start_time);
                              const endTime = new Date(e.target.value);
                              const duration = startTime && endTime > startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 60;
                              setWebinarForm(f => ({
                                ...f,
                                end_time: e.target.value,
                                duration_minutes: duration
                              }));
                            }}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Duration (minutes)</label>
                          <input
                            type="number"
                            value={webinarForm.duration_minutes}
                            readOnly
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px',
                              backgroundColor: '#f8f9fa',
                              color: '#6c757d'
                            }}
                          />
                          <small style={{ color: '#6c757d', fontSize: '12px' }}>Automatically calculated from start and end times</small>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Max Attendees</label>
                          <input
                            type="number"
                            value={webinarForm.max_attendees}
                            onChange={e => setWebinarForm(f => ({ ...f, max_attendees: parseInt(e.target.value) }))}
                            min="1"
                            max="1000"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Price (₹)</label>
                          <input
                            type="number"
                            value={webinarForm.price}
                            onChange={e => setWebinarForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                            min="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <input
                            type="checkbox"
                            id="is_free"
                            checked={webinarForm.is_free}
                            onChange={e => setWebinarForm(f => ({ ...f, is_free: e.target.checked }))}
                            style={{ width: 20, height: 20 }}
                          />
                          <label htmlFor="is_free" style={{ fontWeight: 600, color: '#333' }}>Free Webinar</label>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Description</label>
                        <textarea
                          value={webinarForm.description}
                          onChange={e => setWebinarForm(f => ({ ...f, description: e.target.value }))}
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Attendee Emails (comma-separated)</label>
                        <input
                          type="text"
                          value={webinarForm.attendee_emails?.join(', ') || ''}
                          onChange={e => setWebinarForm(f => ({
                            ...f,
                            attendee_emails: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                          }))}
                          placeholder="email1@example.com, email2@example.com"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Meeting Notes</label>
                        <textarea
                          value={webinarForm.meeting_notes}
                          onChange={e => setWebinarForm(f => ({ ...f, meeting_notes: e.target.value }))}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px 32px',
                          fontSize: '18px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {webinarEditId ? 'Update' : 'Schedule'} Webinar
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Consultations CRUD */}
          {activeMenu === 'consultations' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: '#667eea',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Manage Consultations</h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {!googleOAuthSetup && (
                    <button
                      onClick={handleGoogleOAuthSetup}
                      style={{
                        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🔗 Setup Google OAuth
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setConsultationForm({
                        consultant_id: 0,
                        title: '',
                        description: '',
                        start_time: '',
                        end_time: '',
                        duration_minutes: 60,
                        meeting_type: 'consultation',
                        price: 0,
                        attendee_emails: [],
                        notes: '',
                        status: 'scheduled',
                        payment_status: 'pending'
                      });
                      setConsultationEditId(null);
                      setShowConsultationModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaPlus size={16} />
                    Schedule Consultation
                  </button>
                </div>
              </div>

              <DataTable
                data={consultations}
                columns={[
                  { key: 'title', label: 'Title', sortable: true },
                  {
                    key: 'consultant_id', label: 'Consultant', sortable: true, render: (value) => {
                      const consultant = consultants.find(c => c.id === value);
                      return consultant ? consultant.name : 'Unknown';
                    }
                  },
                  {
                    key: 'user_info', label: 'Client Information', sortable: false, render: (value, row) => {
                      // Show user information - either from account or external user
                      if (row.user_name && row.user_email) {
                        // External user
                        return (
                          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                            <div style={{ fontWeight: '600', color: '#333' }}>{row.user_name}</div>
                            <div style={{ color: '#666' }}>{row.user_email}</div>
                            {row.user_phone && <div style={{ color: '#666' }}>{row.user_phone}</div>}
                          </div>
                        );
                      } else if (row.first_name && row.last_name) {
                        // Registered user
                        return (
                          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                            <div style={{ fontWeight: '600', color: '#333' }}>{row.first_name} {row.last_name}</div>
                            <div style={{ color: '#666' }}>{row.user_account_email}</div>
                          </div>
                        );
                      } else {
                        return <span style={{ color: '#999' }}>No information</span>;
                      }
                    }
                  },
                  { key: 'start_time', label: 'Start Time', sortable: true, render: (value) => new Date(value).toLocaleString() },
                  { key: 'duration_minutes', label: 'Duration (min)', sortable: true },
                  { key: 'price', label: 'Price', sortable: true, render: (value) => `₹${value}` },
                  {
                    key: 'status', label: 'Status', sortable: true, render: (value) => (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: value === 'scheduled' ? '#e3f2fd' : value === 'confirmed' ? '#e8f5e8' : value === 'completed' ? '#f3e5f5' : '#ffebee',
                        color: value === 'scheduled' ? '#1976d2' : value === 'confirmed' ? '#388e3c' : value === 'completed' ? '#7b1fa2' : '#d32f2f'
                      }}>
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'payment_status', label: 'Payment', sortable: true, render: (value) => (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: value === 'paid' ? '#e8f5e8' : value === 'pending' ? '#fff3e0' : '#ffebee',
                        color: value === 'paid' ? '#388e3c' : value === 'pending' ? '#f57c00' : '#d32f2f'
                      }}>
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'google_meet_link', label: 'Meet Link', render: (value) => value ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '12px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#e3f2fd',
                        border: '1px solid #667eea',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                      }}>
                        🎥 Join Meeting
                      </a>
                    ) : 'Not available'
                  },
                  {
                    key: 'google_calendar_event_id', label: 'Calendar Event', render: (value, row) => {
                      if (!value) return 'Not added';

                      // Create Google Calendar URL with actual event data
                      const startDate = new Date(row.start_time);
                      const endDate = new Date(row.end_time);
                      const startStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(row.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(row.description || '')}&location=Online&sf=true&output=xml`;

                      return (
                        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" style={{
                          color: '#4caf50',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#e8f5e8',
                          border: '1px solid #4caf50',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease'
                        }}>
                          📅 View in Calendar
                        </a>
                      );
                    }
                  }
                ]}
                onEdit={handleConsultationEdit}
                onDelete={handleConsultationDelete}
              />

              {/* Consultation Modal */}
              {showConsultationModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(34,37,77,0.32)',
                  zIndex: 3000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowConsultationModal(false); }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '40px',
                    minWidth: '90vw',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                    position: 'relative',
                    overflow: 'auto'
                  }}>
                    <button
                      onClick={() => setShowConsultationModal(false)}
                      aria-label="Close consultation modal"
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: 'none',
                        fontSize: 24,
                        color: '#667eea',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ×
                    </button>
                    <h2 style={{
                      fontSize: 'clamp(24px, 4vw, 32px)',
                      fontWeight: 700,
                      color: '#667eea',
                      marginBottom: 32,
                      textAlign: 'center'
                    }}>
                      {consultationEditId ? 'Edit Consultation' : 'Schedule New Consultation'}
                    </h2>
                    <form onSubmit={handleConsultationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Consultant *</label>
                          <select
                            value={consultationForm.consultant_id}
                            onChange={e => setConsultationForm(f => ({ ...f, consultant_id: parseInt(e.target.value) }))}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          >
                            <option value={0}>Select Consultant</option>
                            {consultants.map(consultant => (
                              <option key={consultant.id} value={consultant.id}>
                                {consultant.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Title *</label>
                          <input
                            type="text"
                            value={consultationForm.title}
                            onChange={e => setConsultationForm(f => ({ ...f, title: e.target.value }))}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Start Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={consultationForm.start_time}
                            onChange={e => {
                              const startTime = new Date(e.target.value);
                              const endTime = new Date(consultationForm.end_time);
                              const duration = endTime && endTime > startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 60;
                              setConsultationForm(f => ({
                                ...f,
                                start_time: e.target.value,
                                duration_minutes: duration
                              }));
                            }}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>End Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={consultationForm.end_time}
                            onChange={e => {
                              const startTime = new Date(consultationForm.start_time);
                              const endTime = new Date(e.target.value);
                              const duration = startTime && endTime > startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 60;
                              setConsultationForm(f => ({
                                ...f,
                                end_time: e.target.value,
                                duration_minutes: duration
                              }));
                            }}
                            required
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Duration (minutes)</label>
                          <input
                            type="number"
                            value={consultationForm.duration_minutes}
                            readOnly
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px',
                              backgroundColor: '#f8f9fa',
                              color: '#6c757d'
                            }}
                          />
                          <small style={{ color: '#6c757d', fontSize: '12px' }}>Automatically calculated from start and end times</small>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Price (₹)</label>
                          <input
                            type="number"
                            value={consultationForm.price}
                            onChange={e => setConsultationForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                            min="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Status</label>
                          <select
                            value={consultationForm.status}
                            onChange={e => setConsultationForm(f => ({ ...f, status: e.target.value as any }))}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '16px'
                            }}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                            <option value="no_show">No Show</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Description</label>
                        <textarea
                          value={consultationForm.description}
                          onChange={e => setConsultationForm(f => ({ ...f, description: e.target.value }))}
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Attendee Emails (comma-separated)</label>
                        <input
                          type="text"
                          value={consultationForm.attendee_emails?.join(', ') || ''}
                          onChange={e => setConsultationForm(f => ({
                            ...f,
                            attendee_emails: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                          }))}
                          placeholder="email1@example.com, email2@example.com"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Notes</label>
                        <textarea
                          value={consultationForm.notes}
                          onChange={e => setConsultationForm(f => ({ ...f, notes: e.target.value }))}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '16px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px 32px',
                          fontSize: '18px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {consultationEditId ? 'Update' : 'Schedule'} Consultation
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Gallery Management */}
          {activeMenu === 'gallery' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 32,
                flexWrap: 'wrap',
                gap: 16
              }}>
                <h2 style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Gallery Management</h2>
                <button
                  onClick={() => { setShowGalleryModal(true); setGalleryFiles([]); setGalleryTitle(''); setGalleryDescription(''); setGalleryPreview([]); }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FaPlus /> Upload Images
                </button>
              </div>

              {/* Gallery Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 20
              }}>
                {galleryImages.map((img) => (
                  <div key={img.id} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <img
                        src={getGalleryImageUrl(img)}
                        alt={img.title || 'Gallery image'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/intro.webp'; }}
                      />
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: img.status === 'active' ? '#10b981' : '#ef4444',
                        color: '#fff', padding: '4px 10px', borderRadius: '8px',
                        fontSize: '12px', fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {img.status}
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {galleryEditId === img.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input
                            value={galleryEditForm.title || ''}
                            onChange={(e) => setGalleryEditForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Title"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                          />
                          <input
                            value={galleryEditForm.description || ''}
                            onChange={(e) => setGalleryEditForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Description"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                          />
                          <input
                            type="number"
                            value={galleryEditForm.display_order || 0}
                            onChange={(e) => setGalleryEditForm(f => ({ ...f, display_order: parseInt(e.target.value) }))}
                            placeholder="Display Order"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                          />
                          <select
                            value={galleryEditForm.status || 'active'}
                            onChange={(e) => setGalleryEditForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleGalleryUpdate(img.id!)}
                              style={{
                                flex: 1, background: '#10b981', color: '#fff', border: 'none',
                                borderRadius: '8px', padding: '8px', fontWeight: 600, cursor: 'pointer'
                              }}
                            >Save</button>
                            <button
                              onClick={() => { setGalleryEditId(null); setGalleryEditForm({}); }}
                              style={{
                                flex: 1, background: '#6b7280', color: '#fff', border: 'none',
                                borderRadius: '8px', padding: '8px', fontWeight: 600, cursor: 'pointer'
                              }}
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: 4, fontSize: '15px' }}>
                            {img.title || 'Untitled'}
                          </h4>
                          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: 8, lineHeight: 1.4 }}>
                            {img.description || 'No description'}
                          </p>
                          <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: 12 }}>
                            Order: {img.display_order}
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                setGalleryEditId(img.id!);
                                setGalleryEditForm({ title: img.title, description: img.description, display_order: img.display_order, status: img.status });
                              }}
                              style={{
                                flex: 1, background: 'rgba(102, 126, 234, 0.1)', color: '#667eea',
                                border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 600,
                                cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 4
                              }}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleGalleryDelete(img.id!)}
                              style={{
                                flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 600,
                                cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 4
                              }}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {galleryImages.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '60px 20px', color: '#6b7280'
                }}>
                  <FaImages size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 8 }}>No gallery images yet</h3>
                  <p>Upload images to create your homepage gallery slider.</p>
                </div>
              )}

              {/* Gallery Upload Modal */}
              {showGalleryModal && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                  background: 'rgba(0,0,0,0.5)', zIndex: 3000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowGalleryModal(false); }}>
                  <div style={{
                    background: '#fff', borderRadius: '20px', padding: '40px',
                    width: '90vw', maxWidth: '600px', maxHeight: '90vh',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                    position: 'relative', overflow: 'auto'
                  }}>
                    <button
                      onClick={() => setShowGalleryModal(false)}
                      style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'rgba(102, 126, 234, 0.1)', border: 'none',
                        fontSize: 22, color: '#667eea', cursor: 'pointer',
                        width: '36px', height: '36px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >×</button>
                    <h2 style={{
                      fontWeight: 700, marginBottom: 24, fontSize: '24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                    }}>Upload Gallery Images</h2>
                    <form onSubmit={handleGalleryUpload} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Title (optional)</label>
                        <input
                          value={galleryTitle}
                          onChange={e => setGalleryTitle(e.target.value)}
                          placeholder="Image title"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Description (optional)</label>
                        <textarea
                          value={galleryDescription}
                          onChange={e => setGalleryDescription(e.target.value)}
                          placeholder="Image description"
                          rows={3}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Select Images *</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setGalleryFiles(files);
                            const previews = files.map(f => URL.createObjectURL(f));
                            setGalleryPreview(previews);
                          }}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                        />
                        {galleryPreview.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {galleryPreview.map((p, i) => (
                              <img key={i} src={p} alt={`Preview ${i + 1}`}
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(102, 126, 234, 0.2)' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading || galleryFiles.length === 0}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff', border: 'none', borderRadius: '12px',
                          padding: '14px 28px', fontWeight: 700, fontSize: '16px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {loading ? 'Uploading...' : `Upload ${galleryFiles.length} Image${galleryFiles.length !== 1 ? 's' : ''}`}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* CMS / Page Content Management */}
          {activeMenu === 'cms' && (
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 32,
                flexWrap: 'wrap',
                gap: 16
              }}>
                <h2 style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>CMS - Page Content</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={cmsPageFilter}
                    onChange={e => setCmsPageFilter(e.target.value)}
                    style={{
                      padding: '10px 16px', borderRadius: '10px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '14px', fontWeight: 600, color: '#333'
                    }}
                  >
                    <option value="all">All Pages</option>
                    <option value="home">Home</option>
                    <option value="about">About</option>
                    <option value="contact">Contact</option>
                    <option value="services">Services</option>
                    <option value="courses">Courses</option>
                    <option value="consultants">Consultants</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="events">Events</option>
                    <option value="privacy">Privacy</option>
                    <option value="terms">Terms</option>
                  </select>
                  <button
                    onClick={() => {
                      setCmsForm({ page_key: 'home', section_key: '', field_key: '', field_value: '', field_type: 'text' });
                      setCmsEditId(null);
                      setShowCmsModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      padding: '12px 24px', fontWeight: 700, fontSize: '15px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <FaPlus /> Add Content
                  </button>
                </div>
              </div>

              {/* CMS Content Table */}
              <div style={{
                background: '#fff', borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)' }}>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#1e1b4b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#1e1b4b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Section</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#1e1b4b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Field</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#1e1b4b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#1e1b4b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#1e1b4b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cmsContent.map((item, idx) => (
                        <tr key={item.id || idx} style={{
                          borderBottom: '1px solid rgba(102, 126, 234, 0.08)',
                          transition: 'background 0.2s'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#667eea' }}>{item.page_key}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{item.section_key}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{item.field_key}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#555', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.field_value ? (item.field_value.length > 60 ? item.field_value.substring(0, 60) + '...' : item.field_value) : '-'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: 'rgba(102, 126, 234, 0.1)', color: '#667eea',
                              padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600
                            }}>{item.field_type}</span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setCmsForm({
                                    page_key: item.page_key,
                                    section_key: item.section_key,
                                    field_key: item.field_key,
                                    field_value: item.field_value,
                                    field_type: item.field_type
                                  });
                                  setCmsEditId(item.id || null);
                                  setShowCmsModal(true);
                                }}
                                style={{
                                  background: 'rgba(102, 126, 234, 0.1)', color: '#667eea',
                                  border: 'none', borderRadius: '8px', padding: '6px 12px',
                                  fontWeight: 600, cursor: 'pointer', fontSize: '13px'
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleCmsDelete(item.id!)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                  border: 'none', borderRadius: '8px', padding: '6px 12px',
                                  fontWeight: 600, cursor: 'pointer', fontSize: '13px'
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {cmsContent.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                    <FaCog size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 8 }}>No CMS content yet</h3>
                    <p style={{ fontSize: '14px' }}>Add content entries to manage text and media across your site pages.</p>
                  </div>
                )}
              </div>

              {/* CMS Edit/Add Modal */}
              {showCmsModal && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                  background: 'rgba(0,0,0,0.5)', zIndex: 3000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }} onClick={e => { if (e.target === e.currentTarget) setShowCmsModal(false); }}>
                  <div style={{
                    background: '#fff', borderRadius: '20px', padding: '40px',
                    width: '90vw', maxWidth: '600px', maxHeight: '90vh',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                    position: 'relative', overflow: 'auto'
                  }}>
                    <button
                      onClick={() => setShowCmsModal(false)}
                      style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'rgba(102, 126, 234, 0.1)', border: 'none',
                        fontSize: 22, color: '#667eea', cursor: 'pointer',
                        width: '36px', height: '36px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >×</button>
                    <h2 style={{
                      fontWeight: 700, marginBottom: 24, fontSize: '24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                    }}>{cmsEditId ? 'Edit' : 'Add'} CMS Content</h2>
                    <form onSubmit={handleCmsSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Page *</label>
                        <select
                          value={cmsForm.page_key}
                          onChange={e => setCmsForm(f => ({ ...f, page_key: e.target.value }))}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                        >
                          <option value="home">Home</option>
                          <option value="about">About</option>
                          <option value="contact">Contact</option>
                          <option value="services">Services</option>
                          <option value="courses">Courses</option>
                          <option value="consultants">Consultants</option>
                          <option value="marketplace">Marketplace</option>
                          <option value="events">Events</option>
                          <option value="privacy">Privacy Policy</option>
                          <option value="terms">Terms & Conditions</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Section Key *</label>
                        <input
                          value={cmsForm.section_key}
                          onChange={e => setCmsForm(f => ({ ...f, section_key: e.target.value }))}
                          placeholder="e.g. hero, about, features"
                          required
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Field Key *</label>
                        <input
                          value={cmsForm.field_key}
                          onChange={e => setCmsForm(f => ({ ...f, field_key: e.target.value }))}
                          placeholder="e.g. title, subtitle, description"
                          required
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Field Type</label>
                        <select
                          value={cmsForm.field_type}
                          onChange={e => setCmsForm(f => ({ ...f, field_type: e.target.value as CmsItem['field_type'] }))}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Text Area</option>
                          <option value="html">HTML</option>
                          <option value="image">Image URL</option>
                          <option value="number">Number</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Value</label>
                        {cmsForm.field_type === 'textarea' || cmsForm.field_type === 'html' || cmsForm.field_type === 'json' ? (
                          <textarea
                            value={cmsForm.field_value}
                            onChange={e => setCmsForm(f => ({ ...f, field_value: e.target.value }))}
                            placeholder="Enter content..."
                            rows={6}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px', resize: 'vertical', fontFamily: cmsForm.field_type === 'json' ? 'monospace' : 'inherit' }}
                          />
                        ) : (
                          <input
                            value={cmsForm.field_value}
                            onChange={e => setCmsForm(f => ({ ...f, field_value: e.target.value }))}
                            placeholder="Enter value..."
                            type={cmsForm.field_type === 'number' ? 'number' : 'text'}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.2)', fontSize: '15px' }}
                          />
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff', border: 'none', borderRadius: '12px',
                          padding: '14px 28px', fontWeight: 700, fontSize: '16px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {loading ? 'Saving...' : (cmsEditId ? 'Update Content' : 'Save Content')}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
      {/* Category Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={e => { if (e.target === e.currentTarget) setShowCategoryModal(false); }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            minWidth: '90vw',
            maxWidth: '600px',
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
            position: 'relative',
            overflow: 'auto'
          }}>
            <button
              onClick={() => setShowCategoryModal(false)}
              aria-label="Close category modal"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(102, 126, 234, 0.1)',
                border: 'none',
                fontSize: 24,
                color: '#667eea',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
            >
              ×
            </button>
            <h2 style={{
              color: '#667eea',
              fontWeight: 700,
              marginBottom: 32,
              fontSize: 'clamp(24px, 4vw, 32px)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{catEditId ? 'Edit' : 'Add'} Category</h2>

            <form onSubmit={handleCatSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              <div>
                <label style={{
                  fontWeight: 600,
                  color: '#667eea',
                  fontSize: '16px',
                  marginBottom: '8px',
                  display: 'block'
                }}>Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '16px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                marginTop: 16
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Saving...' : (catEditId ? 'Update' : 'Add')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={e => { if (e.target === e.currentTarget) setShowSubcategoryModal(false); }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            minWidth: '90vw',
            maxWidth: '600px',
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
            position: 'relative',
            overflow: 'auto'
          }}>
            <button
              onClick={() => setShowSubcategoryModal(false)}
              aria-label="Close subcategory modal"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(102, 126, 234, 0.1)',
                border: 'none',
                fontSize: 24,
                color: '#667eea',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
            >
              ×
            </button>
            <h2 style={{
              color: '#667eea',
              fontWeight: 700,
              marginBottom: 32,
              fontSize: 'clamp(24px, 4vw, 32px)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{subEditId ? 'Edit' : 'Add'} Subcategory</h2>

            <form onSubmit={handleSubSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              <div>
                <label style={{
                  fontWeight: 600,
                  color: '#667eea',
                  fontSize: '16px',
                  marginBottom: '8px',
                  display: 'block'
                }}>Subcategory Name</label>
                <input
                  type="text"
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  placeholder="Enter subcategory name"
                  required
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '16px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                />
              </div>

              <div>
                <label style={{
                  fontWeight: 600,
                  color: '#667eea',
                  fontSize: '16px',
                  marginBottom: '8px',
                  display: 'block'
                }}>Category</label>
                <select
                  value={subCatId}
                  onChange={e => setSubCatId(Number(e.target.value))}
                  required
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '16px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    background: '#fff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                marginTop: 16
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Saving...' : (subEditId ? 'Update' : 'Add')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubcategoryModal(false)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={e => { if (e.target === e.currentTarget) setShowUserModal(false); }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            minWidth: '90vw',
            maxWidth: '600px',
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
            position: 'relative',
            overflow: 'auto'
          }}>
            <button
              onClick={() => setShowUserModal(false)}
              aria-label="Close user modal"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(102, 126, 234, 0.1)',
                border: 'none',
                fontSize: 24,
                color: '#667eea',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
            >
              ×
            </button>
            <h2 style={{
              color: '#667eea',
              fontWeight: 700,
              marginBottom: 32,
              fontSize: 'clamp(24px, 4vw, 32px)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{userEditId ? 'Edit' : 'Add'} User</h2>

            <form onSubmit={handleUserSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              <div>
                <label style={{
                  fontWeight: 600,
                  color: '#667eea',
                  fontSize: '16px',
                  marginBottom: '8px',
                  display: 'block'
                }}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserFormChange}
                  placeholder="Enter username"
                  required
                  readOnly={!!userEditId}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '16px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    background: userEditId ? '#f8fafc' : '#fff'
                  }}
                  onFocus={(e) => !userEditId && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !userEditId && (e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)')}
                />
              </div>

              {!userEditId && (
                <div>
                  <label style={{
                    fontWeight: 600,
                    color: '#667eea',
                    fontSize: '16px',
                    marginBottom: '8px',
                    display: 'block'
                  }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={userForm.password || ''}
                    onChange={handleUserFormChange}
                    placeholder="Enter password"
                    required
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '16px',
                      width: '100%',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                  />
                </div>
              )}

              <div>
                <label style={{
                  fontWeight: 600,
                  color: '#667eea',
                  fontSize: '16px',
                  marginBottom: '8px',
                  display: 'block'
                }}>Role</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '16px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    background: '#fff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                >
                  <option value="consultant">Consultant</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                marginTop: 16
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Saving...' : (userEditId ? 'Update' : 'Add')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 5000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                marginLeft: '12px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
            <h3 style={{ color: '#dc2626', marginBottom: '16px', fontSize: '20px' }}>
              Delete {deleteBlogId ? 'Blog' : 'Product'}
            </h3>
            <p style={{ marginBottom: '24px', color: '#374151' }}>
              Are you sure you want to delete <strong>{deleteBlogId ? deleteBlogName : deleteProductName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
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
                onClick={async () => {
                  if (deleteBlogId) {
                    // Handle blog deletion
                    await handleBlogDelete();
                  } else if (deleteProductId) {
                    // Handle product deletion
                    try {
                      // Try backend delete first
                      const response = await fetch(getApiUrl(`api/products/${deleteProductId}`), {
                        method: 'DELETE'
                      });

                      if (response.ok) {
                        // Backend delete successful
                        setProducts(products.filter(p => p.id !== deleteProductId));
                        setSuccessMessage('Product deleted successfully!');
                        setShowSuccessPopup(true);
                      } else {
                        // Backend delete failed, do frontend-only deletion

                        setProducts(products.filter(p => p.id !== deleteProductId));
                        setSuccessMessage('Product removed from view (backend delete not implemented)');
                        setShowSuccessPopup(true);
                      }
                    } catch (error) {
                      // Network error, do frontend-only deletion

                      setProducts(products.filter(p => p.id !== deleteProductId));
                      setSuccessMessage('Product removed from view (backend delete not implemented)');
                      setShowSuccessPopup(true);
                    }
                  }
                  setShowDeleteModal(false);
                }}
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

      {/* Confirm Modal */}
      {/* <ConfirmModal
        open={confirmModal.open}
        title={`Delete ${confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1)}`}
        message={`Are you sure you want to delete ${confirmModal.name || confirmModal.type}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}
      /> */}
    </div>
  );
}
