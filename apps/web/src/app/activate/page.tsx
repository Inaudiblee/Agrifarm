"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sun, Moon, ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { LanguageSwitch } from "@/components/language-switch";
import { useTheme } from "@/components/theme-provider";
import { getApiBase, parseApiError } from "@/lib/api";
import { getAuthToken, getAuthUser, saveAuthSession, type AuthSession } from "@/lib/auth-storage";
import { getRoleHomeHref } from "@/lib/auth-routing";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

const inputClass = "auth-input";

function ActivateContent() {
  const { copy } = useLocale();
  const t = copy;
  const { notify, showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  
  const [staticEmail, setStaticEmail] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isNight = theme === "night";

  useEffect(() => {
    // If user is already logged in, redirect them
    const token = getAuthToken();
    const user = getAuthUser();
    if (token && user) {
      notify("info", "alreadyLoggedIn");
      router.replace(getRoleHomeHref(user));
      return;
    }

    const emailParam = searchParams.get("email") || "";
    setStaticEmail(emailParam);
  }, [searchParams, router, notify]);

  const sendVerificationCode = () => {
    if (!staticEmail) {
      showToast({ type: "error", message: "Static email is required. Please go back to login." });
      return;
    }
    if (!personalEmail.trim()) {
      showToast({ type: "error", message: "Please enter your personal email." });
      return;
    }
    if (!personalEmail.includes("@")) {
      showToast({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCodeSent(true);
      showToast({ 
        type: "success", 
        message: "Verification code sent to your personal email!" 
      });
    }, 600);
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!staticEmail) {
      showToast({ type: "error", message: "Static email is required. Please go back to login." });
      return;
    }
    if (!personalEmail.trim()) {
      showToast({ type: "error", message: "Please enter your personal email." });
      return;
    }
    if (!code.trim()) {
      showToast({ type: "error", message: "Please enter the verification code." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/api/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staticEmail: staticEmail.trim().toLowerCase(),
          personalEmail: personalEmail.trim().toLowerCase(),
          code: code.trim(),
        }),
      });

      if (!response.ok) {
        const message = await parseApiError(response);
        showToast({ type: "error", message });
        return;
      }

      const data = (await response.json()) as AuthSession;
      saveAuthSession(data);
      showToast({ type: "success", message: "Account activated successfully! Redirecting to seller dashboard..." });
      
      // Redirect to seller dashboard
      router.push("/seller");
      router.refresh();
    } catch {
      notify("error", "network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isNight ? "bg-[#111a15] text-[#fff8e8]" : "bg-[#fff9ec] text-[#17250f]"}`}>
      {/* Topbar matching the landing page */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${
          isNight ? "border-white/10 bg-[#101914]/78" : "border-white/35 bg-[#fff9ec]/70"
        }`}
      >
        <nav className="mx-auto flex h-20 w-full max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="AgriFarm home">
            <span
              className={`grid h-12 w-12 place-items-center overflow-hidden rounded-full shadow-sm ring-1 ${
                isNight ? "bg-white/10 ring-white/15" : "bg-[#ecf5dc] ring-[#145c2a]/10"
              }`}
            >
              <img className="h-[88%] w-[76%] object-contain" src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <strong
                className={`block text-2xl font-black tracking-tight sm:text-3xl ${
                  isNight ? "text-[#f7f0d7]" : "text-[#0d5426]"
                }`}
              >
                AgriFarm
              </strong>
              <small className={`hidden text-xs font-bold sm:block ${isNight ? "text-[#d7c99d]" : "text-[#33452a]"}`}>
                From our farms, for our future.
              </small>
            </span>
          </Link>

          <div
            className={`hidden items-center gap-5 text-sm font-semibold xl:flex ${
              isNight ? "text-[#f5ead0]" : "text-[#1f2b18]"
            }`}
          >
            <Link href="/marketplace">{t.landing.navLabels.marketplace}</Link>
            <Link href="/farmers">{t.landing.navLabels.farmers}</Link>
            <Link href="/recipes">{t.landing.navLabels.recipes}</Link>
            <Link href="/forecast">{t.landing.navLabels.forecast}</Link>
            <Link href="/pasig">{t.landing.navLabels.explorePasig}</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch compact />
            <div
              className={`hidden h-12 items-center rounded-2xl p-1 ring-1 md:flex ${
                isNight ? "bg-white/10 ring-white/15" : "bg-white/80 ring-black/5"
              }`}
              aria-label="Choose theme"
            >
              <button
                type="button"
                onClick={() => setTheme("day")}
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  !isNight ? "bg-[#145c2a] text-white shadow-sm" : "text-[#f5ead0] hover:bg-white/10"
                }`}
                aria-label="Morning story"
                aria-pressed={!isNight}
              >
                <Sun size={18} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("night")}
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  isNight ? "bg-[#f6d27a] text-[#182114] shadow-sm" : "text-[#17250f] hover:bg-[#edf5d9]"
                }`}
                aria-label="Night story"
                aria-pressed={isNight}
              >
                <Moon size={18} />
              </button>
            </div>
            
            <Link
              href="/login"
              className={`hidden h-11 items-center rounded-2xl px-4 text-sm font-bold shadow-sm ring-1 transition hover:-translate-y-0.5 sm:inline-flex ${
                isNight ? "bg-white/12 text-[#fff8e8] ring-white/12" : "bg-white/80 text-[#17250f] ring-black/5"
              }`}
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-2xl bg-[#145c2a] px-4 text-sm font-bold text-white shadow-lg shadow-[#145c2a]/20 transition hover:-translate-y-0.5"
            >
              {t.nav.register}
            </Link>
          </div>
        </nav>
      </header>

      {/* Main plain activation content */}
      <main className="flex-1 pt-28 flex items-center justify-center p-4">
        <div className="w-full max-w-[500px]">
          <Link href="/login" className={`inline-flex items-center gap-2 text-sm font-semibold mb-6 transition hover:opacity-80 ${isNight ? "text-[#f6d27a]" : "text-[#145c2a]"}`}>
            <ArrowLeft size={16} /> Back to login
          </Link>

          <div className={`rounded-[32px] p-8 shadow-xl ring-1 transition duration-500 ${
            isNight ? "bg-[#14251d] shadow-black/35 ring-white/10" : "bg-white shadow-[#65461b]/10 ring-[#7a5b2f]/10"
          }`}>
            <h1 className="text-3xl font-black tracking-tight mb-2">Activate Account</h1>
            <p className={`text-sm font-medium mb-6 ${isNight ? "text-[#eadfc3]" : "text-[#4a4937]"}`}>
              To verify, add your personal email for the account <strong>{staticEmail}</strong>.
            </p>

            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-black uppercase tracking-wider opacity-90">Personal Email</label>
                <input
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className={`${inputClass} w-full`}
                  placeholder="agrifarm@gmail.com"
                  disabled={codeSent || loading}
                />
              </div>

              {!codeSent ? (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  className="auth-submit w-full py-4 text-base font-extrabold"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-black uppercase tracking-wider opacity-90">Verification Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={`${inputClass} w-full`}
                      placeholder="Enter verification code"
                      inputMode="numeric"
                      disabled={loading}
                    />
                    <p className={`text-xs mt-1 ${isNight ? "text-[#d7c99d]" : "text-[#5a513d]"}`}>
                      For testing, enter verification code<strong></strong>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit w-full py-4 text-base font-extrabold"
                    disabled={loading}
                  >
                    {loading ? "Activating..." : "Verify & Activate"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="settings-loading">Loading activation page...</div>}>
      <ActivateContent />
    </Suspense>
  );
}
