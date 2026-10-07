import React from 'react';
import {
  Flame,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Clock,
  Scale,
  BarChart3,
  ListFilter,
  ShieldAlert
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentUser: User | null;
  isAdmin?: boolean;
  activeTab: 'feed' | 'my-complaints' | 'prices' | 'analytics' | 'admin-console';
  setActiveTab: (tab: 'feed' | 'my-complaints' | 'prices' | 'analytics' | 'admin-console') => void;
  onOpenReportModal: () => void;
  onLogin: () => void;
  onLogout: () => void;
  userComplaintsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin = false,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onLogin,
  onLogout,
  userComplaintsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="relative p-2.5 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl shadow-lg shadow-red-900/40">
              <Flame className="w-7 h-7 text-white fill-amber-200" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-red-400 bg-clip-text text-transparent">
                  Gas Syndicate Watch
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'feed'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Public Feed</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('my-complaints')}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'my-complaints'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>My Complaints</span>
                {userComplaintsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
                    {userComplaintsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('prices')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'prices'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Govt Rates & Law</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Syndicate Hotspots</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin-console')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin-console'
                    ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-600/30'
                    : 'text-red-400 hover:text-white hover:bg-red-950/40 border border-red-500/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-300" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Report Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium text-sm shadow-lg shadow-red-900/30 hover:shadow-red-800/50 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report Gouging</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* User Auth Section */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-950/80 pl-3 pr-2 py-1.5 rounded-xl border border-slate-800">
                <div className="flex flex-col text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold uppercase border border-red-500/30">
                        Admin
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-[160px]">
                      {currentUser.displayName || 'Citizen Reporter'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px] sm:max-w-[160px] font-mono">
                    {currentUser.email}
                  </span>
                </div>

                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-amber-500/50 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}

                <button
                  onClick={onLogout}
                  title="Sign Out of Session"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm font-medium transition-all shadow-sm hover:border-slate-600"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
              activeTab === 'feed' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveTab('my-complaints')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
                activeTab === 'my-complaints' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Reports</span>
              {userComplaintsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
                  {userComplaintsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('prices')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
              activeTab === 'prices' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Govt Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
              activeTab === 'analytics' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Hotspots</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-console')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
                activeTab === 'admin-console' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-red-400/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* 15-day session and privacy banner indicator */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800/60 py-1.5 px-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <Clock className="w-3 h-3 text-amber-400 inline" />
        <span>
          <strong className="text-amber-300">15-Day Retention Policy:</strong> Login sessions and complaints remain active for 15 days, then complaints are automatically purged from the database.
        </span>
        <span className="hidden lg:inline text-slate-500">|</span>
        <span className="hidden lg:inline text-slate-400">
          <ShieldAlert className="w-3 h-3 text-emerald-400 inline mr-1" />
          Strict PII Isolation: Only verified Gmail address and name are stored.
        </span>
      </div>
    </header>
  );
};
