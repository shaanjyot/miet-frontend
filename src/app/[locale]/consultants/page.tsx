"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { getApiUrl, getBackendUrl } from '@/utils/api';

const PAGE_SIZE = 4;

type Consultant = {
  id: number;
  name: string;
  email?: string;
  city?: string;
  address?: string;
  location_lat?: string;
  location_lng?: string;
  expertise?: string;
  speciality?: string;
  mode?: string;
  image?: string;
  status?: string;
};

export default function ConsultantsPage() {
  const t = useTranslations('ConsultantsPage');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  // Filter states
  const [city, setCity] = useState("");
  const [expertise, setExpertise] = useState("");
  const [mode, setMode] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch all consultants once on component mount
  const fetchAllConsultants = async () => {
    setLoading(true);
    setError("");

    try {
      const url = getApiUrl('api/consultants/public');

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch consultants");
      const data = await res.json();

        if (firstIndex !== index) {
          acc.push(consultant.id);
        }
        return acc;
      }, []);

      if (duplicateIds.length > 0) {

      }

      // Remove duplicates by ID (keep only the first occurrence)
      const uniqueConsultants = Array.from(
        new Map(data.map((c: Consultant) => [c.id, c])).values()
      ) as Consultant[];


      setAllConsultants(uniqueConsultants);
      setConsultants(uniqueConsultants);
    } catch (err) {

      setError("Could not load consultants.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to the allConsultants data
  const applyFilters = () => {
    setIsFiltering(true);

    let filteredConsultants = allConsultants;

    if (city) {
      filteredConsultants = filteredConsultants.filter(
        c => c.city && c.city.trim().toLowerCase() === city.toLowerCase()
      );
    }

    if (expertise) {
      filteredConsultants = filteredConsultants.filter((c) => {
        const consultantCategory = c.expertise || c.speciality;
        return consultantCategory && consultantCategory.toLowerCase().includes(expertise.toLowerCase());
      });
    }

    if (mode) {
      filteredConsultants = filteredConsultants.filter((c) => {
        // Check if the consultant matches the selected mode
        const consultantMode = c.mode && c.mode.trim();
        const consultantStatus = c.status && c.status.trim();

        // For Online/Offline filtering, check both mode and status fields
        if (mode === 'Online') {
          return consultantMode?.toLowerCase().includes('online') ||
            consultantStatus?.toLowerCase().includes('online') ||
            consultantMode?.toLowerCase().includes('live') ||
            consultantStatus?.toLowerCase().includes('live');
        }

        if (mode === 'Offline') {
          return consultantMode?.toLowerCase().includes('offline') ||
            consultantStatus?.toLowerCase().includes('offline') ||
            consultantMode?.toLowerCase().includes('in-person') ||
            consultantStatus?.toLowerCase().includes('in-person');
        }

        // For other modes, use the original logic
        return consultantMode && consultantMode.toLowerCase().includes(mode.toLowerCase());
      });
    }

    if (search) {
      filteredConsultants = filteredConsultants.filter((c) =>
        c.name && c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setConsultants(filteredConsultants);
    setIsFiltering(false);
  };

  // Fetch all consultants on component mount
  useEffect(() => {
    fetchAllConsultants();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    if (allConsultants.length > 0) {
      applyFilters();
    }
  }, [city, expertise, mode, search, allConsultants]);

  // Generate filter options from actual data
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    allConsultants.forEach((c: Consultant) => {
      if (c.city && typeof c.city === 'string' && c.city.trim() && c.city.trim().toLowerCase() !== 'null' && c.city.trim().toLowerCase() !== 'undefined') {
        citySet.add(c.city.trim());
      }
    });
    return Array.from(citySet).sort();
  }, [allConsultants]);

  const categories = useMemo(() => {

    const categorySet = new Set(allConsultants.map(c => c.expertise || c.speciality).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [allConsultants]);

  const modes = useMemo(() => {

    // Create a set with explicit Online/Offline options plus any other modes from data
    const modeSet = new Set<string>();

    // Add explicit Online/Offline options (only these capitalized versions)
    modeSet.add('Online');
    modeSet.add('Offline');

    // Add any other modes from the data (excluding online/offline variations)
    allConsultants.forEach(c => {
      if (c.mode && c.mode.trim()) {
        const modeValue = c.mode.trim();
        // Only add if it's not an online/offline variation
        if (!modeValue.toLowerCase().includes('online') &&
          !modeValue.toLowerCase().includes('offline') &&
          !modeValue.toLowerCase().includes('live') &&
          !modeValue.toLowerCase().includes('in-person')) {
          modeSet.add(modeValue);
        }
      }
      // Also check status field for other modes (excluding online/offline variations)
      if (c.status && c.status.trim()) {
        const statusValue = c.status.trim();
        // Only add if it's not an online/offline variation
        if (!statusValue.toLowerCase().includes('online') &&
          !statusValue.toLowerCase().includes('offline') &&
          !statusValue.toLowerCase().includes('live') &&
          !statusValue.toLowerCase().includes('in-person')) {
          modeSet.add(statusValue);
        }
      }
    });

    return Array.from(modeSet).sort();
  }, [allConsultants]);

  // Pagination
  const totalPages = Math.ceil(consultants.length / PAGE_SIZE);
  const paginated = consultants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [city, expertise, mode, search]);

  return (
    <>
      <TopBar />
      <main style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        padding: '4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: '30%',
          height: '30%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }} />

        <section
          style={{
            padding: "0 2rem",
            textAlign: "center",
            position: 'relative',
            zIndex: 2,
            maxWidth: '1400px',
            margin: '0 auto'
          }}
          aria-label="All Consultants"
        >
          {/* Page Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <h1 style={{
              fontFamily: 'Righteous, cursive',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '700',
              color: '#1e1b4b',
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              letterSpacing: '1px'
            }}>
              {t('title')}
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              {t('subtitle')}
            </p>
          </div>
          {/* Filters and Search */}
          <div
            style={{
              display: "flex",
              gap: '1rem',
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: '3rem',
              padding: '2rem',
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "15px",
                border: "2px solid rgba(99, 102, 241, 0.2)",
                background: "rgba(255,255,255,0.9)",
                color: "#1e1b4b",
                fontSize: "clamp(0.9rem, 1vw, 1rem)",
                fontWeight: "600",
                minWidth: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#5a67d8";
                e.target.style.boxShadow = "0 0 0 3px rgba(90, 103, 216, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <option value="" style={{ color: "#6b7280" }}>{t('filters.allCities')}</option>
              {cities.length === 0 && <option value="" disabled>{t('filters.noCities')}</option>}
              {cities.map((c) => (
                <option key={c} value={c} style={{ color: "#374151" }}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "2px solid #e2e8f0",
                background: "white",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                minWidth: "160px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#5a67d8";
                e.target.style.boxShadow = "0 0 0 3px rgba(90, 103, 216, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <option value="" style={{ color: "#6b7280" }}>{t('filters.allCategories')}</option>
              {categories.map((category) => (
                <option key={category} value={category} style={{ color: "#374151" }}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "2px solid #e2e8f0",
                background: "white",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                minWidth: "140px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#5a67d8";
                e.target.style.boxShadow = "0 0 0 3px rgba(90, 103, 216, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <option value="" style={{ color: "#6b7280" }}>{t('filters.allModes')}</option>
              {modes.map((m) => (
                <option key={m} value={m} style={{ color: "#374151" }}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('filters.searchPlaceholder')}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "2px solid #e2e8f0",
                background: "white",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                minWidth: "200px",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#5a67d8";
                e.target.style.boxShadow = "0 0 0 3px rgba(90, 103, 216, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            />
            <button
              onClick={() => fetchAllConsultants()}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #5a67d8 0%, #667eea 100%)",
                color: "white",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(90, 103, 216, 0.2)",
                minWidth: "100px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(90, 103, 216, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(90, 103, 216, 0.2)";
              }}
            >
              🔄 {t('filters.refresh')}
            </button>
          </div>
          {/* Consultant Cards */}
          {loading ? (
            <div style={{ color: "#5a67d8", fontWeight: 600, fontSize: 18 }}>
              {isFiltering ? t('filters.applyingFilters') : t('filters.loading')}
            </div>
          ) : error ? (
            <div style={{ color: "#e53e3e", fontWeight: 600, fontSize: 18 }}>{error}</div>
          ) : (
            <>
              <div style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "16px",
                textAlign: "center"
              }}>
                {t('filters.found', { count: consultants.length })}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: '2rem',
                  width: "100%",
                  margin: "2rem 0",
                  padding: "0",
                  alignItems: "start",
                  boxSizing: "border-box",
                  maxWidth: "1400px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  justifyContent: "center",
                }}
              >
                {paginated.map((consultant, index) => {

                  return (
                    <Link
                      key={`${consultant.id}-${consultant.name}-${index}`}
                      href={`/consultants/${consultant.id}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.95)",
                        borderRadius: '24px',
                        boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "2rem 1.5rem",
                        minWidth: 0,
                        fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                        width: "100%",
                        minHeight: "320px",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        backdropFilter: "blur(10px)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 30px 80px rgba(99, 102, 241, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.1)";
                      }}
                    >
                      {consultant.image && consultant.image.trim() !== ""
                        ? (
                          <img
                            src={
                              consultant.image.startsWith('/')
                                ? `${getBackendUrl()}${consultant.image}`
                                : `${getBackendUrl()}/uploads/${consultant.image}`
                            }
                            alt={consultant.name}
                            width={100}
                            height={100}
                            style={{
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "3px solid #667eea",
                              marginBottom: '1.5rem',
                              boxShadow: "0 8px 25px rgba(99, 102, 241, 0.2)"
                            }}
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: "50%",
                              border: "3px solid #667eea",
                              marginBottom: '1.5rem',
                              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                              boxShadow: "0 8px 25px rgba(99, 102, 241, 0.2)"
                            }}
                          />
                        )}
                      <div style={{
                        fontWeight: '700',
                        color: "#1e1b4b",
                        textAlign: "center",
                        fontSize: 'clamp(1.1rem, 1.3vw, 1.2rem)',
                        marginBottom: '0.5rem',
                        fontFamily: 'Righteous, cursive'
                      }}>
                        {consultant.name}
                      </div>
                      <div style={{
                        color: '#4b5563',
                        fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                        textAlign: "center",
                        marginBottom: '0.75rem'
                      }}>
                        {consultant.city || t('card.notSpecified')} &middot; <span style={{ color: consultant.mode === 'Online' ? '#667eea' : '#6b7280', fontWeight: 600 }}>{consultant.mode}</span>
                      </div>
                      <div style={{
                        color: "#667eea",
                        fontSize: 'clamp(0.85rem, 0.9vw, 0.95rem)',
                        textAlign: "center",
                        marginBottom: '0.5rem',
                        fontWeight: '600'
                      }}>
                        🏥 {consultant.expertise || consultant.speciality || t('card.categoryNotSpecified')}
                      </div>
                      <div style={{
                        color: "#6b7280",
                        fontSize: 'clamp(0.8rem, 0.85vw, 0.9rem)',
                        textAlign: "center",
                        marginBottom: '1rem'
                      }}>
                        💻 {consultant.mode || t('card.modeNotSpecified')}
                      </div>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#f0fdf4",
                        borderRadius: 5,
                        padding: "2px 8px",
                        fontWeight: 600,
                        fontSize: 12,
                        color: consultant.status === "online" ? "#15803d" : "#b91c1c",
                        border: consultant.status === "online" ? "1px solid #39e639" : "1px solid #e53e3e",
                        marginTop: 2,
                        width: "fit-content"
                      }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: "2.5px",
                            background: consultant.status === "online" ? "#39e639" : "#e53e3e",
                            marginRight: 2,
                            border: "1px solid #fff",
                          }}
                        />
                        {consultant.status === "online" ? t('filters.online') : t('filters.offline')}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 28,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: "var(--muted)",
                  color: "var(--text-secondary)",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    background: page === i + 1 ? "var(--accent)" : "var(--muted)",
                    color: page === i + 1 ? "var(--text-on-accent)" : "var(--text-secondary)",
                    border: "1.5px solid var(--accent)",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: "var(--muted)",
                  color: "var(--text-secondary)",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* CSS Animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `
        }} />
      </main>
      <Footer />
    </>
  );
}
