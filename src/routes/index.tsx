import { createBrowserRouter } from "react-router-dom";

// Layouts
// import RootLayout from "@/layouts/RootLayout";
import LessonLayout from "@/layouts/LessonLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import HomeLayout from "@/layouts/HomeLayout";

// Pages
import NotFoundPage from "@/pages/NotFoundPage";
import SignUpPage from "@/pages/auth/SignUp";
import Homepage from "@/pages/home/HomePage";
import LoginPage from "@/pages/auth/SignIn";
import CoursesPage from "@/pages/courses/CoursesPage";
import ForgetPassword from "@/pages/auth/ForgetPassword";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import CourseDetailsPage from "@/pages/courses/CourseDetailsPage";
import LearnerRankingPage from "@/pages/learners/LearnerRankingPage";
import PaymentDetailsPage from "@/pages/learners/PaymentDetailsPage";
import LessonDetailsPage from "@/pages/lessons/LessonPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import AccountPage from "../pages/learners/AccountPage";
import DashboardOrganisation from "@/pages/organisation/dashboard";
import DashboardAdmin from "@/pages/admin/dashboard";
import LearnerProfilePage from "@/pages/learners/LearnerProfilePage";
import LearnerProfileAnalyticsPage from "@/pages/LearnerProfileAnalyticsPage";

import MotivationRace from "@/pages/motivation/MotivationPage";
import AdminCoursesPage from "@/pages/admin/AdminCoursesPage";
import AdminCourseDetailsPage from "@/pages/admin/AdminCourseDetailsPage";
import EditCoursePage from "@/pages/admin/EditCoursePage";
import PhaseManager from "@/components/admin/PhaseManager";

import ErrorBoundary from "@/components/ErrorBoundary";
import ActivateAccountPage from "@/pages/auth/ActivateAccount";
import ActivateAndResetPasswordPage from "@/pages/auth/ActivateAndResetPassword";
import ManagementAccessToCourseResources from "@/pages/organisation/ManagementAccessToCourseResources";
import AddCoursePage from "@/pages/admin/AddCoursePage";
import QuestionManagementPage from "@/pages/admin/QuestionManagementPage";
import OrganizationsPage from "@/pages/admin/OrganizationsPage";
import RequestsPage from "@/pages/admin/RequestsPage";

import AdminsManagementPage from "@/pages/admin/AdminsManagementPage";
import ManagementSkillsPage from "@/pages/admin/ManagementSkillsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "/signin",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "activate-account",
        element: <ActivateAccountPage />,
      },
      {
        path: "activate-and-reset-password",
        element: <ActivateAndResetPasswordPage />,
      },
      {
        path: "activate-account/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "forgetPassword",
        element: <ForgetPassword />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
      {
        path: "home",
        element: <Homepage />,
      },
      {
        path: "courses",
        element: <CoursesPage />,
      },
      {
        path: "courses/:courseId",
        element: <CourseDetailsPage />,
      },
      {
        path: "learners",
        children: [
          {
            path: "ranking",
            element: <LearnerRankingPage />,
          },
          {
            path: ":id/profile",
            element: <LearnerProfileAnalyticsPage />,
          },
          {
            path: "account",
            element: <AccountPage />,
          },
          {
            path: "payment",
            element: <PaymentDetailsPage />,
          },
        ],
      },
      {
        path: "/motivation",
        element: <MotivationRace />,
      },
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },
    ],
  },
  {
    path: "/organisation",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        index: true,
        element: <DashboardOrganisation />,
      },
      {
        path: "courses",
        element: <CoursesPage />,
      },
      {
        path: "courses/:courseId",
        element: <CourseDetailsPage />,
      },
      {
        path: "learners/:id",
        element: <LearnerProfilePage />,
      },
      {
        path: "learners/:id/profile",
        element: <LearnerProfileAnalyticsPage />,
      },
      {
        path: "students",
        element: <LearnerRankingPage userRole="organisation" />,
      },
      {
        path: "management-access-resources",
        element: <ManagementAccessToCourseResources />,
      },
      {
        path: "support",
        element: <MotivationRace />,
      },
      {
        path: "settings",
        element: <UnauthorizedPage />,
      },
    ],
  },
  // admin pages routes
  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardAdmin />,
      },
      {
        path: "courses",
        element: <AdminCoursesPage />,
      },
      {
        path: "courses/:courseId",
        element: <AdminCourseDetailsPage />,
      },
      {
        path: "learners/:id",
        element: <LearnerProfilePage />,
      },
      {
        path: "learners/:id/profile",
        element: <LearnerProfileAnalyticsPage />,
      },
      {
        path: "students",
        element: <LearnerRankingPage userRole="admin" />,
      },
      {
        path: "management-access-resources",
        element: <ManagementAccessToCourseResources />,
      },
      {
        path: "courses/new",
        element: <AddCoursePage />,
      },
      {
        path: "courses/:courseId/edit",
        element: <EditCoursePage />,
      },
      {
        path: "courses/:courseId/chapters",
        element: <PhaseManager />,
      },
      {
        path: "organizations",
        element: <OrganizationsPage />,
      },
      {
        path: "manage-admins",
        element: <AdminsManagementPage />,
      },
      {
        path: "requests",
        element: <RequestsPage />,
      },
      {
        path: "skills",
        element: <ManagementSkillsPage />,
      },
      {
        path: "courses/:courseId/questions",
        element: <QuestionManagementPage />,
      },
      {
        path: "support",
        element: <MotivationRace />,
      },
      {
        path: "settings",
        element: <UnauthorizedPage />,
      },
    ],
  },
  {
    path: "courses/:courseId/lessons",
    element: <LessonLayout />,
    children: [
      {
        index: true,
        element: <LessonDetailsPage />,
      },
      {
        path: ":lessonId",
        element: <LessonDetailsPage />,
      },
    ],
  },
  {
    path: "courses/:courseId/quiz/:quizId",
    element: <LessonLayout />,
    children: [
      {
        index: true,
        element: <LessonDetailsPage />,
      },
    ],
  },
]);

export default router;
