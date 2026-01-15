'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api';
import { FaVideo, FaClock, FaUser, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

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
  max_attendees?: number;
}

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    loadWebinars();
  }, []);

  const loadWebinars = async () => {
    try {
      const response = await fetch(`${getApiUrl('api/webinars/public')}`);
      if (response.ok) {
        const data = await response.json();
        setWebinars(data.webinars || []);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const filteredWebinars = webinars.filter(webinar => {
    if (filter === 'free') return webinar.is_free;
    if (filter === 'paid') return !webinar.is_free;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilEvent = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = eventDate.getTime() - now.getTime();

    if (diffMs < 0) return 'Past event';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} away`;
    return 'Starting soon';
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
          Loading Webinars...
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Upcoming Webinars
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Join our educational webinars and workshops to learn from expert consultants and mental health professionals
          </p>
        </div>

        {/* Filter Tabs */}
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
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'All Webinars', count: webinars.length },
              { key: 'free', label: 'Free Webinars', count: webinars.filter(w => w.is_free).length },
              { key: 'paid', label: 'Paid Webinars', count: webinars.filter(w => !w.is_free).length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                style={{
                  background: filter === key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: filter === key ? 'white' : '#667eea',
                  border: `2px solid ${filter === key ? 'transparent' : '#667eea'}`,
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {label}
                <span style={{
                  background: filter === key ? 'rgba(255,255,255,0.2)' : '#667eea',
                  color: filter === key ? 'white' : 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Webinars Grid */}
        {filteredWebinars.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <FaVideo style={{
              fontSize: '64px',
              color: '#ccc',
              marginBottom: '24px'
            }} />
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '12px'
            }}>
              No webinars found
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              {filter === 'all'
                ? 'No upcoming webinars are scheduled at the moment. Check back later!'
                : `No ${filter} webinars are available at the moment.`
              }
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {filteredWebinars.map((webinar) => (
              <div
                key={webinar.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Webinar Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px'
                    }}>
                      <FaVideo />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '4px',
                        lineHeight: '1.3'
                      }}>
                        {webinar.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        <FaUser />
                        {webinar.organizer_email || 'MIET Team'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: webinar.is_free ? '#e8f5e8' : '#e3f2fd',
                      color: webinar.is_free ? '#388e3c' : '#1976d2'
                    }}>
                      {webinar.is_free ? 'FREE' : `₹${webinar.price}`}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: '#f3f4f6',
                      color: '#6b7280'
                    }}>
                      {getTimeUntilEvent(webinar.start_time)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {webinar.description}
                </p>

                {/* Event Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <FaCalendarAlt />
                    {formatDate(webinar.start_time)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <FaClock />
                    {webinar.duration_minutes} minutes
                  </div>
                  {webinar.max_attendees && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <FaUser />
                      Max {webinar.max_attendees} attendees
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <FaMapMarkerAlt />
                    Online
                  </div>
                </div>

                {/* Action Button */}
                {webinar.google_meet_link ? (
                  <a
                    href={webinar.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      textAlign: 'center',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    🎥 Join Webinar
                  </a>
                ) : (
                  <div style={{
                    width: '100%',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link will be available soon
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
