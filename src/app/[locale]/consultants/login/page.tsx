"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/api";
import { FaEye, FaEyeSlash, FaLock, FaUser, FaShieldAlt, FaGoogle } from "react-icons/fa";
import GoogleAuth from "@/components/GoogleAuth";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function ConsultantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const router = useRouter();

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("consultant_email");
    const savedRememberMe = localStorage.getItem("consultant_remember_me");

    if (savedEmail && savedRememberMe === "true") {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle Google auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const googleAuth = urlParams.get('google_auth');

    if (token && googleAuth === 'true') {
      localStorage.setItem('consultant_jwt', token);
      router.push('/consultant-dashboard');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("api/consultants/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Save JWT token
      localStorage.setItem("consultant_jwt", data.token);

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("consultant_email", email);
        localStorage.setItem("consultant_remember_me", "true");
      } else {
        localStorage.removeItem("consultant_email");
        localStorage.removeItem("consultant_remember_me");
      }

      router.push("/consultant-dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleAuth(true);
    try {
      // Redirect to backend Google OAuth endpoint for consultants
      window.location.href = getApiUrl("api/consultants/auth/google");
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google login');
      setIsGoogleAuth(false);
    }
  };

  return (
    <>
      <TopBar />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
      }}>
        <div style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          minWidth: "400px",
          maxWidth: "500px",
          width: "100%"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
          }}>
            <FaShieldAlt size={32} color="#fff" />
          </div>

          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#667eea",
            marginBottom: "8px",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Consultant Login
          </h2>

          <p style={{
            color: "#6b7280",
            marginBottom: "32px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            Welcome back! Please sign in to your consultant account.
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleAuth || loading}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "16px 0",
              fontWeight: "700",
              fontSize: "16px",
              cursor: (isGoogleAuth || loading) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(66, 133, 244, 0.3)",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: (isGoogleAuth || loading) ? 0.7 : 1
            }}
            onMouseEnter={(e) => !(isGoogleAuth || loading) && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => !(isGoogleAuth || loading) && (e.currentTarget.style.transform = "translateY(0)")}
          >
            <FaGoogle />
            {isGoogleAuth ? "Redirecting..." : "Login with Google"}
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ padding: "0 16px", color: "#6b7280", fontSize: "14px" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
                display: "block"
              }} htmlFor="email">
                Email
              </label>
              <div style={{ position: "relative" }}>
                <FaUser style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "18px"
                }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    backgroundColor: "#f9fafb",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "8px 41px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.backgroundColor = "#f9fafb";
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
                display: "block"
              }} htmlFor="password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "18px"
                }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    backgroundColor: "#f9fafb",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "8px 41px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.backgroundColor = "#f9fafb";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: "18px",
                    padding: "4px"
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px"
            }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#374151"
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#667eea"
                  }}
                />
                Remember me
              </label>

              <a
                href="/consultants/signup"
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "underline"
                }}
              >
                Sign up?
              </a>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
                border: "1px solid #fecaca",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "16px 0",
                fontWeight: "700",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "translateY(0)")}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
