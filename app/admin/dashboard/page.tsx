'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  type: string;
  status: string;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
}

interface NotificationEmail {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [activeSection, setActiveSection] = useState<'submissions' | 'notifications'>('submissions');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchSubmissions();
    fetchNotifications();
  }, [router]);

  useEffect(() => {
    if (activeSection === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, activeSection]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token || '',
    };
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/submissions', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data);
      } else {
        setError(data.message || 'Failed to fetch submissions');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(prev =>
          prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
        );
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch {
      setError('Failed to update status');
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedSubmission || !replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}/reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSubmission(prev =>
          prev
            ? {
                ...prev,
                replies: [...prev.replies, data.data],
              }
            : null
        );
        setReplyContent('');
      }
    } catch {
      setError('Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    setAddingEmail(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => [...prev, data.data]);
        setNewEmail('');
      }
    } catch {
      // ignore
    } finally {
      setAddingEmail(false);
    }
  };

  const handleDeleteEmail = async (email: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n.email !== email));
      }
    } catch {
      // ignore
    }
  };

  const pendingSubmissions = submissions.filter(
    s => s.status === 'pending' || s.status === 'reviewing'
  );
  const resolvedSubmissions = submissions.filter(s => s.status === 'resolved');
  const displayedSubmissions =
    activeTab === 'pending' ? pendingSubmissions : resolvedSubmissions;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-50 text-[#92400E] border border-yellow-200',
      reviewing: 'bg-blue-50 text-[#1E40AF] border border-blue-200',
      resolved: 'bg-green-50 text-[var(--success)] border border-green-200',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-[var(--text)]">
                Admin Dashboard
              </h1>
              <nav className="hidden md:flex items-center gap-1 ml-6">
                <button
                  onClick={() => setActiveSection('submissions')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'submissions'
                      ? 'bg-[var(--secondary)] text-[var(--text)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'notifications'
                      ? 'bg-[var(--secondary)] text-[var(--text)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Notifications
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium text-[var(--error)] hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-[var(--error)] text-sm">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeSection === 'submissions' && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--secondary)] border border-[var(--border)]'
                }`}
              >
                Pending ({pendingSubmissions.length})
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'resolved'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--secondary)] border border-[var(--border)]'
                }`}
              >
                Resolved ({resolvedSubmissions.length})
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="w-6 h-6 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : displayedSubmissions.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                No {activeTab === 'pending' ? 'pending' : 'resolved'} submissions found.
              </div>
            ) : (
              <div className="space-y-2">
                {displayedSubmissions.map(submission => (
                  <button
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className="w-full text-left bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-[var(--text-muted)]">
                            {submission.id.slice(0, 8)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--text-muted)]">
                            {submission.type}
                          </span>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-sm text-[var(--text)] truncate">
                          {submission.content}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === 'notifications' && (
          <div className="max-w-xl">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 mb-5">
              <h2 className="text-base font-medium text-[var(--text)] mb-3">
                Add Notification Email
              </h2>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  onClick={handleAddEmail}
                  disabled={addingEmail || !newEmail.includes('@')}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingEmail ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-4 py-2.5 text-sm font-medium text-[var(--text-muted)]">
                      Email
                    </th>
                    <th className="text-left px-4 py-2.5 text-sm font-medium text-[var(--text-muted)]">
                      Added
                    </th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-[var(--text-muted)]"
                      >
                        No notification emails configured.
                      </td>
                    </tr>
                  ) : (
                    notifications.map(notification => (
                      <tr
                        key={notification.id}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="px-4 py-2.5 text-sm text-[var(--text)]">
                          {notification.email}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-[var(--text-muted)]">
                          {formatDate(notification.createdAt)}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => handleDeleteEmail(notification.email)}
                            className="text-[var(--error)] hover:text-[#B91C1C] text-sm font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {selectedSubmission.id}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--text-muted)]">
                    {selectedSubmission.type}
                  </span>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--secondary)] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-5">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                  Content
                </h3>
                <div className="p-3.5 bg-[var(--secondary)] rounded-lg text-[var(--text)] whitespace-pre-wrap text-sm">
                  {selectedSubmission.content}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {formatDate(selectedSubmission.createdAt)}
                </p>
              </div>

              {selectedSubmission.replies.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                    Replies ({selectedSubmission.replies.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedSubmission.replies.map(reply => (
                      <div
                        key={reply.id}
                        className="p-3.5 bg-[var(--secondary)] rounded-lg"
                      >
                        <p className="text-[var(--text)] whitespace-pre-wrap text-sm">
                          {reply.content}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                          {formatDate(reply.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                  Reply
                </h3>
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none text-sm"
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={submittingReply || !replyContent.trim()}
                  className="mt-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submittingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                  Change Status
                </h3>
                <div className="flex gap-2">
                  {selectedSubmission.status !== 'reviewing' && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedSubmission.id, 'reviewing')
                      }
                      className="px-3 py-1.5 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors text-sm"
                    >
                      Mark Reviewing
                    </button>
                  )}
                  {selectedSubmission.status !== 'resolved' && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedSubmission.id, 'resolved')
                      }
                      className="px-3 py-1.5 bg-[var(--success)] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors text-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}