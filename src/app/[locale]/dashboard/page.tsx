'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleAuth from '@/components/GoogleAuth';
import { useNotifications } from '@/components/NotificationSystem';
import { getApiUrl } from '@/utils/api';
import { FaCalendarAlt, FaVideo, FaUserMd, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaTrash } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface Consultation {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  status: string;
  payment_status: string;
  google_meet_link?: string;
  google_calendar_event_id?: string;
  consultant_name?: string;
  consultant_email?: string;
}

interface Webinar {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  is_free: boolean;
  status: string;
  google_meet_link?: string;
  organizer_email?: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [upcomingWebinars, setUpcomingWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'consultations' | 'webinars'>('overview');
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {

    // Check for token in URL parameters first (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const isGoogleAuth = urlParams.get('google_auth') === 'true';

    if (tokenFromUrl) {


      localStorage.setItem('user_jwt', tokenFromUrl);
      // Store auth type for future reference
      if (isGoogleAuth) {
        localStorage.setItem('auth_type', 'google_oauth');
      } else {
        localStorage.setItem('auth_type', 'jwt');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('user_jwt');
    const authType = localStorage.getItem('auth_type') || 'jwt';


    if (!token) {

      setLoading(false);
      return;
    }

    try {

      // Get user profile
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const userResponse = await fetch(`${getApiUrl('api/auth/profile')}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (userResponse.ok) {
        const responseData = await userResponse.json();

        // Extract user data from the response
        const userData = responseData.user || responseData;

        setUser(userData);

        // Load user's consultations
        await loadConsultations(token);

        // Load upcoming webinars
        await loadUpcomingWebinars();
      } else {

        localStorage.removeItem('user_jwt');
        localStorage.removeItem('auth_type');
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const loadConsultations = async (token: string) => {
    try {

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${getApiUrl('api/consultations/by-email')}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();


        setConsultations(data.appointments || []);
      } else {
        const errorData = await response.json();

      }
    } catch (error) {

    }
  };

  const loadUpcomingWebinars = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${getApiUrl('api/webinars/public')}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        // Filter for upcoming webinars
        const upcoming = (data.webinars || []).filter((webinar: Webinar) =>
          new Date(webinar.start_time) > new Date() && webinar.status === 'scheduled'
        );
        setUpcomingWebinars(upcoming);
      }
    } catch (error) {

    }
  };

  const handleBookConsultation = () => {
    router.push('/services/consultations');
  };

  const handleViewWebinars = () => {
    router.push('/services/webinars');
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

  if (!user) {
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
            Welcome to MIET
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}>
            Please login to access your dashboard and book consultations
          </p>
          <GoogleAuth />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
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
                  Welcome back, {user.first_name}!
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  Manage your consultations and explore upcoming webinars
                </p>
              </div>
              <GoogleAuth />
            </div>
          </div>

          {/* Breadcrumbs Navigation */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px 32px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setActiveSection('overview')}
                style={{
                  background: activeSection === 'overview' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: activeSection === 'overview' ? 'white' : '#666',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaCalendarAlt />
                Overview
              </button>
              <span style={{ color: '#d1d5db', fontSize: '18px' }}>|</span>
              <button
                onClick={() => setActiveSection('consultations')}
                style={{
                  background: activeSection === 'consultations' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: activeSection === 'consultations' ? 'white' : '#666',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaUserMd />
                My Consultations
              </button>
              <span style={{ color: '#d1d5db', fontSize: '18px' }}>|</span>
              <button
                onClick={() => setActiveSection('webinars')}
                style={{
                  background: activeSection === 'webinars' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                  color: activeSection === 'webinars' ? 'white' : '#666',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaVideo />
                Upcoming Webinars
              </button>
            </div>
          </div>

          {/* Content based on active section */}
          {activeSection === 'overview' && (
            <>
              {/* Quick Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    <FaUserMd />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Book Consultation
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '16px'
                  }}>
                    Schedule a one-on-one session with our expert consultants
                  </p>
                  <button
                    onClick={handleBookConsultation}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Book Now
                  </button>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    <FaVideo />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Upcoming Webinars
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '16px'
                  }}>
                    Join our educational webinars and workshops
                  </p>
                  <button
                    onClick={handleViewWebinars}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View Webinars
                  </button>
                </div>
              </div>

              {/* My Consultations Preview */}
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
                  marginBottom: '24px'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    My Consultations
                  </h2>
                  <button
                    onClick={() => setActiveSection('consultations')}
                    style={{
                      background: 'transparent',
                      color: '#667eea',
                      border: '1px solid #667eea',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View All
                  </button>
                </div>

                {consultations.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                  }}>
                    <FaCalendarAlt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px', marginBottom: '16px' }}>No consultations scheduled yet</p>
                    <button
                      onClick={handleBookConsultation}
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
                      Book Your First Consultation
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {consultations.slice(0, 2).map((consultation) => (
                      <div
                        key={consultation.id}
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
                              {consultation.title}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '12px'
                            }}>
                              {consultation.description}
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
                                {new Date(consultation.start_time).toLocaleString()}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaUserMd />
                                {consultation.consultant_name || 'Consultant'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                ₹{consultation.price}
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
                              background: consultation.status === 'scheduled' ? '#e3f2fd' :
                                consultation.status === 'confirmed' ? '#e8f5e8' : '#ffebee',
                              color: consultation.status === 'scheduled' ? '#1976d2' :
                                consultation.status === 'confirmed' ? '#388e3c' : '#d32f2f'
                            }}>
                              {consultation.status}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '16px',
                          flexWrap: 'wrap'
                        }}>
                          {consultation.google_meet_link && (
                            <a
                              href={consultation.google_meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#e3f2fd',
                                color: '#1976d2',
                                textDecoration: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#bbdefb';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#e3f2fd';
                              }}
                            >
                              <FaVideo style={{ fontSize: '14px' }} />
                              Join Meeting
                            </a>
                          )}

                          {consultation.google_calendar_event_id && (
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(consultation.title)}&dates=${new Date(consultation.start_time).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(consultation.end_time).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(consultation.description)}&location=${consultation.google_meet_link || ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#e8f5e8',
                                color: '#388e3c',
                                textDecoration: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#c8e6c9';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#e8f5e8';
                              }}
                            >
                              <FaCalendarAlt style={{ fontSize: '14px' }} />
                              Add to Calendar
                            </a>
                          )}

                          <button
                            onClick={() => {
                              // TODO: Implement edit functionality

                            }}
                            style={{
                              background: '#f3e5f5',
                              color: '#7b1fa2',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#e1bee7';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#f3e5f5';
                            }}
                          >
                            <FaEdit style={{ fontSize: '14px' }} />
                            Edit
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this consultation?')) {
                                try {
                                  const token = localStorage.getItem('user_jwt');
                                  if (!token) {
                                    addNotification({
                                      type: 'error',
                                      title: 'Error',
                                      message: 'Authentication token not found'
                                    });
                                    return;
                                  }

                                  const response = await fetch(`${getApiUrl('api/consultations/by-email')}/${consultation.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });

                                  if (response.ok) {
                                    addNotification({
                                      type: 'success',
                                      title: 'Success',
                                      message: 'Consultation deleted successfully'
                                    });
                                    // Reload consultations
                                    await loadConsultations(token);
                                  } else {
                                    const errorData = await response.json();
                                    addNotification({
                                      type: 'error',
                                      title: 'Error',
                                      message: errorData.message || 'Failed to delete consultation'
                                    });
                                  }
                                } catch (error) {

                                  addNotification({
                                    type: 'error',
                                    title: 'Error',
                                    message: 'Failed to delete consultation'
                                  });
                                }
                              }
                            }}
                            style={{
                              background: '#ffebee',
                              color: '#d32f2f',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#ffcdd2';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#ffebee';
                            }}
                          >
                            <FaTrash style={{ fontSize: '14px' }} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Webinars Preview */}
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
                  marginBottom: '24px'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Upcoming Webinars
                  </h2>
                  <button
                    onClick={() => setActiveSection('webinars')}
                    style={{
                      background: 'transparent',
                      color: '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View All
                  </button>
                </div>

                {upcomingWebinars.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                  }}>
                    <FaVideo style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px' }}>No upcoming webinars at the moment</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {upcomingWebinars.slice(0, 2).map((webinar) => (
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
            </>
          )}

          {/* Consultations Section */}
          {activeSection === 'consultations' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '24px'
              }}>
                My Consultations
              </h2>

              {consultations.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  <FaCalendarAlt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '16px', marginBottom: '16px' }}>No consultations scheduled yet</p>
                  <button
                    onClick={handleBookConsultation}
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
                    Book Your First Consultation
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {consultations.map((consultation) => (
                    <div
                      key={consultation.id}
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
                            {consultation.title}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '12px'
                          }}>
                            {consultation.description}
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
                              {new Date(consultation.start_time).toLocaleString()}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaUserMd />
                              {consultation.consultant_name || 'Consultant'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ₹{consultation.price}
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
                            background: consultation.status === 'scheduled' ? '#e3f2fd' :
                              consultation.status === 'confirmed' ? '#e8f5e8' : '#ffebee',
                            color: consultation.status === 'scheduled' ? '#1976d2' :
                              consultation.status === 'confirmed' ? '#388e3c' : '#d32f2f'
                          }}>
                            {consultation.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px',
                        flexWrap: 'wrap'
                      }}>
                        {consultation.google_meet_link && (
                          <a
                            href={consultation.google_meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              textDecoration: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#bbdefb';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#e3f2fd';
                            }}
                          >
                            <FaVideo style={{ fontSize: '14px' }} />
                            Join Meeting
                          </a>
                        )}

                        {consultation.google_calendar_event_id && (
                          <a
                            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(consultation.title)}&dates=${new Date(consultation.start_time).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(consultation.end_time).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(consultation.description)}&location=${consultation.google_meet_link || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#e8f5e8',
                              color: '#388e3c',
                              textDecoration: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#c8e6c9';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#e8f5e8';
                            }}
                          >
                            <FaCalendarAlt style={{ fontSize: '14px' }} />
                            Add to Calendar
                          </a>
                        )}

                        <button
                          onClick={() => {
                            // TODO: Implement edit functionality

                          }}
                          style={{
                            background: '#f3e5f5',
                            color: '#7b1fa2',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#e1bee7';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#f3e5f5';
                          }}
                        >
                          <FaEdit style={{ fontSize: '14px' }} />
                          Edit
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this consultation?')) {
                              try {
                                const token = localStorage.getItem('user_jwt');
                                if (!token) {
                                  addNotification({
                                    type: 'error',
                                    title: 'Error',
                                    message: 'Authentication token not found'
                                  });
                                  return;
                                }

                                const response = await fetch(`${getApiUrl('api/consultations/by-email')}/${consultation.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });

                                if (response.ok) {
                                  addNotification({
                                    type: 'success',
                                    title: 'Success',
                                    message: 'Consultation deleted successfully'
                                  });
                                  // Reload consultations
                                  await loadConsultations(token);
                                } else {
                                  const errorData = await response.json();
                                  addNotification({
                                    type: 'error',
                                    title: 'Error',
                                    message: errorData.message || 'Failed to delete consultation'
                                  });
                                }
                              } catch (error) {

                                addNotification({
                                  type: 'error',
                                  title: 'Error',
                                  message: 'Failed to delete consultation'
                                });
                              }
                            }
                          }}
                          style={{
                            background: '#ffebee',
                            color: '#d32f2f',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#ffcdd2';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#ffebee';
                          }}
                        >
                          <FaTrash style={{ fontSize: '14px' }} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Webinars Section */}
          {activeSection === 'webinars' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '24px'
              }}>
                Upcoming Webinars
              </h2>

              {upcomingWebinars.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  <FaVideo style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '16px' }}>No upcoming webinars at the moment</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {upcomingWebinars.map((webinar) => (
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
