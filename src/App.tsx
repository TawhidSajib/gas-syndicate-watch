import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, testConnection } from './firebase';
import { Complaint, SortOption } from './types';
import {
  fetchAllActiveComplaints,
  fetchUserComplaints,
  createComplaint,
  deleteComplaintById,
  syncUserSession,
  isSessionActive
} from './services/complaintService';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ComplaintCard } from './components/ComplaintCard';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { MyComplaintsView } from './components/MyComplaintsView';
import { OfficialPriceGuide } from './components/OfficialPriceGuide';
import { SyndicateAnalyticsView } from './components/SyndicateAnalyticsModal';
import { AdminConsoleView } from './components/AdminConsoleView';
import { PhotoLightbox } from './components/PhotoLightbox';
import { generateDemoEvidencePhoto } from './utils/imageCompressor';
import {
  isUserAdmin,
  updateComplaintStatus
} from './services/complaintService';
import {
  Flame,
  AlertTriangle,
  PlusCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'my-complaints' | 'prices' | 'analytics' | 'admin-console'>('feed');

  // Check if current logged-in user is an authorized admin
  const isAdmin = useMemo(() => isUserAdmin(currentUser?.email), [currentUser]);

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('markup_desc');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    photoUrl: string;
    shopName: string;
    markupAmount: number;
  }>({
    isOpen: false,
    photoUrl: '',
    shopName: '',
    markupAmount: 0
  });

  // Notification / Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Test connection on boot and listen to auth state
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Enforce 15-day session check
        const sessionActive = isSessionActive();
        if (sessionActive || !localStorage.getItem('gas_watch_session_expiry')) {
          // Sync user session to Firestore with strictly Gmail and Name
          await syncUserSession(
            user.uid,
            user.displayName || 'Citizen Reporter',
            user.email || ''
          );
          setCurrentUser(user);
        } else {
          // Session expired after 15 days
          await signOut(auth);
          setCurrentUser(null);
          showToast('Your 15-day login session has expired. Please sign in again.');
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch complaints
  const loadComplaints = async () => {
    setIsLoadingComplaints(true);
    try {
      const data = await fetchAllActiveComplaints();

      if (data && data.length > 0) {
        setComplaints(data);
      } else if (auth.currentUser) {
        const seeded = await seedInitialSyndicateComplaints();
        setComplaints(seeded);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Update user-specific complaints
  useEffect(() => {
    if (currentUser) {
      fetchUserComplaints(currentUser.uid)
        .then((userList) => setUserComplaints(userList))
        .catch(console.error);
    } else {
      setUserComplaints([]);
    }
  }, [currentUser, complaints]);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await syncUserSession(
        user.uid,
        user.displayName || 'Citizen Reporter',
        user.email || ''
      );
      setCurrentUser(user);
      showToast(`Signed in as ${user.displayName}. 15-day active session started.`);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      showToast('Google Sign-In was cancelled or failed.');
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('gas_watch_session_expiry');
      setCurrentUser(null);
      showToast('Successfully signed out.');
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  // Submit Complaint
  const handleCreateComplaint = async (
    data: Omit<Complaint, 'id' | 'createdAt' | 'expiresAt'>
  ) => {
    const created = await createComplaint(data);
    setComplaints((prev) => [created, ...prev]);
    if (currentUser && created.userId === currentUser.uid) {
      setUserComplaints((prev) => [created, ...prev]);
    }
    showToast('Complaint recorded successfully! Retained for 15 days.');
  };

  // Delete Complaint (User or Admin)
  const handleDeleteComplaint = async (id: string) => {
    try {
      await deleteComplaintById(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      setUserComplaints((prev) => prev.filter((c) => c.id !== id));
      showToast('Complaint removed from database.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete complaint.');
    }
  };

  // Admin status updater
  const handleAdminUpdateStatus = async (
    id: string,
    status: 'active' | 'under_review' | 'verified_syndicate'
  ) => {
    try {
      await updateComplaintStatus(id, status);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      setUserComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      showToast(`Complaint status updated to "${status.replace('_', ' ')}".`);
    } catch (err) {
      console.error(err);
      showToast('Failed to update complaint status.');
    }
  };

  // Open Lightbox
  const handleViewPhoto = (photoUrl: string, shopName: string, markupAmount: number) => {
    setLightboxData({
      isOpen: true,
      photoUrl,
      shopName,
      markupAmount
    });
  };

  // Seed sample complaints if database is empty
  const seedInitialSyndicateComplaints = async (): Promise<Complaint[]> => {
    const sampleItems = [
      {
        shopName: 'M/S Al-Barka Gas & Hardware',
        shopAddress: 'Plot 14, Main Road, Mirpur-10 Roundabout',
        district: 'Dhaka - Mirpur',
        cylinderBrand: 'Bashundhara LP Gas',
        cylinderSize: '12kg',
        govtPrice: 1455,
        sellingPrice: 1950,
        markupAmount: 495,
        syndicateTactic: 'Artificial Supply Shortage (Hiding cylinders in backyard)',
        notes: 'Shopkeeper refused to sell at BERC rate. Demanded ৳1950 cash and refused cash memo.',
        userId: 'system_sample_1',
        userName: 'Tawhid Sajib',
        userEmail: 'tawhidsajib9@gmail.com',
        status: 'active' as const,
        evidencePhotoUrl: generateDemoEvidencePhoto('Al-Barka Gas & Hardware', 'Bashundhara', 1950)
      },
      {
        shopName: 'Bhai Bhai Cylinder Enterprise',
        shopAddress: 'Shop #4, GEC Circle Main Avenue',
        district: 'Chattogram - Agrabad',
        cylinderBrand: 'Omera LPG',
        cylinderSize: '12kg',
        govtPrice: 1455,
        sellingPrice: 1900,
        markupAmount: 445,
        syndicateTactic: 'Refusing Money Receipt / Cash memo',
        notes: 'Cartel syndicate fixed minimum price across 6 shops on the same street.',
        userId: 'system_sample_2',
        userName: 'Rahim Chowdhury',
        userEmail: 'rahim.chowdhury@gmail.com',
        status: 'active' as const,
        evidencePhotoUrl: generateDemoEvidencePhoto('Bhai Bhai Cylinder Enterprise', 'Omera LPG', 1900)
      },
      {
        shopName: 'Shurjo LP Gas Retailer',
        shopAddress: 'Road 27, Dhanmondi Residential Area',
        district: 'Dhaka - Dhanmondi',
        cylinderBrand: 'Beximco LPG',
        cylinderSize: '12kg',
        govtPrice: 1455,
        sellingPrice: 1880,
        markupAmount: 425,
        syndicateTactic: 'Cartel Price Fixing across neighborhood shops',
        notes: 'Distributors coordinated cartel prices over WhatsApp group.',
        userId: 'system_sample_3',
        userName: 'Farhana Yasmin',
        userEmail: 'farhana.yasmin@gmail.com',
        status: 'active' as const,
        evidencePhotoUrl: generateDemoEvidencePhoto('Shurjo LP Gas Retailer', 'Beximco LPG', 1880)
      },
      {
        shopName: 'Agrani Fuel Supply Depot',
        shopAddress: 'Chashara Station Road',
        district: 'Narayanganj - Chashara',
        cylinderBrand: 'Jamuna Gas',
        cylinderSize: '35kg',
        govtPrice: 4245,
        sellingPrice: 5300,
        markupAmount: 1055,
        syndicateTactic: 'Forced Bundled Purchase (Must buy stove/regulator)',
        notes: 'Extorting local restaurants with +৳1055 markup per cylinder.',
        userId: 'system_sample_4',
        userName: 'Kazi Tanvir',
        userEmail: 'kazi.tanvir@gmail.com',
        status: 'active' as const,
        evidencePhotoUrl: generateDemoEvidencePhoto('Agrani Fuel Supply Depot', 'Jamuna Gas', 5300)
      }
    ];

    const results: Complaint[] = [];
    for (const item of sampleItems) {
      try {
        const created = await createComplaint(item);
        results.push(created);
      } catch (e) {
        console.warn('Seeding note:', e);
      }
    }
    return results;
  };

  // Filtered & Sorted Complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          c.shopName.toLowerCase().includes(query) ||
          c.shopAddress.toLowerCase().includes(query) ||
          c.cylinderBrand.toLowerCase().includes(query) ||
          c.district.toLowerCase().includes(query);

        const matchesDistrict = !selectedDistrict || c.district === selectedDistrict;
        const matchesBrand = !selectedBrand || c.cylinderBrand === selectedBrand;

        return matchesQuery && matchesDistrict && matchesBrand;
      })
      .sort((a, b) => {
        if (sortBy === 'markup_desc') return b.markupAmount - a.markupAmount;
        if (sortBy === 'markup_asc') return a.markupAmount - b.markupAmount;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'selling_price_desc') return b.sellingPrice - a.sellingPrice;
        return 0;
      });
  }, [complaints, searchQuery, selectedDistrict, selectedBrand, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('');
    setSelectedBrand('');
    setSortBy('markup_desc');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm animate-in slide-in-from-bottom duration-200">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        userComplaintsCount={userComplaints.length}
      />

      {/* Hero Banner for Public Feed */}
      {activeTab === 'feed' && (
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Anti-Syndicate Citizen Action Campaign</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Exposing Illegal <span className="text-amber-400">Gas Cylinder Markups</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Empowering consumers to report retailers and distributor cartels charging above official government prices. Upload shop photo evidence, document the syndicate markup, and generate 15-day verified complaints.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-red-950 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Report Overcharging Shop</span>
                </button>
                <button
                  onClick={() => setActiveTab('prices')}
                  className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-sm font-semibold transition-colors"
                >
                  <span>Check Govt BERC Rates</span>
                </button>
              </div>
            </div>

            {/* Quick 15-Day Policy Widget */}
            <div className="w-full md:w-80 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  15-Day Data Cycle
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Login sessions and complaint dossiers stay active for exactly <strong>15 days</strong>. Thereafter, complaints are automatically purged from the database to keep data fresh and actionable.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-400 space-y-1 font-mono">
                <div>✓ Strictly Gmail & Name stored</div>
                <div>✓ Photo evidence verification</div>
                <div>✓ Instant DNCRP complaint export</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Public Feed */}
        {activeTab === 'feed' && (
          <div>
            <StatsBar complaints={complaints} />

            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={handleResetFilters}
              totalFilteredCount={filteredComplaints.length}
            />

            {isLoadingComplaints ? (
              <div className="py-24 text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-slate-400">Loading verified syndicate reports...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No matching complaints</h3>
                <p className="text-xs text-slate-400 mb-4">
                  No shops matched your search or filter criteria in the active 15-day window.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    currentUserId={currentUser?.uid}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteComplaint}
                    onViewPhoto={handleViewPhoto}
                    onUpdateStatus={handleAdminUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Complaints (15 Days) */}
        {activeTab === 'my-complaints' && (
          <MyComplaintsView
            currentUser={currentUser}
            complaints={userComplaints}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onDeleteComplaint={handleDeleteComplaint}
            onViewPhoto={handleViewPhoto}
            onLogin={handleGoogleLogin}
          />
        )}

        {/* Tab 3: Official Rates & Law */}
        {activeTab === 'prices' && <OfficialPriceGuide />}

        {/* Tab 4: Syndicate Analytics */}
        {activeTab === 'analytics' && <SyndicateAnalyticsView complaints={complaints} />}

        {/* Tab 5: Admin Moderation Console */}
        {activeTab === 'admin-console' && (
          <AdminConsoleView
            complaints={complaints}
            adminEmail={currentUser?.email || 'tawhidsajib9@gmail.com'}
            onDeleteComplaint={handleDeleteComplaint}
            onUpdateStatus={handleAdminUpdateStatus}
            onViewPhoto={handleViewPhoto}
          />
        )}
      </main>

      {/* Lightbox Modal */}
      <PhotoLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        photoUrl={lightboxData.photoUrl}
        shopName={lightboxData.shopName}
        markupAmount={lightboxData.markupAmount}
      />

      {/* Complaint Submission Modal */}
      <ComplaintFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
        onSubmitComplaint={handleCreateComplaint}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-300">Gas Syndicate Watch</span>
            <span>• Citizen Reporting Against Cylinder Price Gouging</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>15-Day Auto-Purge Database</span>
            <span>Zero Third-Party Tracking</span>
            <span>Only Gmail & Name Stored</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
