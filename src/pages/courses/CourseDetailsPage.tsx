"use client";

import { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/course/skeletons";
import ReviewsSection from "@/components/course/ReviewsSection";
import StarRating from "@/components/course/StarRating";
import CourseContentTree from "@/components/course/CourseContentTree";
import {
  AlertCircle,
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  Users,
  Award,
  Video,
  LogIn,
  Eye,
  CreditCard,
} from "lucide-react";
import {
  useCourse,
  useCourseReviews,
  useCourseChapters,
  useCourseSubscription,
} from "@/hooks/useCourseQueries";
import { enrollInCourse } from "@/services/course.service";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";

export default function CourseDetailsPage() {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const enrollButtonRef = useRef<HTMLButtonElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRibModal, setShowRibModal] = useState(false);
  const [copiedRib, setCopiedRib] = useState(false);

  // Check if user is an organisation
  const isOrganisation = user?.role === "ORGANISATION";

  // RIB information (à configurer selon vos besoins)
  const ribInfo = {
    bankName: "Banque Populaire",
    rib: "123 456 789012345678901234",
    accountHolder: "SINDIBAD E-LEARNING",
    swift: "BCPOMAMC",
  };

  // React Query hooks to fetch data
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: reviews = [], isLoading: reviewsLoading } =
    useCourseReviews(courseId);
  const { data: chapters = [] } = useCourseChapters(courseId);
  const { data: CourseSubscription } = useCourseSubscription(courseId);

  // Logic to determine button state and actions
  const getButtonState = () => {
    if (!CourseSubscription || !CourseSubscription.loggedIn) {
      return {
        text: t("courseDetails.signIn"),
        disabled: false,
        action: "login",
        icon: LogIn,
        colorClass:
          "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
      };
    }

    if (CourseSubscription.subscription) {
      // If subscription is pending, show payment button
      if (CourseSubscription.subscription.status === "PENDING") {
        return {
          text: t("courseDetails.paymentInfo"),
          disabled: false,
          action: "payment",
          icon: CreditCard,
          colorClass:
            "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white",
        };
      }

      // If subscription is active, show view course button
      return {
        text: t("courseDetails.viewCourses"),
        disabled: false,
        action: "viewCourses",
        icon: Eye,
        colorClass:
          "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
      };
    }

    return {
      text: isOrganisation ? t("courseDetails.enrollNow") : t("courseDetails.enrollNow"),
      disabled: false,
      action: "enroll",
      icon: ShoppingCart,
      colorClass:
        "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white",
    };
  };

  const buttonState = getButtonState();

  // Function to copy RIB to clipboard
  const copyRibToClipboard = () => {
    navigator.clipboard.writeText(ribInfo.rib);
    setCopiedRib(true);
    toast.success("RIB copié dans le presse-papier");
    setTimeout(() => setCopiedRib(false), 2000);
  };

  // Function to handle button click
  const handleButtonClick = async () => {
    switch (buttonState.action) {
      case "login":
        // Redirect to signin page
        navigate("/signin");
        break;
      case "viewCourses":
        // Redirect to course lessons
        navigate(`/courses/${courseId}/lessons`);
        break;
      case "payment":
        // Show RIB modal instead of redirecting
        setShowRibModal(true);
        break;
      case "enroll": {
        // Show confirmation modal (backend will validate learners count)
        setShowConfirmModal(true);
        break;
      }
      default:
        break;
    }
  };

  // Function to confirm and process enrollment
  const confirmEnrollment = async () => {
    setShowConfirmModal(false);

    setIsEnrolling(true);
    const loadingToast = toast.loading(t("courseDetails.enrolling"));

    try {
          if (!courseId) {
            toast.error({
              title: t("courseDetails.enrollmentError"),
              description: t("courseDetails.courseIdMissing"),
            });
            setIsEnrolling(false);
            return;
          }
          const enrollmentData = {
            courseId: courseId
          };

          const response = await enrollInCourse(enrollmentData);

          // Dismiss the loading toast
          toast.dismiss(loadingToast);

          if (response.success) {
            // Enrollment success
            toast.success({
              title: t("courseDetails.enrollmentSuccess"),
              description: t("courseDetails.enrollmentSuccessDescription"),
            });

            // Refetch query to get new subscription information
            // Use the same key as in useCourseSubscription
            await queryClient.refetchQueries({
              queryKey: ["user-data", courseId],
            });

            // Also force cache update to be sure
            await queryClient.invalidateQueries({
              queryKey: ["user-data", courseId],
            });

          } else {
            // Enrollment failed
            toast.error({
              title: t("courseDetails.enrollmentError"),
              description:
                response.message ||
                t("courseDetails.enrollmentErrorDescription"),
            });
          }
        } catch (error: any) {
          console.error("Error during enrollment:", error);
          toast.dismiss(loadingToast);
          toast.error({
            title: t("courseDetails.enrollmentError"),
            description:
              error.message || t("courseDetails.enrollmentErrorDescription"),
          });
        } finally {
          setIsEnrolling(false);
        }
  };

  // Function to determine if user can create/edit reviews
  const canManageReviews = () => {
    return !!CourseSubscription?.loggedIn && !!CourseSubscription?.subscription;
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  // Calculate total course duration by summing all lessons (duration is in seconds)
  const totalCourseDurationInSeconds = chapters.reduce((total, chapter) => {
    const chapterDuration = (chapter.lessons ?? []).reduce(
      (chapterTotal, lesson) => {
        return chapterTotal + lesson.duration;
      },
      0
    );
    return total + chapterDuration;
  }, 0);
  
  // Convert seconds to minutes
  const totalCourseDuration = Math.round(totalCourseDurationInSeconds / 60);

  // Function to format duration (expects minutes)
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${t("courseDetails.chapterAccordion.hours")}`;
      } else if (hours === 0) {
        return `${remainingMinutes} ${t(
          "courseDetails.chapterAccordion.minutes"
        )}`;
      } else {
        return `${hours} ${t(
          "courseDetails.chapterAccordion.hours"
        )} ${remainingMinutes} ${t("courseDetails.chapterAccordion.minutes")}`;
      }
    } else {
      return `${minutes} ${t("courseDetails.chapterAccordion.minutes")}`;
    }
  };

  // Loading state - bloquer uniquement si le cours n'est pas chargé
  // Les autres composants afficheront leurs propres skeletons
  if (courseLoading) {
    return (
      <>
        <CourseDetailsSkeleton />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t("courseDetails.notFoundTitle")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("courseDetails.notFoundDescription")}
            </p>
            <Link to="/courses">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("courseDetails.backToCourses")}
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Guard clause pour s'assurer que nous avons les données
  if (!course) {
    return <CourseDetailsSkeleton />;
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "débutant":
        return "badge-level-beginner";
      case "intermédiaire":
        return "badge-level-intermediate";
      case "avancé":
        return "badge-level-advanced";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <>
      <div className="min-h-screen gradient-bg">
        <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 md:py-8 space-y-6 md:space-y-8">
          <div className="grid lg:grid-cols-[1.8fr_1.2fr] gap-6 md:gap-8">
            {/* Main content */}
            <div className="space-y-6 md:space-y-8">
              {/* Hero section */}
              <div className="space-y-4 px-2 md:px-0">
                <div className="aspect-[16/9] md:aspect-[2/1] overflow-hidden rounded-lg md:rounded-xl shadow-lg max-h-60 md:max-h-80">
                  <img
                    src={
                      course.imgUrl || "/react.png"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-orange-50/80 text-orange-700 border-orange-200/60"
                    >
                      {course.category}
                    </Badge>
                  </div>

                  <h1 className="text-2xl md:text-4xl font-bold text-gray-800 leading-tight">
                    {course.title}
                  </h1>

                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Detailed description */}
              <Card className="bg-white border border-orange-100/50 mx-2 md:mx-0">
                <CardHeader className="px-4 md:px-6">
                  <CardTitle className="text-lg md:text-xl font-semibold text-gray-800">
                    {t("courseDetails.aboutTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {course.description}
                  </p>
                  {course.features && course.features.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {t("courseDetails.aboutLearn")}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {course.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            <span className="text-gray-700 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content/Chapters */}
              <div className="mx-2 md:mx-0">
                <Card className="bg-white border border-orange-100/50">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-800">
                      {t("courseDetails.contentTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <CourseContentTree courseId={courseId!} />
                  </CardContent>
                </Card>
              </div>

              {/* Reviews */}
              <div className="mx-2 md:mx-0">
                {reviewsLoading ? (
                  <div className="bg-white rounded-lg border p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ReviewsSection
                    reviews={reviews}
                    courseId={courseId!}
                    canManageReviews={canManageReviews()}
                  />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="px-2 md:px-0">
              <div className="space-y-6 lg:sticky lg:top-8">
                {/* Price and information */}
                <Card className="bg-white border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                  {!CourseSubscription?.subscription && !isOrganisation && (
                    <CardHeader className="text-center space-y-4 px-4 md:px-6">
                      {/* Show price only if user is not subscribed and not organisation */}
                      <div className="space-y-2">
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                          {course.price} MAD
                        </div>
                        <p className="text-gray-600 text-sm">
                          {t("courseDetails.basePrice")}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        {reviewsLoading ? (
                          <div className="flex items-center gap-2 animate-pulse">
                            <div className="h-5 w-24 bg-gray-200 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          </div>
                        ) : (
                          <>
                            <StarRating rating={averageRating} size="md" />
                            <span className="text-sm text-gray-600">
                              ({reviews.length}{" "}
                              {t("courseDetails.reviewsSection.reviewsCount")})
                            </span>
                          </>
                        )}
                      </div>
                    </CardHeader>
                  )}
                  <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
                    {/* Show button only for non-subscribed users or with ACTIVE status */}
                    {(!CourseSubscription?.subscription ||
                      CourseSubscription?.subscription?.status ===
                        "ACTIVE") && (
                      <Button
                        ref={enrollButtonRef}
                        onClick={handleButtonClick}
                        disabled={buttonState.disabled}
                        className={`w-full py-3 md:py-4 text-sm md:text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[3rem] ${buttonState.colorClass}`}
                      >
                        <buttonState.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                        <span className="text-center leading-tight">{buttonState.text}</span>
                      </Button>
                    )}

                    {/* Display subscription information if user is subscribed */}
                    {CourseSubscription?.subscription && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                          <h5 className="font-semibold text-gray-800">
                            {t("courseDetails.subscriptionInfo")}
                          </h5>
                        </div>

                        {/* Special message for PENDING status */}
                        {CourseSubscription.subscription.status ===
                          "PENDING" && (
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50/50 border border-yellow-300 rounded-lg p-4 space-y-3 animate-pulse">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-semibold text-yellow-800">
                                {t("courseDetails.pendingSubscription.title")}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700 leading-relaxed">
                              {t("courseDetails.pendingSubscription.message")}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-yellow-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                {t("courseDetails.pendingSubscription.note")}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Number of learners */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("courseDetails.subscriptionLearners")}
                            </span>
                            <span className="font-medium text-gray-800">
                              {CourseSubscription.learnersCount}{" "}
                              {CourseSubscription.learnersCount > 1
                                ? t("courseDetails.learners")
                                : t("courseDetails.learner")}
                            </span>
                          </div>

                          {/* Price information - only show if not organisation */}
                          {!isOrganisation && (
                            <>
                              {/* Unit price */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  {t("courseDetails.subscriptionUnitPrice")}
                                </span>
                                <span className="font-medium text-gray-800">
                                  {CourseSubscription.subscription.unitPrice} MAD
                                </span>
                              </div>

                              {/* Discount */}
                              {CourseSubscription.subscription.discountPercentage >
                                0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {t("courseDetails.subscriptionDiscount")}
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {
                                      CourseSubscription.subscription
                                        .discountPercentage
                                    }
                                    %
                                  </span>
                                </div>
                              )}

                              {/* Price calculations */}
                              <div className="space-y-2 text-sm border-t pt-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    {t("courseDetails.subscriptionSubtotal")}
                                  </span>
                                  <span className="font-medium">
                                    {(
                                      CourseSubscription.subscription.unitPrice *
                                      CourseSubscription.learnersCount
                                    ).toFixed(2)}{" "}
                                    MAD
                                  </span>
                                </div>
                                {CourseSubscription.subscription
                                  .discountPercentage > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-green-600">
                                      {t(
                                        "courseDetails.subscriptionDiscountAmount"
                                      )}{" "}
                                      (
                                      {
                                        CourseSubscription.subscription
                                          .discountPercentage
                                      }
                                      %)
                                    </span>
                                    <span className="font-medium text-green-600">
                                      -
                                      {(
                                        (CourseSubscription.subscription.unitPrice *
                                          CourseSubscription.learnersCount *
                                          CourseSubscription.subscription
                                            .discountPercentage) /
                                        100
                                      ).toFixed(2)}{" "}
                                      MAD
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                  <span className="text-gray-800">
                                    {t("courseDetails.subscriptionTotal")}
                                  </span>
                                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                                    {(
                                      CourseSubscription.subscription.unitPrice *
                                        CourseSubscription.learnersCount -
                                      (CourseSubscription.subscription.unitPrice *
                                        CourseSubscription.learnersCount *
                                        CourseSubscription.subscription
                                          .discountPercentage) /
                                        100
                                    ).toFixed(2)}{" "}
                                    MAD
                                  </span>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Dates */}
                          {CourseSubscription.subscription.startDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {t("courseDetails.subscriptionStartDate")}
                              </span>
                              <span className="font-medium text-gray-800">
                                {new Date(
                                  CourseSubscription.subscription.startDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {CourseSubscription.subscription.endDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {t("courseDetails.subscriptionEndDate")}
                              </span>
                              <span className="font-medium text-gray-800">
                                {new Date(
                                  CourseSubscription.subscription.endDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Payment button for PENDING status */}
                        {CourseSubscription.subscription.status ===
                          "PENDING" && (
                          <Button
                            onClick={handleButtonClick}
                            disabled={buttonState.disabled}
                            className={`w-full px-4 py-3 md:py-4 text-sm md:text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[3rem] ${buttonState.colorClass}`}
                          >
                            <buttonState.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                            <span className="text-center leading-tight">{buttonState.text}</span>
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                        {t("courseDetails.includesTitle")}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Video className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                          <span className="text-gray-700 text-sm md:text-base">
                            {formatDuration(totalCourseDuration)}{" "}
                            {t("courseDetails.videoHours")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                          <span className="text-gray-700 text-sm md:text-base">
                            {t("courseDetails.lifetimeAccess")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                          <span className="text-gray-700 text-sm md:text-base">
                            {t("courseDetails.certificate")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                          <span className="text-gray-700 text-sm md:text-base">
                            {t("courseDetails.communitySupport")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Confirmer la demande de souscription
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Veuillez vérifier les informations avant de confirmer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Organisation</p>
                <p className="text-base font-semibold text-gray-900">{user?.name || user?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-medium">Cours</p>
                <p className="text-base font-semibold text-gray-900">{course?.title}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Après confirmation, votre demande sera en attente de validation. 
                Vous recevrez les instructions de paiement.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isEnrolling}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmEnrollment}
              disabled={isEnrolling}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {isEnrolling ? "En cours..." : "Confirmer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RIB Modal for PENDING payments */}
      <Dialog open={showRibModal} onOpenChange={setShowRibModal}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Informations de paiement
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Effectuez le virement bancaire avec les coordonnées ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Banque</p>
                <p className="text-base font-semibold text-gray-900">{ribInfo.bankName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-medium">Bénéficiaire</p>
                <p className="text-base font-semibold text-gray-900">{ribInfo.accountHolder}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-medium">RIB</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300">
                    {ribInfo.rib}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyRibToClipboard}
                    className="shrink-0"
                  >
                    {copiedRib ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important :</strong> Après avoir effectué le virement, 
                veuillez conserver votre reçu. Votre souscription sera activée après validation du paiement.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowRibModal(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
