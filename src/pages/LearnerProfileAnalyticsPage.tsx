import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearnerProfileHeader } from "@/components/learner-analytics/LearnerProfileHeader";
import { GlobalMetricsCards } from "@/components/learner-analytics/GlobalMetricsCards";
import { CourseProgressCard } from "@/components/learner-analytics/CourseProgressCard";
import { CertificateCard } from "@/components/learner-analytics/CertificateCard";
import { LearnerProfileHeaderSkeleton } from "@/components/learner-analytics/LearnerProfileHeaderSkeleton";
import { GlobalMetricsCardsSkeleton } from "@/components/learner-analytics/GlobalMetricsCardsSkeleton";
import { CourseProgressListSkeleton } from "@/components/learner-analytics/CourseProgressCardSkeleton";
import { CertificatesListSkeleton } from "@/components/learner-analytics/CertificateCardSkeleton";
import { useLearnerAnalytics, useLearnerCertificates } from "@/hooks/useLearnerAnalytics";
import { useState } from "react";

export default function LearnerProfileAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  // Charger les analytics (profile + métriques + cours) - SANS certificats
  const { data, isLoading, error } = useLearnerAnalytics(id!);

  // Charger les certificats UNIQUEMENT quand l'onglet Certificats est actif (lazy loading)
  const { 
    data: certificates, 
    isLoading: isLoadingCertificates 
  } = useLearnerCertificates(id!, activeTab === "certificates");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 space-y-8">
          {/* Back Button Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
            <div className="h-8 w-64 bg-gray-300 rounded animate-pulse" />
          </div>
          
          <LearnerProfileHeaderSkeleton />
          
          <div className="space-y-4">
            <div className="h-7 w-48 bg-gray-300 rounded animate-pulse" />
            <GlobalMetricsCardsSkeleton />
          </div>
          
          <CourseProgressListSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement du profil. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center gap-3">
          <Link to="/admin/students">
            <Button
              variant="ghost"
              size="icon"
              className="group rounded-full h-10 w-10 bg-gray-100 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-200 transition-all duration-300 hover:scale-105 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 group-hover:text-orange-600 transition-colors duration-300" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Profile - {data.profile.firstName} {data.profile.lastName}
          </h1>
        </div>
        
        <LearnerProfileHeader profile={data.profile} />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Métriques Globales</h3>
          <GlobalMetricsCards metrics={data.globalMetrics} />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setIsTransitioning(true);
          setTimeout(() => {
            setActiveTab(value);
            setTimeout(() => setIsTransitioning(false), 50);
          }, 300);
        }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200">
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-white transition-all duration-500 ease-in-out data-[state=active]:translate-x-0 data-[state=inactive]:translate-x-1"
            >
              Cours ({data.coursesProgress?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="certificates" 
              className="data-[state=active]:bg-white transition-all duration-500 ease-in-out data-[state=active]:translate-x-0 data-[state=inactive]:-translate-x-1"
            >
              Certificats ({certificates?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="courses" 
            className={`space-y-4 transition-all duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {!data.coursesProgress || data.coursesProgress.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Aucun cours inscrit pour le moment</p>
                </div>
              </Card>
            ) : (
              data.coursesProgress.map((course: any) => (
                <CourseProgressCard key={course.courseId} course={course} />
              ))
            )}
          </TabsContent>

          <TabsContent 
            value="certificates" 
            className={`space-y-4 transition-all duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {isLoadingCertificates ? (
              <CertificatesListSkeleton />
            ) : !certificates || certificates.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Aucun certificat obtenu pour le moment</p>
                  <p className="text-sm mt-2">
                    Complétez un cours pour obtenir votre premier certificat !
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert: any) => (
                  <CertificateCard key={cert.certificateId} certificate={cert} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
