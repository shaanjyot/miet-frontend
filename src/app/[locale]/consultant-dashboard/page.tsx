'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaVideo, FaUserMd, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers, FaChartLine, FaBell, FaCog, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/utils/api';

interface Consultant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  description?: string;
  tagline?: string;
  speciality?: string;
  city?: string;
  status: string;
  is_pro?: boolean;
  subscription_plan?: string;
  subscription_start?: string;
  subscription_end?: string;
  promoted_by_admin?: boolean;
}

interface Appointment {
  id: number;
  appointment_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  google_meet_link?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  price: number;
  payment_status: string;
  notes?: string;
}

interface Webinar {
  id: number;
  webinar_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_attendees: number;
  current_attendees: number;
  status: string;
  google_meet_link?: string;
  price: number;
  is_free: boolean;
  organizer_email: string;
}

interface Availability {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
}

export default function ConsultantDashboard() {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'webinars' | 'availability' | 'profile' | 'subscription'>('overview');
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    start_time: '',
    end_time: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('consultant_token');
    console.log("Consultant token found:", localStorage.getItem('consultant_token'));

    if (!token) {
      router.push(`/${locale}/consultants/login`);
      return;
    }

    setIsAuthenticated(true);
    checkAuthAndLoadData(token);
  }, [locale]);

  const checkAuthAndLoadData = async (token: string) => {

    try {
      // Load consultant profile
      await loadConsultantProfile(token);
      // Load appointments
      await loadAppointments(token);
      // Load webinars
      await loadWebinars(token);
      // Load availability
      await loadAvailability(token);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const loadConsultantProfile = async (token: string) => {
    try {
      const response = await fetch(`${getApiUrl('api/consultants/profile')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConsultant(data);
      }
    } catch (error) {

    }
  };

  const loadAppointments = async (token: string) => {
    try {
      const response = await fetch(`${getApiUrl('api/consultants/appointments')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {

    }
  };

  const loadWebinars = async (token: string) => {
    try {
      const response = await fetch(`${getApiUrl('api/consultants/webinars')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWebinars(data.webinars || []);
      }
    } catch (error) {

    }
  };

  const loadAvailability = async (token: string) => {
    try {
      const response = await fetch(`${getApiUrl('api/consultants/availability')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability || []);
      }
    } catch (error) {

    }
  };

  const handleAddAvailability = async () => {
    if (!newAvailability.date || !newAvailability.start_time || !newAvailability.end_time) {
      alert('Please fill in all availability fields');
      return;
    }

    try {
      const token = localStorage.getItem('consultant_token');
      const response = await fetch(`${getApiUrl('api/consultants/availability')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAvailability)
      });

      if (response.ok) {
        setNewAvailability({ date: '', start_time: '', end_time: '' });
        setShowAddAvailability(false);
        await loadAvailability(token!);
      } else {
        alert('Failed to add availability');
      }
    } catch (error) {

      alert('Error adding availability');
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      const token = localStorage.getItem('consultant_token');
      const response = await fetch(`${getApiUrl(`api/consultants/availability/${id}`)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadAvailability(token!);
      } else {
        alert('Failed to delete availability');
      }
    } catch (error) {

      alert('Error deleting availability');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('consultant_token');
    localStorage.removeItem('consultant_user');
    router.push(`/${locale}/consultants/login`);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          fontSize: '18px',
          color: 'white',
          fontWeight: '600'
        }}>
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!consultant) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '16px'
          }}>
            Access Denied
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}>
            You need to be logged in as a consultant to access this dashboard
          </p>
          <button
            onClick={() => router.push(`/${locale}/consultants/login`)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.start_time) > new Date() && apt.status === 'scheduled'
  );

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Welcome, {consultant.name}!
                  {consultant.is_pro && (
                    <span style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      marginLeft: '12px',
                      verticalAlign: 'middle'
                    }}>
                      ⭐ PRO
                    </span>
                  )}
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  Manage your appointments, webinars, and availability
                  {consultant.is_pro && consultant.subscription_plan && (
                    <span style={{ color: '#d97706', fontWeight: '600' }}>
                      {' '}| {consultant.subscription_plan.charAt(0).toUpperCase() + consultant.subscription_plan.slice(1)} Plan
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
                { id: 'webinars', label: 'Webinars', icon: FaVideo },
                { id: 'availability', label: 'Availability', icon: FaClock },
                { id: 'subscription', label: consultant?.is_pro ? '⭐ Pro' : 'Subscription', icon: FaCog },
                { id: 'profile', label: 'Profile', icon: FaUserMd }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  style={{
                    background: activeTab === id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: activeTab === id ? 'white' : '#667eea',
                    border: `2px solid ${activeTab === id ? 'transparent' : '#667eea'}`,
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            {activeTab === 'overview' && (
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '24px'
                }}>
                  Dashboard Overview
                </h2>

                {/* Stats Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <FaCalendarAlt style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                      {upcomingAppointments.length}
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>
                      Upcoming Appointments
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <FaVideo style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                      {webinars.length}
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>
                      Total Webinars
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <FaClock style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                      {todayAppointments.length}
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>
                      Today's Appointments
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <FaUsers style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                      {availability.length}
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>
                      Available Slots
                    </p>
                  </div>
                </div>

                {/* Recent Appointments */}
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px'
                  }}>
                    Recent Appointments
                  </h3>
                  {appointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {appointment.title}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          {new Date(appointment.start_time).toLocaleString()}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {appointment.user_name || 'Client'}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: appointment.status === 'scheduled' ? '#e3f2fd' : '#e8f5e8',
                          color: appointment.status === 'scheduled' ? '#1976d2' : '#388e3c'
                        }}>
                          {appointment.status}
                        </span>
                        {appointment.google_meet_link && (
                          <a
                            href={appointment.google_meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              textDecoration: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '24px'
                }}>
                  My Appointments
                </h2>

                {appointments.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                  }}>
                    <FaCalendarAlt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px' }}>No appointments scheduled yet</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '20px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '16px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#333',
                              marginBottom: '8px'
                            }}>
                              {appointment.title}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '12px'
                            }}>
                              {appointment.description}
                            </p>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '16px',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaClock />
                                {new Date(appointment.start_time).toLocaleString()}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaUserMd />
                                {appointment.user_name || 'Client'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                ₹{appointment.price}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-end'
                          }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: appointment.status === 'scheduled' ? '#e3f2fd' :
                                appointment.status === 'confirmed' ? '#e8f5e8' : '#ffebee',
                              color: appointment.status === 'scheduled' ? '#1976d2' :
                                appointment.status === 'confirmed' ? '#388e3c' : '#d32f2f'
                            }}>
                              {appointment.status}
                            </span>
                            {appointment.google_meet_link && (
                              <a
                                href={appointment.google_meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  textDecoration: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                🎥 Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'webinars' && (
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '24px'
                }}>
                  My Webinars
                </h2>

                {webinars.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                  }}>
                    <FaVideo style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px' }}>No webinars created yet</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {webinars.map((webinar) => (
                      <div
                        key={webinar.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '20px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '16px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#333',
                              marginBottom: '8px'
                            }}>
                              {webinar.title}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '12px'
                            }}>
                              {webinar.description}
                            </p>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '16px',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaClock />
                                {new Date(webinar.start_time).toLocaleString()}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaUsers />
                                {webinar.current_attendees}/{webinar.max_attendees} attendees
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {webinar.is_free ? 'Free' : `₹${webinar.price}`}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-end'
                          }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: '#e8f5e8',
                              color: '#388e3c'
                            }}>
                              {webinar.status}
                            </span>
                            {webinar.google_meet_link && (
                              <a
                                href={webinar.google_meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  textDecoration: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                🎥 Join Webinar
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    My Availability
                  </h2>
                  <button
                    onClick={() => setShowAddAvailability(true)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaPlus />
                    Add Availability
                  </button>
                </div>

                {/* Add Availability Modal */}
                {showAddAvailability && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '32px',
                      maxWidth: '500px',
                      width: '90%',
                      maxHeight: '90vh',
                      overflow: 'auto'
                    }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '24px'
                      }}>
                        Add Availability
                      </h3>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Date
                        </label>
                        <input
                          type="date"
                          value={newAvailability.date}
                          onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '16px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={newAvailability.start_time}
                          onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '16px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{
                          display: 'block',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          End Time
                        </label>
                        <input
                          type="time"
                          value={newAvailability.end_time}
                          onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '16px'
                          }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          onClick={() => setShowAddAvailability(false)}
                          style={{
                            background: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAvailability}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Add Availability
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {availability.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                  }}>
                    <FaClock style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px' }}>No availability slots added yet</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {availability.map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: '4px'
                          }}>
                            {new Date(slot.date).toLocaleDateString()}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: '#666'
                          }}>
                            {slot.start_time} - {slot.end_time}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAvailability(slot.id)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '24px' }}>
                  {consultant.is_pro ? '⭐ Your Pro Subscription' : 'Upgrade to Pro'}
                </h2>

                {consultant.is_pro ? (
                  <div>
                    <div style={{
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      borderRadius: '16px',
                      padding: '32px',
                      marginBottom: '24px',
                      border: '2px solid #f59e0b'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '48px' }}>⭐</span>
                        <div>
                          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#92400e', margin: '0 0 4px 0' }}>
                            Pro {consultant.subscription_plan ? consultant.subscription_plan.charAt(0).toUpperCase() + consultant.subscription_plan.slice(1) : ''} Plan
                          </h3>
                          <p style={{ color: '#a16207', margin: 0, fontSize: '14px' }}>
                            {consultant.promoted_by_admin ? 'Promoted by Admin' : 'Active Subscription'}
                          </p>
                        </div>
                      </div>
                      {consultant.subscription_end && (
                        <p style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>
                          Valid until: {new Date(consultant.subscription_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Pro Benefits</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      {['Priority listing in search results', 'Featured badge on your profile', 'Advanced analytics dashboard', 'Priority booking slots', 'Dedicated support channel', 'Marketing & promotion'].map((benefit, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                          background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb'
                        }}>
                          <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                          <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
                      Upgrade to a Pro plan to get featured placement, priority bookings, and advanced tools to grow your practice.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      {[
                        { key: 'basic', name: 'Basic', monthly: 999, yearly: 9999, features: ['Priority listing', 'Pro badge', 'Email support', '2 featured slots/month'] },
                        { key: 'standard', name: 'Standard', monthly: 1799, yearly: 17999, features: ['All Basic features', 'Analytics dashboard', 'Priority bookings', 'Chat support', '5 featured slots/month'] },
                        { key: 'premium', name: 'Premium', monthly: 2999, yearly: 29999, features: ['All Standard features', 'Dedicated support', 'Marketing promotion', 'Phone & chat support', 'Unlimited featured slots'] }
                      ].map(plan => (
                        <div key={plan.key} style={{
                          border: plan.key === 'standard' ? '2px solid #667eea' : '1px solid #e5e7eb',
                          borderRadius: '16px', padding: '32px', textAlign: 'center', position: 'relative',
                          background: plan.key === 'standard' ? 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)' : 'white'
                        }}>
                          {plan.key === 'standard' && (
                            <div style={{
                              position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
                              padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'
                            }}>MOST POPULAR</div>
                          )}
                          <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{plan.name}</h3>
                          <div style={{ fontSize: '36px', fontWeight: '800', color: '#667eea', marginBottom: '4px' }}>
                            ₹{plan.monthly}<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
                            or ₹{plan.yearly}/year (save {Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100)}%)
                          </p>
                          <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                            {plan.features.map((f, i) => (
                              <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#10b981' }}>✓</span> {f}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('consultant_token');
                                const response = await fetch(getApiUrl('api/consultants/subscribe'), {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({ plan: plan.key, billing_cycle: 'monthly' })
                                });
                                if (response.ok) {
                                  alert(`Successfully subscribed to ${plan.name} plan!`);
                                  window.location.reload();
                                } else {
                                  const data = await response.json();
                                  alert(data.error || 'Subscription failed');
                                }
                              } catch (err) {
                                alert('Error subscribing. Please try again.');
                              }
                            }}
                            style={{
                              width: '100%',
                              background: plan.key === 'standard' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                              color: plan.key === 'standard' ? 'white' : '#667eea',
                              border: plan.key === 'standard' ? 'none' : '2px solid #667eea',
                              borderRadius: '12px', padding: '14px 0', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Subscribe
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '24px'
                }}>
                  My Profile
                </h2>

                <div style={{
                  display: 'grid',
                  gap: '24px',
                  maxWidth: '600px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={consultant.name}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        background: '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={consultant.email}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        background: '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={consultant.phone || ''}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        background: '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Speciality
                    </label>
                    <input
                      type="text"
                      value={consultant.speciality || ''}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        background: '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={consultant.city || ''}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        background: '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Description
                    </label>
                    <textarea
                      value={consultant.description || ''}
                      readOnly
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        background: '#f9fafb',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
