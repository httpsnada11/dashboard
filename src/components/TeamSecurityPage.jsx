import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  Download,
  Clock,
  Laptop,
  Check,
  UserCheck,
  UserX,
  RefreshCw,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const INITIAL_MEMBERS = [
  {
    id: 'mem_1',
    name: 'Nora Vale',
    isYou: true,
    email: 'nora@harbor-demo.example',
    role: 'Owner',
    roleDescription: 'Team & policies; approve only',
    status: 'Active',
    twoFactor: 'Enrolled',
    lastAccessDate: 'Today, 14:18 UTC',
    lastAccessSub: 'Current session'
  },
  {
    id: 'mem_2',
    name: 'Elias Rowan',
    isYou: false,
    email: 'elias@harbor-demo.example',
    role: 'Payout creator',
    roleDescription: 'Create payouts; cannot approve',
    status: 'Active',
    twoFactor: 'Enrolled',
    lastAccessDate: 'Today, 14:12 UTC',
    lastAccessSub: '1 active session'
  },
  {
    id: 'mem_3',
    name: 'Mira Arden',
    isYou: false,
    email: 'mira@harbor-demo.example',
    role: 'Payout approver',
    roleDescription: 'Approve payouts; cannot create',
    status: 'Active',
    twoFactor: 'Enrolled',
    lastAccessDate: 'Today, 14:05 UTC',
    lastAccessSub: '1 active session'
  },
  {
    id: 'mem_4',
    name: 'Theo Linden',
    isYou: false,
    email: 'theo@harbor-demo.example',
    role: 'Finance viewer',
    roleDescription: 'View balances & statements',
    status: 'Active',
    twoFactor: 'Enrolled',
    lastAccessDate: '28 Oct, 16:42 UTC',
    lastAccessSub: 'No active sessions'
  },
  {
    id: 'mem_5',
    name: 'Ada Marlow',
    isYou: false,
    email: 'ada@harbor-demo.example',
    role: 'Operations analyst',
    roleDescription: 'Deposits & exception review',
    status: 'Invited',
    twoFactor: 'Required at setup',
    lastAccessDate: 'Not yet signed in',
    lastAccessSub: 'Invite expires 01 Nov 2026'
  }
];

const INITIAL_SESSIONS = [
  {
    id: 'sess_1',
    name: 'Nora Vale',
    device: 'Chrome · macOS',
    time: '14:18 UTC · Current',
    ip: '192.0.2.24 · 2FA verified',
    isCurrent: true
  },
  {
    id: 'sess_2',
    name: 'Elias Rowan',
    device: 'Edge · Windows',
    time: '14:12 UTC',
    ip: '198.51.100.32 · 2FA verified',
    isCurrent: false
  },
  {
    id: 'sess_3',
    name: 'Mira Arden',
    device: 'Safari · macOS',
    time: '14:05 UTC',
    ip: '203.0.113.18 · 2FA verified',
    isCurrent: false
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud_1',
    time: '14:18',
    title: 'Nora Vale signed in with 2FA',
    subtext: 'New session · Chrome on macOS',
    statusBadge: 'Success',
    category: 'Sign-in'
  },
  {
    id: 'aud_2',
    time: '14:08',
    title: 'Nora Vale invited Ada Marlow',
    subtext: 'Operations analyst · Expires 01 Nov, 14:08 UTC',
    statusBadge: 'Invited',
    category: 'Invitations'
  },
  {
    id: 'aud_3',
    time: '13:56',
    title: 'Mira Arden approved payout po_demo_R42',
    subtext: 'Created by Elias Rowan · Independent approval',
    statusBadge: 'Approved',
    category: 'Approvals'
  },
  {
    id: 'aud_4',
    time: '13:54',
    title: 'Elias Rowan attempted self-approval',
    subtext: 'po_demo_R42 · Maker-checker rule enforced',
    statusBadge: 'Blocked',
    category: 'Security'
  }
];

const ROLE_DEFINITIONS = [
  {
    role: 'Owner',
    description: 'Full workspace administration, security policies, and team management.',
    permissions: 'Manage team, configure 2FA/API, approve payouts, view all ledgers.'
  },
  {
    role: 'Payout creator',
    description: 'Drafts, creates, and dispatches batch payout requests to the approval queue.',
    permissions: 'Create payouts, generate destination addresses. Strictly cannot approve own payouts.'
  },
  {
    role: 'Payout approver',
    description: 'Authorizes payouts created by other team members (Maker-Checker compliance).',
    permissions: 'Approve or decline pending payouts. Cannot create initial payout batches.'
  },
  {
    role: 'Finance viewer',
    description: 'Read-only financial visibility across multi-chain treasury vaults and bank statements.',
    permissions: 'View balances, transaction history, currency conversions, and download reports.'
  },
  {
    role: 'Operations analyst',
    description: 'Monitors incoming blockchain transactions, settles exceptions, and reviews AML flags.',
    permissions: 'Inspect deposits, match unmatched hashes, review KYC holds, view exceptions.'
  }
];

export const TeamSecurityPage = ({
  openInviteMember,
  setOpenInviteMember,
  openReviewRoles,
  setOpenReviewRoles
}) => {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Modals
  const [internalInviteOpen, setInternalInviteOpen] = useState(false);
  const isInviteOpen = openInviteMember !== undefined ? openInviteMember : internalInviteOpen;
  const setIsInviteOpen = setOpenInviteMember !== undefined ? setOpenInviteMember : setInternalInviteOpen;

  const [internalRolesOpen, setInternalRolesOpen] = useState(false);
  const isRolesOpen = openReviewRoles !== undefined ? openReviewRoles : internalRolesOpen;
  const setIsRolesOpen = setOpenReviewRoles !== undefined ? setOpenReviewRoles : setInternalRolesOpen;

  const [manageMember, setManageMember] = useState(null);
  const [isEditPolicyOpen, setIsEditPolicyOpen] = useState(false);
  const [isFullActivityOpen, setIsFullActivityOpen] = useState(false);
  const [auditFilter, setAuditFilter] = useState('All');

  // Policy Settings State
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [makerCheckerEnforced, setMakerCheckerEnforced] = useState(true);

  // Invite Form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Operations analyst');

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Submit New Invite
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const roleDef = ROLE_DEFINITIONS.find(r => r.role === inviteRole) || ROLE_DEFINITIONS[4];

    const newMem = {
      id: 'mem_' + Date.now(),
      name: inviteName.trim(),
      isYou: false,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      roleDescription: roleDef.description.split('.')[0],
      status: 'Invited',
      twoFactor: 'Required at setup',
      lastAccessDate: 'Not yet signed in',
      lastAccessSub: 'Invite expires in 7 days'
    };

    setMembers(prev => [...prev, newMem]);

    // Add Audit Log
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: `Nora Vale invited ${newMem.name}`,
      subtext: `${newMem.role} · Expires in 7 days`,
      statusBadge: 'Invited',
      category: 'Invitations'
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Invitation sent to ${newMem.email}!`);
  };

  // Resend Invite
  const handleResendInvite = (member) => {
    showToast(`Invitation re-sent to ${member.email} (expires in 7 days).`);
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: `Nora Vale re-sent invitation to ${member.name}`,
      subtext: `${member.role} · Sent via automated mailer`,
      statusBadge: 'Invited',
      category: 'Invitations'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Revoke Invite
  const handleRevokeInvite = (member) => {
    setMembers(prev => prev.filter(m => m.id !== member.id));
    showToast(`Invitation for ${member.name} revoked.`);
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: `Nora Vale revoked invitation for ${member.name}`,
      subtext: `${member.role} · Removed from pending list`,
      statusBadge: 'Blocked',
      category: 'Invitations'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // End Session
  const handleEndSession = (sess) => {
    setSessions(prev => prev.filter(s => s.id !== sess.id));
    showToast(`Session for ${sess.name} terminated.`);
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: `Session terminated: ${sess.name}`,
      subtext: `${sess.device} · Remote revocation by Nora Vale`,
      statusBadge: 'Blocked',
      category: 'Security'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // End Other Sessions
  const handleEndOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    showToast('All remote sessions terminated successfully.');
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: 'Nora Vale terminated all remote sessions',
      subtext: 'Enforced single active login session',
      statusBadge: 'Blocked',
      category: 'Security'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Save Manage Member Changes
  const handleSaveMemberChanges = (updatedMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    setManageMember(null);
    showToast(`Updated permissions for ${updatedMember.name}`);
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: `Nora Vale updated role for ${updatedMember.name}`,
      subtext: `New role: ${updatedMember.role}`,
      statusBadge: 'Success',
      category: 'Security'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Save Policy Changes
  const handleSavePolicy = (e) => {
    e.preventDefault();
    setIsEditPolicyOpen(false);
    showToast('Security & Dual-Control policy updated.');
    const newAudit = {
      id: 'aud_' + Date.now(),
      time: new Date().toISOString().substring(11, 16),
      title: 'Nora Vale modified organization security policy',
      subtext: `Timeout: ${sessionTimeout} · 2FA: ${twoFactorEnforced ? 'Enforced' : 'Optional'}`,
      statusBadge: 'Success',
      category: 'Security'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Export Audit Log
  const handleExportAudit = () => {
    showToast('Exporting harbor_audit_log_2026.csv...');
  };

  const filteredLogs = auditFilter === 'All'
    ? auditLogs
    : auditLogs.filter(a => a.category === auditFilter);

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#00C076]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP SECTION: Team Members Table */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left border-collapse min-w-[780px]">
            {/* Dark Sleek Header Bar */}
            <thead>
              <tr className="bg-[#18191B] text-white text-[11.5px] sm:text-[12px] font-medium tracking-normal select-none">
                <th className="py-2.5 px-4 sm:px-5 rounded-tl-2xl">MEMBER</th>
                <th className="py-2.5 px-3">ROLE / ACCESS</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">TWO-FACTOR AUTH</th>
                <th className="py-2.5 px-3">LAST ACCESS</th>
                <th className="py-2.5 px-4 sm:px-5 text-center rounded-tr-2xl">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-gray-100/90 text-[12px]">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors group">
                  {/* Member Name & Email */}
                  <td className="py-3 px-4 sm:px-5">
                    <div className="font-bold text-[#14171A] text-[13px] flex items-center gap-1.5">
                      <span>{m.name}</span>
                      {m.isYou && (
                        <span className="font-normal text-gray-400">· You</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8E95A5] mt-0.5">{m.email}</div>
                  </td>

                  {/* Role / Access */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#14171A] text-[12.5px]">{m.role}</div>
                    <div className="text-[11px] text-[#8E95A5] mt-0.5">{m.roleDescription}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 bg-[#ECEEF2] text-gray-700 font-semibold text-[10.5px] rounded-full tracking-wide">
                      {m.status}
                    </span>
                  </td>

                  {/* Two-Factor Auth */}
                  <td className="py-3 px-3 text-[#374151] text-[12px] font-normal">
                    {m.twoFactor}
                  </td>

                  {/* Last Access */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#14171A] text-[12px]">{m.lastAccessDate}</div>
                    <div className="text-[10.5px] text-[#8E95A5] mt-0.5">{m.lastAccessSub}</div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 sm:px-5 text-center">
                    {m.status === 'Invited' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleResendInvite(m)}
                          className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-medium rounded-full shadow-2xs transition"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleRevokeInvite(m)}
                          className="px-3 py-1 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-red-600 text-[11px] font-medium rounded-full shadow-2xs transition"
                        >
                          Revoke
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setManageMember(m)}
                        className="px-3.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11.5px] font-medium rounded-full shadow-2xs transition"
                      >
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MIDDLE SECTION: Two-Factor Authentication Banner Card */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {/* Top Row: Title + Badges */}
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="text-[15px] font-bold text-[#14171A]">Two-factor authentication</h3>
            <span className="px-2.5 py-0.5 bg-[#ECEEF2] text-gray-700 text-[10.5px] rounded-full font-medium">
              Authenticator app required
            </span>
            <span className="px-2.5 py-0.5 bg-[#ECEEF2] text-gray-700 text-[10.5px] rounded-full font-medium">
              {members.filter(m => m.status === 'Active').length} of {members.filter(m => m.status === 'Active').length} enrolled
            </span>
            <span className="px-2.5 py-0.5 bg-[#18191B] text-white text-[10.5px] rounded-full font-medium">
              {twoFactorEnforced ? 'Enforced' : 'Optional'}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11.5px] text-gray-600 mt-1.5 leading-relaxed">
            Required at every sign-in. All {members.filter(m => m.status === 'Active').length} active members are enrolled; pending invitations must complete setup before access is granted.
          </p>
          <p className="text-[10px] text-[#8E95A5] mt-1 font-normal">
            Applies to all team members
          </p>
        </div>

        {/* Right Button: Edit Policy */}
        <button
          onClick={() => setIsEditPolicyOpen(true)}
          className="flex-shrink-0 px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-[11.5px] sm:text-[12px] font-medium shadow-2xs transition-all select-none"
        >
          Edit policy
        </button>
      </div>

      {/* BOTTOM SECTION: 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Active sessions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#14171A]">Active sessions</h3>
                <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#ECEEF2] text-gray-700 rounded-full text-[10px] font-bold">
                  {sessions.length}
                </span>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={handleEndOtherSessions}
                  className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[10.5px] sm:text-[11px] font-medium rounded-full shadow-2xs transition"
                >
                  End other sessions
                </button>
              )}
            </div>

            {/* Sessions List */}
            <div className="divide-y divide-gray-100/90 py-1">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-[#14171A] text-[12px]">{sess.name}</div>
                    <div className="text-[10.5px] text-[#8E95A5]">{sess.device}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-gray-800 font-medium">{sess.time}</div>
                    <div className="text-[10px] text-[#8E95A5]">{sess.ip}</div>
                  </div>

                  <div>
                    {sess.isCurrent ? (
                      <span className="inline-block px-3 py-0.5 bg-[#ECEEF2] text-gray-700 text-[10.5px] font-semibold rounded-full select-none">
                        You
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEndSession(sess)}
                        className="px-3 py-0.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-red-600 text-[11px] font-medium rounded-full transition shadow-2xs"
                      >
                        End
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Timeout Note */}
          <div className="pt-3 border-t border-gray-100 mt-2">
            <p className="text-[10px] text-[#8E95A5] font-normal tracking-tight">
              30-minute idle timeout · 12-hour maximum session · All times UTC
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent access & audit activity (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-[#14171A]">Recent access & audit activity</h3>
              <button
                onClick={handleExportAudit}
                className="px-3.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[10.5px] sm:text-[11px] font-medium rounded-full shadow-2xs transition"
              >
                Export audit log
              </button>
            </div>

            {/* Audit List */}
            <div className="divide-y divide-gray-100/90 py-1">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[11px] text-[#8E95A5] pt-0.5 w-10 shrink-0">
                      {log.time}
                    </span>
                    <div>
                      <div className="font-bold text-[#14171A] text-[12px] leading-tight">
                        {log.title}
                      </div>
                      <div className="text-[10.5px] text-[#8E95A5] mt-0.5">
                        {log.subtext}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      log.statusBadge === 'Blocked'
                        ? 'bg-[#18191B] text-white'
                        : log.statusBadge === 'Success'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-[#ECEEF2] text-gray-700'
                    }`}>
                      {log.statusBadge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between">
            <span className="text-[10.5px] text-[#8E95A5]">
              29 Oct 2026 · Demo events
            </span>
            <button
              onClick={() => setIsFullActivityOpen(true)}
              className="text-[11px] font-semibold text-gray-700 hover:text-black transition flex items-center gap-1 select-none"
            >
              <span>View full activity</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E6F9F1] flex items-center justify-center text-[#00C076]">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Invite Team Member</h3>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Price"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00C076]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@harbor-demo.example"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00C076]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Role / Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00C076]"
                >
                  {ROLE_DEFINITIONS.map(r => (
                    <option key={r.role} value={r.role}>
                      {r.role} — {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-[#00683e]">
                An invitation email will be dispatched with instructions to register a hardware security key or TOTP authenticator app.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-semibold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Review Roles Matrix Modal */}
      {isRolesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-[#00C076]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Roles & Governance Matrix</h3>
                  <p className="text-[11px] text-gray-500">Maker-Checker dual control policies</p>
                </div>
              </div>
              <button onClick={() => setIsRolesOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {ROLE_DEFINITIONS.map((r) => (
                <div key={r.role} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-xs">{r.role}</span>
                    {r.role.includes('Payout') && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Maker-Checker Enforced
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-gray-600 mb-1">{r.description}</p>
                  <p className="text-[10.5px] text-gray-500 font-mono">Scope: {r.permissions}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-100 rounded-xl text-xs text-gray-600 flex items-center justify-between">
              <span>Dual-Control Rule: Payout creators cannot approve their own payouts.</span>
              <span className="text-[#00C076] font-semibold">Active</span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setIsRolesOpen(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Member Modal */}
      {manageMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                  <UserCheck className="w-4 h-4 text-[#00C076]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Manage Member</h3>
                  <p className="text-[11px] text-gray-500">{manageMember.name} ({manageMember.email})</p>
                </div>
              </div>
              <button onClick={() => setManageMember(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Assigned Role</label>
                <select
                  value={manageMember.role}
                  onChange={(e) => {
                    const selected = ROLE_DEFINITIONS.find(r => r.role === e.target.value);
                    setManageMember({
                      ...manageMember,
                      role: e.target.value,
                      roleDescription: selected?.description.split('.')[0] || manageMember.roleDescription
                    });
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00C076]"
                >
                  {ROLE_DEFINITIONS.map(r => (
                    <option key={r.role} value={r.role}>{r.role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Status</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setManageMember({ ...manageMember, status: 'Active' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border ${
                      manageMember.status === 'Active'
                        ? 'bg-emerald-50 border-[#00C076] text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setManageMember({ ...manageMember, status: 'Suspended' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border ${
                      manageMember.status === 'Suspended'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    Suspended
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">Two-Factor Authentication</div>
                  <div className="text-[10.5px] text-gray-500">Hardware token / TOTP app</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`2FA reset token sent to ${manageMember.email}`);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-white text-gray-700"
                >
                  Reset 2FA
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManageMember(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMemberChanges(manageMember)}
                  className="px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Policy Modal */}
      {isEditPolicyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                  <Sliders className="w-4 h-4 text-[#00C076]" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Edit Security Policy</h3>
              </div>
              <button onClick={() => setIsEditPolicyOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="py-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="font-semibold text-gray-800">Enforce 2FA on all members</div>
                  <div className="text-[10.5px] text-gray-500">Require TOTP at every sign-in</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnforced(!twoFactorEnforced)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    twoFactorEnforced ? 'bg-[#00C076]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      twoFactorEnforced ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Session Idle Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00C076]"
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes (Standard)</option>
                  <option value="1 hour">1 hour</option>
                  <option value="4 hours">4 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="font-semibold text-gray-800">Maker-Checker Dual Control</div>
                  <div className="text-[10.5px] text-gray-500">Blocks self-approval on payouts</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMakerCheckerEnforced(!makerCheckerEnforced)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    makerCheckerEnforced ? 'bg-[#00C076]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      makerCheckerEnforced ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPolicyOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Full Audit Activity Modal */}
      {isFullActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                  <Clock className="w-4 h-4 text-[#00C076]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Full Audit Ledger</h3>
                  <p className="text-[11px] text-gray-500">Immutable governance access logs</p>
                </div>
              </div>
              <button onClick={() => setIsFullActivityOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 py-3 border-b border-gray-100">
              {['All', 'Sign-in', 'Invitations', 'Approvals', 'Security'].map(f => (
                <button
                  key={f}
                  onClick={() => setAuditFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    auditFilter === f
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Audit Log Entries */}
            <div className="divide-y divide-gray-100 py-2">
              {filteredLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-400 w-12 shrink-0">{log.time}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{log.title}</div>
                      <div className="text-[11px] text-gray-500">{log.subtext}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    log.statusBadge === 'Blocked'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {log.statusBadge}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-gray-100">
              <button
                onClick={handleExportAudit}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setIsFullActivityOpen(false)}
                className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

