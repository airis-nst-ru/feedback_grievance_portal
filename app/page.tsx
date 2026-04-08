"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormMode = "none" | "grievance" | "feedback";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("none");
  const [content, setContent] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, content }),
      });

      const data = await res.json();

      if (data.success) {
        setTrackingId(data.trackingId);
        setSuccess(true);
        setContent("");
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get("trackingId") as string;
    if (id.trim()) {
      router.push(`/check?id=${encodeURIComponent(id.trim())}`);
    }
  };

  const resetForm = () => {
    setMode("none");
    setContent("");
    setSuccess(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-12">
      <main className="max-w-4xl mx-auto">
        {success ? (
          <div className="bg-[var(--surface)] rounded-xl p-8 shadow-sm border border-[var(--border)]">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
                Submission Received
              </h2>
              <p className="text-[var(--text-muted)] mb-6">
                Your {mode === 'grievance' ? 'grievance' : 'feedback'} has been submitted successfully.
              </p>
              <div className="bg-[var(--secondary)] rounded-lg p-5 mb-6 inline-block">
                <p className="text-xs text-[var(--text-muted)] mb-1">
                  Your Tracking ID
                </p>
                <p className="text-2xl font-mono font-semibold text-[var(--text)] tracking-wider">
                  {trackingId}
                </p>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Please save this tracking ID to check your status later.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Submit Another
                </button>
                <button
                  onClick={() => router.push(`/check?id=${trackingId}`)}
                  className="px-5 py-2.5 border border-[var(--border)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--secondary)] transition-colors"
                >
                  Check Status
                </button>
              </div>
            </div>
          </div>
        ) : mode === "none" ? (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">
                Grievance & Feedback Portal
              </h1>
              <p className="text-[var(--text-muted)]">
                Submit a concern or share your thoughts anonymously
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                onClick={() => setMode("grievance")}
                className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)] hover:shadow-md hover:border-red-200 transition-all group text-left"
              >
                <div className="w-11 h-11 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-[#C53030]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-[var(--text)] mb-1">
                  Submit Grievance
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Report an issue or concern
                </p>
              </button>

              <button
                onClick={() => setMode("feedback")}
                className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)] hover:shadow-md hover:border-blue-200 transition-all group text-left"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-[var(--text)] mb-1">
                  Share Feedback
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Tell us your thoughts
                </p>
              </button>

              <button
                onClick={() => router.push("/check")}
                className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)] hover:shadow-md hover:border-[var(--primary)]/30 transition-all group text-left"
              >
                <div className="w-11 h-11 bg-[var(--secondary)] rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-[var(--text)] mb-1">
                  Check Status
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Track your submission
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm border border-[var(--border)] max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[var(--text)]">
                {mode === "grievance" ? "Submit Grievance" : "Share Feedback"}
              </h2>
              <button
                onClick={resetForm}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[var(--error)] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  mode === "grievance"
                    ? "Describe your grievance in detail..."
                    : "Share your feedback with us..."
                }
                className="w-full h-40 px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="w-full mt-4 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}