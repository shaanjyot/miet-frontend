"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/api";
import { FaEye, FaEyeSlash, FaLock, FaUser, FaShieldAlt } from "react-icons/fa";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const router = useRouter();

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem("admin_username");
    const savedRememberMe = localStorage.getItem("admin_remember_me");

    if (savedUsername && savedRememberMe === "true") {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Save JWT token
      localStorage.setItem("admin_jwt", data.token);

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("admin_username", username);
        localStorage.setItem("admin_remember_me", "true");
      } else {
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_remember_me");
      }

      router.push("/admin/dashboard");
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

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("api/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");

      setResetSuccess("Password reset link sent to your email. Please check your inbox.");
      setTimeout(() => {
        setResetPasswordMode(false);
        setResetSuccess("");
        setResetEmail("");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Password reset failed');
      }
    } finally {
      setLoading(false);
    }
  }

  if (resetPasswordMode) {
    return (
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
          width: "100%",
          textAlign: "center"
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
            <FaLock size={32} color="#fff" />
          </div>

          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#667eea",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Reset Password
          </h2>

          <p style={{
            color: "#6b7280",
            marginBottom: "32px",
            lineHeight: "1.6"
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {resetSuccess && (
            <div style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid #a7f3d0"
            }}>
              {resetSuccess}
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
                display: "block",
                textAlign: "left"
              }} htmlFor="reset-email">
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  style={{
                    width: "100%",
                    backgroundColor: "#2d3748",
                    color: "#ffffff",
                    border: "1px solid #4a5568",
                    borderRadius: "6px",
                    padding: "8px 41px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.backgroundColor = "#1e293b";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#4a5568";
                    e.target.style.backgroundColor = "#2d3748";
                  }}
                />
              </div>
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

            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setResetPasswordMode(false)}
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
              ← Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <style jsx global>{`
        input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], input[type="url"], input[type="search"], input[type="date"], input[type="time"], input[type="datetime-local"], textarea, select {
            background-color: #2d3748 !important;
            color: #ffffff !important;
            border: 1px solid #4a5568 !important;
            border-radius: 6px !important;
            padding: 8px 41px !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
        }

        input:focus, textarea:focus, select:focus {
            border-color: #667eea !important;
            background-color: #1e293b !important;
            outline: none !important;
        }

        ::placeholder {
            color: #94a3b8 !important;
            opacity: 1;
        }
      `}</style>
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
          Admin Login
        </h2>

        <p style={{
          color: "#6b7280",
          marginBottom: "32px",
          textAlign: "center",
          fontSize: "14px"
        }}>
          Welcome back! Please sign in to your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block"
            }} htmlFor="username">
              Username
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
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                style={{
                  width: "100%",
                  backgroundColor: "#2d3748",
                  color: "#ffffff",
                  border: "1px solid #4a5568",
                  borderRadius: "6px",
                  padding: "8px 41px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.backgroundColor = "#1e293b";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4a5568";
                  e.target.style.backgroundColor = "#2d3748";
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
                  backgroundColor: "#2d3748",
                  color: "#ffffff",
                  border: "1px solid #4a5568",
                  borderRadius: "6px",
                  padding: "8px 41px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.backgroundColor = "#1e293b";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4a5568";
                  e.target.style.backgroundColor = "#2d3748";
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

            <button
              type="button"
              onClick={() => setResetPasswordMode(true)}
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
              Forgot password?
            </button>
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

        <div style={{
          marginTop: "32px",
          padding: "20px",
          background: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981"
            }} />
            <span style={{
              fontSize: "12px",
              color: "#6b7280",
              fontWeight: "500"
            }}>
              Secure Connection
            </span>
          </div>
          <p style={{
            fontSize: "12px",
            color: "#9ca3af",
            margin: 0,
            lineHeight: "1.4"
          }}>
            Your login credentials are encrypted and transmitted securely.
          </p>
        </div>
      </div>
    </div>
  );
}
