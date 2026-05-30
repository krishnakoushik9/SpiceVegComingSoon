"use client"
import { useState, useRef } from "react"
import { Phone, Lock, X, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { auth } from "@/lib/firebase-auth"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"

const ALLOWED_NUMBERS = [
  "+917842744576",
  "+918019435543",
  "+919177155542"
];

export default function LoginPage() {
  // Existing Slider State
  const [pos, setPos] = useState(0)
  const dragging = useRef(false)
  const startX = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const maxSlide = 220

  // OTP Login State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState(1) // 1 = phone, 2 = code
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Existing Slider Functions
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    startX.current = e.clientX - pos
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const newPos = Math.min(Math.max(0, e.clientX - startX.current), maxSlide)
    setPos(newPos)
  }

  const onPointerUp = () => {
    dragging.current = false
    if (pos >= maxSlide * 0.85) {
      setPos(maxSlide)
      setTimeout(() => {
        localStorage.setItem("admin-token", "admin-token")
        window.location.href = "/"
      }, 400)
    } else {
      setPos(0)
    }
  }

  // OTP Helper Functions
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, "")
    if (cleaned.startsWith("91")) {
      cleaned = cleaned.slice(2)
    }
    const digits = cleaned.slice(0, 10)
    if (digits.length === 0) return ""
    if (digits.length <= 5) {
      return `+91 ${digits}`
    }
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }

  const initRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      return (window as any).recaptchaVerifier
    }
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        setError("reCAPTCHA expired. Please try again.")
      }
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Normalize phone number
    const cleanedDigits = phone.replace(/\D/g, "")
    const actualDigits = cleanedDigits.startsWith("91") && cleanedDigits.length > 10 
      ? cleanedDigits.slice(2) 
      : cleanedDigits

    if (actualDigits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.")
      setLoading(false)
      return
    }

    const rawNumber = `+91${actualDigits}`

    // Block OTP initialization/SMS requests for any other numbers
    if (!ALLOWED_NUMBERS.includes(rawNumber)) {
      setError("Access Denied: This mobile number is not authorized.")
      setLoading(false)
      return
    }

    try {
      const verifier = initRecaptcha()
      const result = await signInWithPhoneNumber(auth, rawNumber, verifier)
      setConfirmationResult(result)
      setStep(2)
    } catch (err: any) {
      console.error("Firebase sendOTP error:", err)
      if (err.code === "auth/invalid-phone-number") {
        setError("The phone number entered is invalid.")
      } else {
        setError(err.message || "Failed to send OTP. Please check your network and try again.")
      }
      
      // Reset recaptcha state on failure
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear()
          (window as any).recaptchaVerifier = null
        } catch (e) {}
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code.")
      setLoading(false)
      return
    }

    try {
      if (!confirmationResult) {
        throw new Error("No active verification session found. Please request OTP again.")
      }
      const result = await confirmationResult.confirm(otp)
      const user = result.user
      if (user && user.phoneNumber) {
        localStorage.setItem("admin-token", "admin-token")
        localStorage.setItem("admin-phone", user.phoneNumber)
        window.location.href = "/"
      } else {
        throw new Error("Failed to retrieve phone number from authenticated user.")
      }
    } catch (err: any) {
      console.error("Firebase verifyOTP error:", err)
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid verification code. Please check and try again.")
      } else if (err.code === "auth/code-expired") {
        setError("The verification code has expired. Please request a new one.")
      } else {
        setError(err.message || "Verification failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const resetOTPModal = () => {
    setIsModalOpen(false)
    setStep(1)
    setPhone("")
    setOtp("")
    setError("")
    setConfirmationResult(null)
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0d0d" }}>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoom-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
          animation-iteration-count: 2;
        }
      `}</style>

      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container" className="hidden"></div>

      <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
      <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>SpiceVeg Admin</h1>
      <p style={{ color: "#666", marginBottom: 56, fontSize: 15 }}>Slide to enter</p>

      {/* Slider Login - Untouched visual representation and behavior */}
      <div ref={trackRef} style={{ position: "relative", width: 280, height: 56, background: "#1a1a1a", borderRadius: 999, display: "flex", alignItems: "center", padding: "0 4px", border: "1px solid #2a2a2a" }}>
        <span style={{ position: "absolute", width: "100%", textAlign: "center", color: "#444", fontSize: 13, pointerEvents: "none", userSelect: "none" }}>
          slide to enter →
        </span>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            width: 48,
            height: 48,
            background: "#2d7a3a",
            borderRadius: 999,
            cursor: "grab",
            transform: `translateX(${pos}px)`,
            transition: dragging.current ? "none" : "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            touchAction: "none",
            userSelect: "none"
          }}
        >
          →
        </div>
      </div>

      {/* OR separator */}
      <p style={{ color: "#444", fontSize: 13, marginTop: 24, marginBottom: 24, userSelect: "none" }}>OR</p>

      {/* OTP Path Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-stone-800 bg-stone-900/40 hover:bg-stone-900/80 hover:border-stone-700 text-stone-400 hover:text-white transition-all duration-300 shadow-md font-semibold text-xs uppercase tracking-wider"
      >
        <Phone size={14} className="text-emerald-500" />
        Login using Mobile OTP
      </button>

      {/* Elegant Glassmorphism OTP Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-stone-950/70 border border-stone-800 shadow-2xl backdrop-blur-xl animate-zoom-in text-stone-100">
            {/* Close Button */}
            <button
              onClick={resetOTPModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-stone-500 hover:text-stone-300 hover:bg-stone-900/50 transition-colors"
              disabled={loading}
            >
              <X size={18} />
            </button>

            {step === 1 ? (
              // Step 1: Phone number input
              <div>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Phone className="text-emerald-500" size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Admin OTP Login</h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed max-w-xs">
                    Enter your authorized mobile number to receive a one-time passcode.
                  </p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      className="w-full px-4 py-3.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-white placeholder-stone-700 font-mono tracking-wider transition-all duration-300 outline-none"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-shake">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || phone.replace(/\D/g, "").length < 10}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-stone-900 disabled:text-stone-600 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-950/20"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send One-Time Password</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Step 2: Verification code input
              <div>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Lock className="text-emerald-500" size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Enter Code</h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed max-w-xs">
                    We sent a 6-digit confirmation code to <span className="font-mono text-emerald-400 font-medium">{phone}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="\d{6}"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full px-4 py-4 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-white placeholder-stone-800 font-mono tracking-[0.5em] text-center text-2xl font-bold transition-all duration-300 outline-none"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-shake">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-stone-900 disabled:text-stone-600 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-950/20"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Access Studio</span>
                        <CheckCircle size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setOtp("")
                      setError("")
                    }}
                    className="w-full py-2.5 text-center text-xs text-stone-500 hover:text-stone-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Change phone number
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
