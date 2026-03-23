import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
// import Academy from "./pages/hidden/Academy";
// import AcademyNew from "./pages/hidden/AcademyNew";
// import CourseDetail from "./pages/hidden/CourseDetail";
// import CourseDetailNew from "./pages/hidden/CourseDetailNew";
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
// import Videos from "./pages/hidden/Videos";
import Community from "./pages/Community";
import Transparency from "./pages/Transparency";
import Notes from "./pages/profile/Notes";
// import YemenReels from "./pages/hidden/YemenReels";
// import News from "./pages/hidden/News";
import Events from "./pages/Events";
import IstanbulMap from "./pages/IstanbulMap";
import Translate from "./pages/Translate";
import SponsorPortal from "./pages/SponsorPortal";
import SponsorProfile from "./pages/SponsorProfile";
import FoundingCommittee from "./pages/FoundingCommittee";
import TurkeyApps from "./pages/TurkeyApps";
// import Doctors from "./pages/hidden/Doctors";
import Corps from "./pages/Corps";
import Partners from "./pages/Partners";
import Awn from "./pages/3wn";
// import MedicalHub from "./pages/MedicalHub";
// import MedicalCommunity from "./pages/MedicalCommunity";
// import DoctorsDirectory from "./pages/DoctorsDirectory";
// import DoctorProfile from "./pages/DoctorProfile";
// import MedicalCongress from "./pages/MedicalCongress";
// import Consultation from "./pages/Consultation";
import QuranLife from "./pages/QuranLife";
// import VisualContent from "./pages/hidden/VisualContent";
// import University from "./pages/hidden/University";
// import Orbit from "./pages/hidden/Orbit";
// import OrbitBrief from "./pages/hidden/OrbitBrief";
// import OrbitPodium from "./pages/hidden/OrbitPodium";
// import VerifyCertificate from "./pages/VerifyCertificate";
// import InstructorDashboard from "./pages/hidden/InstructorDashboard";
import AcademyPage from "./pages/academy/AcademyPage";
import CoursePage from "./pages/academy/Coursepage";
import Mylearningpage from "./pages/academy/Mylearningpage";
import CertificatePage from "./pages/academy/Certificatepage";


import ResultsPage from './pages/election/Resultspage'
import VotingPage from './pages/election/Votingpage'
import CandidatePage from './pages/election/Candidatespage'
import CandidateProfilePage from "./pages/election/Candidateprofilepage";
import CertificateVerificationPage from './pages/academy/Certificateverificationpage';
import Unionprojects from './pages/Unionprojects';
import FoundingTeam from "./pages/Foundingteam";
import ProjectDetail from './pages/Unionprojects';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AwnAdmin from "./pages/admin/3wnAdmin";
import Verify from "./pages/verify";
import JobAdmin from "./pages/admin/jobadmin";
import GuideAdmin from "./pages/admin/GuideAdmin";
import TeamAdmin from "./pages/admin/TeamAdmin";
import AppsMapAdmin from "./pages/admin/AppsMapAdmin";
import ElectionsPage from './pages/election/Electionspage'
import ElectionDetailPage from './pages/election/Electiondetailpage'
import NominationPage from './pages/election/Nominationpage'
import AdminCandidatesPage from './pages/admin/Admincandidatespage'
import AdminElectionsPage from './pages/admin/Adminelectionspage'
import AdminCreateElectionPage from "./pages/admin/Admincreateelectionpage";
import AdminMonitorPage from "./pages/admin/Adminelectionspage";
import AdminEditElectionPage from "./pages/admin/Adminelectionspage";
import AdminCourseFormPage from "./pages/admin/Admincourseformpage";
import AdminCoursesPage from "./pages/admin/Adminacademypage";
import AdminAcademyPage from "./pages/admin/Adminacademypage";
import AdminCourseStudentsPage from "./pages/admin/Admincoursestudentspage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />

          {/* 2. Wrap EVERYTHING inside the AuthProvider */}
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />

                {/* 3. Protect only the Admin Route */}
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
                  <Route path="/admin/elections/:electionId/candidates" element={<AdminCandidatesPage />} />
                  <Route path="/admin/elections" element={<AdminElectionsPage />} />
                  <Route path="/admin/elections/new" element={<AdminCreateElectionPage />} />
                  <Route path="/admin/elections/:electionId/monitor" element={<AdminMonitorPage />} />
                  <Route path="/admin/elections/:electionId/edit" element={<AdminEditElectionPage />} />
                  <Route path="/admin/academy" element={<AdminAcademyPage />} />
                  <Route path="/admin/academy/:id" element={<AdminCourseFormPage />} />
                  <Route path="/admin/academy/new" element={<AdminCourseFormPage />} />
                  <Route path="/admin/academy/:id/students" element={<AdminCourseStudentsPage />} />



                </Route>
                <Route path="/" element={<Index />} />
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
                {/* <Route path="/academy" element={<AcademyNew />} /> */}
                {/* <Route path="/academy-old" element={<Academy />} /> */}
                {/* <Route path="/academy/:courseId" element={<CourseDetailNew />} /> */}
                {/* <Route path="/academy-old/:courseId" element={<CourseDetail />} /> */}
                <Route path="/certificates" element={<Certificates />} />
                {/* <Route path="/verify/:certificateId" element={<VerifyCertificate />} /> */}
                {/* <Route path="/instructor-dashboard" element={<InstructorDashboard />} /> */}
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/suggestions" element={<Suggestions />} />
                {/* <Route path="/videos" element={<Videos />} /> */}
                <Route path="/community" element={<Community />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/3wn" element={<Awn />} />
                <Route path="/notes" element={<Notes />} />
                {/* <Route path="/yemen-reels" element={<YemenReels />} /> */}
                {/* <Route path="/news" element={<News />} /> */}
                <Route path="/events" element={<Events />} />
                <Route path="/map" element={<IstanbulMap />} />
                <Route path="/translate" element={<Translate />} />
                <Route path="/sponsor-portal" element={<SponsorPortal />} />
                <Route path="/sponsor/:sponsorId" element={<SponsorProfile />} />
                <Route path="/founding-committee" element={<FoundingCommittee />} />
                <Route path="/turkey-apps" element={<TurkeyApps />} />
                {/* <Route path="/doctors" element={<Doctors />} /> */}
                <Route path="/corps" element={<Corps />} />
                <Route path="/partners" element={<Partners />} />
                {/* <Route path="/medical-hub" element={<MedicalHub />} /> */}
                {/* <Route path="/medical-community" element={<MedicalCommunity />} /> */}
                {/* <Route path="/doctors-directory" element={<DoctorsDirectory />} /> */}
                {/* <Route path="/doctor/:doctorId" element={<DoctorProfile />} /> */}
                {/* <Route path="/medical-congress" element={<MedicalCongress />} /> */}
                {/* <Route path="/consultation/:doctorId" element={<Consultation />} /> */}
                <Route path="/quran-life" element={<QuranLife />} />
                {/* <Route path="/visual-content" element={<VisualContent />} /> */}
                {/* <Route path="/university" element={<University />} /> */}
                {/* <Route path="/orbit" element={<Orbit />} /> */}
                {/* <Route path="/orbit/brief" element={<OrbitBrief />} /> */}
                {/* <Route path="/orbit/podium" element={<OrbitPodium />} /> */}
                <Route path="/elections" element={<ElectionsPage />} />
                <Route path="/elections/:electionId" element={<ElectionDetailPage />} />
                <Route path="/elections/:electionId/nominate" element={<NominationPage />} />
                <Route path="/admin/elections/:electionId/candidates" element={<AdminCandidatesPage />} />
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


                <Route path="/verify/:id" element={<Verify />} />
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