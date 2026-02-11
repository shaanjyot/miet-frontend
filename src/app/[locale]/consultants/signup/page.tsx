"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/api";
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaPhone, FaUserMd, FaMapMarkerAlt, FaGoogle, FaUpload } from "react-icons/fa";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function ConsultantSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    speciality: "",
    city: "",
    description: "",
    tagline: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofType, setIdProofType] = useState("aadhar");
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProofFile(e.target.files[0]);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);
      formData.append("speciality", form.speciality);
      formData.append("city", form.city);
      formData.append("description", form.description);
      formData.append("tagline", form.tagline);
      formData.append("id_proof_type", idProofType);
      if (idProofFile) {
        formData.append("id_proof", idProofFile);
      }

      const res = await fetch(getApiUrl("api/consultants/register"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Registration successful! Your profile is pending admin approval. You will receive an email notification once approved.");
      setTimeout(() => {
        router.push("/consultants/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = getApiUrl("api/consultants/auth/google?mode=signup");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#f9fafb",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
    display: "block",
    fontSize: "14px",
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
        padding: "40px 20px"
      }}>
        <div style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "600px",
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
            <FaUserMd size={32} color="#fff" />
          </div>

          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Consultant Registration
          </h2>

          <p style={{
            color: "#6b7280",
            marginBottom: "32px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            Join our network of expert consultants. Your profile will be reviewed by our admin team.
          </p>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 0",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(66, 133, 244, 0.3)",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <FaGoogle />
            Sign up with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ padding: "0 16px", color: "#6b7280", fontSize: "14px" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>

          {/* Step Indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                background: step >= s ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#e5e7eb",
                transition: "all 0.3s ease"
              }} />
            ))}
          </div>

          {success && (
            <div style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid #a7f3d0",
              textAlign: "center"
            }}>
              {success}
            </div>
          )}

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

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Dr. John Doe" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: "relative" }}>
                    <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: "42px" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <div style={{ position: "relative" }}>
                    <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat password" style={{ ...inputStyle, paddingRight: "42px" }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
                      setError("Please fill in all required fields");
                      return;
                    }
                    if (form.password !== form.confirmPassword) {
                      setError("Passwords do not match");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 0",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginTop: "8px"
                  }}
                >
                  Next: Professional Details
                </button>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Speciality / Expertise *</label>
                  <input name="speciality" type="text" value={form.speciality} onChange={handleChange} required placeholder="e.g., Speech Therapy, Special Education" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input name="city" type="text" value={form.city} onChange={handleChange} placeholder="e.g., Gurgaon" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input name="tagline" type="text" value={form.tagline} onChange={handleChange} placeholder="Short professional tagline" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description / Bio</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Tell us about your experience, qualifications, and services..." rows={4} style={{ ...inputStyle, resize: "vertical" as const }} />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "#667eea",
                      border: "2px solid #667eea",
                      borderRadius: "12px",
                      padding: "14px 0",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer"
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.speciality) {
                        setError("Speciality is required");
                        return;
                      }
                      setError("");
                      setStep(3);
                    }}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 0",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer"
                    }}
                  >
                    Next: Documents
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Documents & Submit */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>ID Proof Type</label>
                  <select name="id_proof_type" value={idProofType} onChange={(e) => setIdProofType(e.target.value)} style={inputStyle}>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Upload ID Proof (Optional)</label>
                  <div style={{
                    border: "2px dashed #e5e7eb",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    background: "#f9fafb"
                  }}>
                    <FaUpload style={{ fontSize: "24px", color: "#9ca3af", marginBottom: "8px" }} />
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 8px 0" }}>
                      {idProofFile ? idProofFile.name : "Click to upload or drag and drop"}
                    </p>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} id="id-proof-upload" />
                    <label htmlFor="id-proof-upload" style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 20px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "inline-block"
                    }}>
                      Choose File
                    </label>
                  </div>
                </div>

                <div style={{
                  background: "#eff6ff",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #bfdbfe"
                }}>
                  <p style={{ color: "#1e40af", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                    <strong>Note:</strong> After registration, your profile will be reviewed by our admin team. You will receive an email notification once your profile is approved or if additional information is needed.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "#667eea",
                      border: "2px solid #667eea",
                      borderRadius: "12px",
                      padding: "14px 0",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer"
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 0",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Registration"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span style={{ color: "#6b7280", fontSize: "14px" }}>Already have an account? </span>
            <a href="/consultants/login" style={{ color: "#667eea", fontWeight: "600", textDecoration: "underline", fontSize: "14px" }}>Sign in</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
