import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- Imports ---
import Index from "./pages/home/index";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import HomeActivities from "./pages/home/Activities";
import HomeOffers from "./pages/home/Offers";
import HomeReels from "./pages/home/Reels";
import FAQ from "./pages/FAQ";
import Activities from "./pages/Activities";
import Points from "./pages/profile/Points";
import Supporters from "./pages/Supporters";
import Subscriptions from "./pages/Subscriptions";
import Discounts from "./pages/Discounts";
import MembershipCard from "./pages/profile/MembershipCard";
import Profile from "./pages/profile/Profile";
import Certificates from "./pages/profile/Certificates";
import Jobs from "./pages/Jobs";
import Volunteers from "./pages/Volunteers";
import Guide from "./pages/Guide";
import Policies from "./pages/Policies";
import Admin from "./pages/admin/Admin";
import DashboardAdmin from "./pages/admin/Dashboard";
import ScannerAdmin from "./pages/admin/ScannerAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import ActivitiesAdmin from "./pages/admin/ActivitiesAdmin";
import PartnersAdmin from "./pages/admin/PartnersAdmin";
import OffersAdmin from "./pages/admin/OffersAdmin";
import ReelsAdmin from "./pages/admin/ReelsAdmin";
import PointsHistoryAdmin from "./pages/admin/PointsHistoryAdmin";
import { AuthProvider, AdminGuard } from './context/AuthContext';
import NotFound from "./pages/NotFound";
import Suggestions from "./pages/Suggestions";
import { useAuth } from '@/context/AuthContext';
import Community from "./pages/Community";
import Transparency from "./pages/Transparency";
import Notes from "./pages/profile/Notes";
import Events from "./pages/Events";
import IstanbulMap from "./pages/IstanbulMap";
import Translate from "./pages/Translate";
import SponsorPortal from "./pages/SponsorPortal";
import SponsorProfile from "./pages/SponsorProfile";
import FoundingCommittee from "./pages/FoundingCommittee";
import TurkeyApps from "./pages/TurkeyApps";
import Corps from "./pages/Corps";
import Partners from "./pages/Partners";
import Awn from "./pages/3wn";
import QuranLife from "./pages/QuranLife";
import AcademyPage from "./pages/academy/AcademyPage";
import CoursePage from "./pages/academy/Coursepage";
import Mylearningpage from "./pages/academy/Mylearningpage";
import CertificatePage from "./pages/academy/Certificatepage";
import ResultsPage from './pages/election/Resultspage';
import VotingPage from './pages/election/Votingpage';
import CandidatePage from './pages/election/Candidatespage';
import CandidateProfilePage from "./pages/election/Candidateprofilepage";
import CertificateVerificationPage from './pages/academy/Certificateverificationpage';
import Unionprojects from './pages/Unionprojects';
import FoundingTeam from "./pages/Foundingteam";
import ProjectDetail from './pages/Unionprojects';
import BuslaPage from "./pages/busla/busla";
import TracksPage from "./pages/busla/Tracks";
import LibraryPage from "./pages/busla/library";
import TrackDetailPage from "./pages/busla/TrackDetail";
import ActivitiesPage from "./pages/busla/Activitiesbusla";
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AwnAdmin from "./pages/admin/3wnAdmin";
import Verify from "./pages/verify";
import JobAdmin from "./pages/admin/jobadmin";
import GuideAdmin from "./pages/admin/GuideAdmin";
import TeamAdmin from "./pages/admin/TeamAdmin";
import AppsMapAdmin from "./pages/admin/AppsMapAdmin";
import ElectionsPage from './pages/election/Electionspage';
import ElectionDetailPage from './pages/election/Electiondetailpage';
import NominationPage from './pages/election/Nominationpage';
import AdminCandidatesPage from './pages/admin/Admincandidatespage';
import AdminElectionsPage from './pages/admin/Adminelectionspage';
import AdminCreateElectionPage from "./pages/admin/Admincreateelectionpage";
import AdminMonitorPage from "./pages/admin/Adminelectionspage";
import AdminEditElectionPage from "./pages/admin/Adminelectionspage";
import AdminCourseFormPage from "./pages/admin/Admincourseformpage";
import AdminCoursesPage from "./pages/admin/Adminacademypage";
import AdminAcademyPage from "./pages/admin/Adminacademypage";
import AdminCourseStudentsPage from "./pages/admin/Admincoursestudentspage";
import AdminActivitiesPage from "./pages/admin/busla/activityadmin";
import BuslaAdminPage from "./pages/admin/busla/buslaAdmin";
import LibraryAdminPage from "./pages/admin/busla/library";
import TrackDetailAdminPage from "./pages/admin/busla/trackadmin";
import WeeklyQuestion from "./pages/engagement/WeeklyQuestion";
import Chat from "./pages/engagement/Chat";
import EngagementPoints from "./pages/engagement/EngagementPoints";
import ChatAdmin from "./pages/admin/engagement/ChatAdmin";
import WeeklyAdmin from "./pages/admin/engagement/WeeklyAdmin";
import LeadershipAdmin from "./pages/admin/LeadershipAdmin";
import LeadershipDetail from "./pages/admin/LeadershipDetail";
import HomepageManager from "./pages/admin/HomepageManager";
import InfoCMSAdmin from "./pages/admin/InfoCMSAdmin";

// ─── Informational pages (public, no login required) ──────────────────────────
import AboutIstanbul from "./pages/info/AboutIstanbul";
import AboutYemen from "./pages/info/AboutYemen";
import ArticleDetail from "./pages/info/ArticleDetail";
import UniversitiesPage from "./pages/info/Universities";
import UniversityDetail from "./pages/info/UniversityDetail";
import StudentsPage from "./pages/info/Students";
import StudentDetail from "./pages/info/StudentDetail";
import IconsPage from "./pages/info/Icons";
import IconDetail from "./pages/info/IconDetail";
import AchievementsPage from "./pages/info/Achievements";
import PublicLayout from "./components/layout/PublicLayout";

// ─── Admin CMS Sections (Articles, Universities, etc.) ───────────────────────
import ArticlesAdmin from "./pages/admin/info/ArticlesAdmin";
import ArticleFormAdmin from "./pages/admin/info/ArticleFormAdmin";
import UniversitiesAdmin from "./pages/admin/info/UniversitiesAdmin";
import UniversityFormAdmin from "./pages/admin/info/UniversityFormAdmin";
import StudentsAdmin from "./pages/admin/info/StudentsAdmin";
import StudentFormAdmin from "./pages/admin/info/StudentFormAdmin";
import IconsAdmin from "./pages/admin/info/IconsAdmin";
import IconFormAdmin from "./pages/admin/info/IconFormAdmin";
import AchievementsAdmin from "./pages/admin/info/AchievementsAdmin";
import AchievementFormAdmin from "./pages/admin/info/AchievementFormAdmin";
import DiscountsTabAdmin from "./pages/admin/homepage/DiscountsTab";
import ActivitiesTabAdmin from "./pages/admin/homepage/ActivitiesTab";
import PartnersTabAdmin from "./pages/admin/homepage/PartnersTab";
import FooterTabAdmin from "./pages/admin/homepage/FooterTab";
// import Homepageshared from "./pages/admin/HomepageManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />

          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. STANDALONE PAGES (NO Navbar / Footer) */}
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/home/activities" element={<HomeActivities />} />
                <Route path="/home/offers" element={<HomeOffers />} />
                <Route path="/home/reels" element={<HomeReels />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/points" element={<Points />} />
                <Route path="/supporters" element={<Supporters />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/discounts" element={<Discounts />} />
                <Route path="/membership-card" element={<MembershipCard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/community" element={<Community />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/3wn" element={<Awn />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/events" element={<Events />} />
                <Route path="/map" element={<IstanbulMap />} />
                <Route path="/translate" element={<Translate />} />
                <Route path="/sponsor-portal" element={<SponsorPortal />} />
                <Route path="/sponsor/:sponsorId" element={<SponsorProfile />} />
                <Route path="/founding-committee" element={<FoundingCommittee />} />
                <Route path="/turkey-apps" element={<TurkeyApps />} />
                <Route path="/corps" element={<Corps />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/quran-life" element={<QuranLife />} />

                <Route path="/elections" element={<ElectionsPage />} />
                <Route path="/elections/:electionId" element={<ElectionDetailPage />} />
                <Route path="/elections/:electionId/nominate" element={<NominationPage />} />
                <Route path="/elections/:electionId/results" element={<ResultsPage />} />
                <Route path="/elections/:electionId/voting" element={<VotingPage />} />
                <Route path="/elections/:electionId/candidates/:candidateId" element={<CandidatePage />} />
                <Route path="/elections/:electionId/candidates/:candidateId/profile" element={<CandidateProfilePage />} />
                <Route path="/academy" element={<AcademyPage />} />
                <Route path="/academy/course/:id" element={<CoursePage />} />
                <Route path="/academy/my-learning" element={<Mylearningpage />} />
                <Route path="/academy/certificate/:courseId" element={<CertificatePage />} />
                <Route path="/verify/:certId" element={<CertificateVerificationPage />} />
                <Route path="/union-projects" element={<Unionprojects />} />
                <Route path="/founding-team" element={<FoundingTeam />} />
                <Route path="/union-projects/:projectId" element={<ProjectDetail />} />
                <Route path="/busla" element={<BuslaPage />} />
                <Route path="/busla/tracks" element={<TracksPage />} />
                <Route path="/busla/library" element={<LibraryPage />} />
                <Route path="/busla/track/:id" element={<TrackDetailPage />} />
                <Route path="/busla/activities" element={<ActivitiesPage />} />
                <Route path="/engagement/weekly-question" element={<WeeklyQuestion />} />
                <Route path="/engagement/chat" element={<Chat />} />
                <Route path="/engagement/points" element={<EngagementPoints />} />
                <Route path="/verify/:id" element={<Verify />} />

                {/* 2. PROTECTED ADMIN PAGES (NO Navbar / Footer, AdminGuard wraps them) */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <Admin />
                    </AdminGuard>
                  }
                >
                  <Route index element={<DashboardAdmin />} />
                  <Route path="dashboard" element={<DashboardAdmin />} />
                  <Route path="scanner" element={<ScannerAdmin />} />
                  <Route path="users" element={<UsersAdmin />} />
                  <Route path="activities" element={<ActivitiesAdmin />} />
                  <Route path="partners" element={<PartnersAdmin />} />
                  <Route path="offers" element={<OffersAdmin />} />
                  <Route path="reels" element={<ReelsAdmin />} />
                  <Route path="points" element={<PointsHistoryAdmin />} />
                  <Route path="3wnAdmin" element={<AwnAdmin />} />
                  <Route path="jobadmin" element={<JobAdmin />} />
                  <Route path="guideadmin" element={<GuideAdmin />} />
                  <Route path="teamadmin" element={<TeamAdmin />} />
                  <Route path="appsmapadmin" element={<AppsMapAdmin />} />
                  <Route path="elections/:electionId/candidates" element={<AdminCandidatesPage />} />
                  <Route path="elections" element={<AdminElectionsPage />} />
                  <Route path="elections/new" element={<AdminCreateElectionPage />} />
                  <Route path="elections/:electionId/monitor" element={<AdminMonitorPage />} />
                  <Route path="elections/:electionId/edit" element={<AdminEditElectionPage />} />
                  <Route path="academy" element={<AdminAcademyPage />} />
                  <Route path="academy/:id" element={<AdminCourseFormPage />} />
                  <Route path="academy/new" element={<AdminCourseFormPage />} />
                  <Route path="academy/:id/students" element={<AdminCourseStudentsPage />} />
                  <Route path="busla/activities" element={<AdminActivitiesPage />} />
                  <Route path="busla" element={<BuslaAdminPage />} />
                  <Route path="busla/library" element={<LibraryAdminPage />} />
                  <Route path="busla/tracks" element={<TrackDetailAdminPage />} />
                  <Route path="engagement/chat" element={<ChatAdmin />} />
                  <Route path="engagement/weekly" element={<WeeklyAdmin />} />
                  <Route path="leadership" element={<LeadershipAdmin />} />
                  <Route path="leadership/:leaderId" element={<LeadershipDetail />} />
                  <Route path="homepage" element={<HomepageManager />} />
                  <Route path="homepage/discounts" element={<DiscountsTabAdmin />} />
                  <Route path="homepage/activities" element={<ActivitiesTabAdmin />} />
                  <Route path="homepage/partners" element={<PartnersTabAdmin />} />
                  <Route path="homepage/footer" element={<FooterTabAdmin />} />
                  <Route path="info-cms" element={<InfoCMSAdmin />} />
                  <Route path="info/articles" element={<ArticlesAdmin />} />
                  <Route path="info/articles/new" element={<ArticleFormAdmin />} />
                  <Route path="info/articles/:id" element={<ArticleFormAdmin />} />
                  <Route path="info/universities" element={<UniversitiesAdmin />} />
                  <Route path="info/universities/new" element={<UniversityFormAdmin />} />
                  <Route path="info/universities/:id" element={<UniversityFormAdmin />} />
                  <Route path="info/students" element={<StudentsAdmin />} />
                  <Route path="info/students/new" element={<StudentFormAdmin />} />
                  <Route path="info/students/:id" element={<StudentFormAdmin />} />
                  <Route path="info/icons" element={<IconsAdmin />} />
                  <Route path="info/icons/new" element={<IconFormAdmin />} />
                  <Route path="info/icons/:id" element={<IconFormAdmin />} />
                  <Route path="info/achievements" element={<AchievementsAdmin />} />
                  <Route path="info/achievements/new" element={<AchievementFormAdmin />} />
                  <Route path="info/achievements/:id" element={<AchievementFormAdmin />} />

                  {/* Make sure imports above are un-commented to use these! */}
                  <Route path="info/articles" element={<ArticlesAdmin />} />
                  <Route path="info/articles/new" element={<ArticleFormAdmin />} />
                  <Route path="info/articles/:id" element={<ArticleFormAdmin />} />
                  <Route path="info/universities" element={<UniversitiesAdmin />} />
                  <Route path="info/universities/new" element={<UniversityFormAdmin />} />
                  <Route path="info/universities/:id" element={<UniversityFormAdmin />} />
                  <Route path="info/students" element={<StudentsAdmin />} />
                  <Route path="info/students/new" element={<StudentFormAdmin />} />
                  <Route path="info/students/:id" element={<StudentFormAdmin />} />
                  <Route path="info/icons" element={<IconsAdmin />} />
                  <Route path="info/icons/new" element={<IconFormAdmin />} />
                  <Route path="info/icons/:id" element={<IconFormAdmin />} />
                  <Route path="info/achievements" element={<AchievementsAdmin />} />
                  <Route path="info/achievements/new" element={<AchievementFormAdmin />} />
                  <Route path="info/achievements/:id" element={<AchievementFormAdmin />} />
                  <Route path="homepage/discounts" element={<DiscountsTabAdmin />} />
                  <Route path="homepage/activities" element={<ActivitiesTabAdmin />} />
                  <Route path="homepage/partners" element={<PartnersTabAdmin />} />
                  <Route path="homepage/footer" element={<FooterTabAdmin />} />
                </Route>

                {/* 3. PUBLIC LAYOUT PAGES (YES Navbar / Footer) */}
                <Route element={<PublicLayout />}>
                  <Route path="/about-istanbul" element={<AboutIstanbul />} />
                  <Route path="/about-yemen" element={<AboutYemen />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route path="/universities" element={<UniversitiesPage />} />
                  <Route path="/universities/:id" element={<UniversityDetail />} />
                  <Route path="/students" element={<StudentsPage />} />
                  <Route path="/students/:id" element={<StudentDetail />} />
                  <Route path="/icons" element={<IconsPage />} />
                  <Route path="/icons/:id" element={<IconDetail />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/" element={<Index />} />
                </Route>

                {/* 4. FALLBACK */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;