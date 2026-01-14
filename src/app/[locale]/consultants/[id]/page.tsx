"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import GoogleAuth from "@/components/GoogleAuth";
import { useNotifications } from "@/components/NotificationSystem";
import { getApiUrl, getBackendUrl } from "@/utils/api";
import { FaCalendarAlt, FaUserMd } from "react-icons/fa";

type Consultant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  expertise: string;
  bio: string;
  city: string;
  mode: string;
  image?: string;
  status?: string;
  tagline?: string;
  highlights?: string;
  location?: string;
};

export default function ConsultantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchConsultant = async () => {
      if (!params.id) return;

      setLoading(true);
      setError("");

      try {
        // Fetch all consultants and find the one we need
        const res = await fetch(getApiUrl('api/consultants/public'));

        if (!res.ok) {
          throw new Error("Failed to fetch consultants");
        }

        const allConsultants = await res.json();
        const consultant = allConsultants.find((c: any) => c.id === parseInt(params.id as string));

        if (!consultant) {
          throw new Error("Consultant not found");
        }

        setConsultant(consultant);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load consultant details.");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultant();
    checkAuthStatus();
  }, [params.id]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('user_jwt');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch(`${getApiUrl('api/auth/profile')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('user_jwt');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    }
  };

  const handleBookClick = () => {
    if (user) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setShowLoginModal(false);
    // Redirect to dashboard after successful login
    router.push('/dashboard');
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--card)"
        }}>
          <div style={{
            color: "#5a67d8",
            fontWeight: 600,
            fontSize: 18,
            textAlign: "center"
          }}>
            Loading consultant details...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !consultant) {
    return (
      <>
        <TopBar />
        <div style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--card)",
          padding: "2rem"
        }}>
          <div style={{
            color: "#e53e3e",
            fontWeight: 600,
            fontSize: 18,
            textAlign: "center",
            marginBottom: "1rem"
          }}>
            {error || "Consultant not found"}
          </div>
          <Link href="/consultants" style={{
            padding: "10px 20px",
            background: "#5a67d8",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: 600
          }}>
            Back to Consultants
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div style={{
        background: "var(--card)",
        minHeight: "80vh",
        padding: "2rem 0"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem"
        }}>
          {/* Breadcrumb */}
          <nav style={{
            marginBottom: "2rem",
            fontSize: "14px",
            color: "var(--text-secondary)"
          }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Home
            </Link>
            {" > "}
            <Link href="/consultants" style={{ color: "inherit", textDecoration: "none" }}>
              Consultants
            </Link>
            {" > "}
            <span style={{ color: "var(--text-primary)" }}>{consultant.name}</span>
          </nav>

          {/* Main Content */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "3rem",
            alignItems: "start"
          }}>
            {/* Left Column - Image and Basic Info */}
            <div style={{
              background: "var(--muted)",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              border: "1px solid var(--border)"
            }}>
              {/* Consultant Image */}
              <div style={{ marginBottom: "1.5rem" }}>
                {consultant.image && consultant.image.trim() !== "" ? (
                  <img
                    src={
                      consultant.image.startsWith('/')
                        ? `${getBackendUrl()}${consultant.image}`
                        : `${getBackendUrl()}/uploads/${consultant.image}`
                    }
                    alt={consultant.name}
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid #5a67d8",
                      margin: "0 auto"
                    }}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: "#f3f3f3",
                    border: "4px solid #5a67d8",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    color: "#5a67d8"
                  }}>
                    {consultant.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name and Expertise */}
              <h1 style={{
                fontFamily: "Righteous, cursive",
                color: "#5a67d8",
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "0.5rem"
              }}>
                {consultant.name}
              </h1>

              <div style={{
                background: "#f0fdf4",
                color: "#15803d",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontWeight: 600,
                fontSize: "14px",
                marginBottom: "1rem",
                display: "inline-block"
              }}>
                {consultant.expertise}
              </div>

              {/* Status */}
              {consultant.status && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: consultant.status === "online" ? "#f0fdf4" : "#fef2f2",
                  borderRadius: "20px",
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: consultant.status === "online" ? "#15803d" : "#dc2626",
                  border: consultant.status === "online" ? "1px solid #22c55e" : "1px solid #ef4444",
                  marginBottom: "1rem"
                }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: consultant.status === "online" ? "#22c55e" : "#ef4444"
                  }} />
                  {consultant.status === "online" ? "Online" : "Offline"}
                </div>
              )}

              {/* Mode */}
              <div style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "1.5rem"
              }}>
                Mode: {consultant.mode}
              </div>

              {/* Contact Buttons */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}>
                <a
                  href={`mailto:${consultant.email}`}
                  style={{
                    background: "#5a67d8",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: 600,
                    textAlign: "center"
                  }}
                >
                  Send Email
                </a>
                <a
                  href={`tel:${consultant.phone}`}
                  style={{
                    background: "var(--muted)",
                    color: "var(--text-primary)",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: 600,
                    textAlign: "center",
                    border: "1px solid var(--border)"
                  }}
                >
                  Call Now
                </a>

                {/* Booking Buttons */}
                <button
                  onClick={handleBookClick}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FaCalendarAlt />
                  Book Consultation
                </button>

                <button
                  onClick={() => router.push('/services/consultations')}
                  style={{
                    background: "transparent",
                    color: "#667eea",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #667eea",
                    fontWeight: 600,
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#667eea";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#667eea";
                  }}
                >
                  <FaUserMd />
                  View All Consultants
                </button>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div>
              {/* Tagline */}
              {consultant.tagline && (
                <div style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  marginBottom: "2rem",
                  fontSize: "18px",
                  fontWeight: 500,
                  textAlign: "center"
                }}>
                  "{consultant.tagline}"
                </div>
              )}

              {/* Highlights */}
              {consultant.highlights && (
                <div style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "2rem",
                  fontSize: "14px",
                  fontWeight: 600
                }}>
                  ✨ {consultant.highlights}
                </div>
              )}

              {/* Bio/Description */}
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{
                  color: "var(--text-primary)",
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "1rem"
                }}>
                  About {consultant.name}
                </h2>
                <p style={{
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  fontSize: "16px"
                }}>
                  {consultant.bio}
                </p>
              </div>

              {/* Contact Information */}
              <div style={{
                background: "var(--muted)",
                borderRadius: "12px",
                padding: "1.5rem",
                border: "1px solid var(--border)"
              }}>
                <h3 style={{
                  color: "var(--text-primary)",
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "1rem"
                }}>
                  Contact Information
                </h3>

                <div style={{
                  display: "grid",
                  gap: "1rem"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}>
                    <span style={{
                      color: "#5a67d8",
                      fontSize: "18px"
                    }}>📧</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Email</div>
                      <a
                        href={`mailto:${consultant.email}`}
                        style={{
                          color: "#5a67d8",
                          textDecoration: "none",
                          fontSize: "14px"
                        }}
                      >
                        {consultant.email}
                      </a>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}>
                    <span style={{
                      color: "#5a67d8",
                      fontSize: "18px"
                    }}>📞</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Phone</div>
                      <a
                        href={`tel:${consultant.phone}`}
                        style={{
                          color: "#5a67d8",
                          textDecoration: "none",
                          fontSize: "14px"
                        }}
                      >
                        {consultant.phone}
                      </a>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}>
                    <span style={{
                      color: "#5a67d8",
                      fontSize: "18px"
                    }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Address</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {consultant.address}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}>
                    <span style={{
                      color: "#5a67d8",
                      fontSize: "18px"
                    }}>🏙️</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>City</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {consultant.city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div style={{
            marginTop: "3rem",
            textAlign: "center"
          }}>
            <Link href="/consultants" style={{
              padding: "12px 24px",
              background: "var(--muted)",
              color: "var(--text-primary)",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              border: "1px solid var(--border)",
              display: "inline-block"
            }}>
              ← Back to All Consultants
            </Link>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleLoginModalClose}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#333',
              marginBottom: '16px'
            }}>
              Login Required
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Please login to book a consultation with {consultant?.name}
            </p>
            <GoogleAuth onLogin={handleLoginSuccess} />
            <button
              onClick={handleLoginModalClose}
              style={{
                background: 'transparent',
                color: '#666',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
