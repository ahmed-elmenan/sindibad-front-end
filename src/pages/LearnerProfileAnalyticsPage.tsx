import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MOCK_LEARNER_ANALYTICS } from "@/data/mockLearnerAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearnerProfileHeader } from "@/components/learner-analytics/LearnerProfileHeader";
import { GlobalMetricsCards } from "@/components/learner-analytics/GlobalMetricsCards";
import { CourseProgressCard } from "@/components/learner-analytics/CourseProgressCard";
import { CertificateCard } from "@/components/learner-analytics/CertificateCard";
import { useState } from "react";

export default function LearnerProfileAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  const { data, isLoading, error } = useQuery({
    queryKey: ["learnerAnalytics", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_LEARNER_ANALYTICS;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
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
              Cours ({data.coursesProgress.length})
            </TabsTrigger>
            <TabsTrigger 
              value="certificates" 
              className="data-[state=active]:bg-white transition-all duration-500 ease-in-out data-[state=active]:translate-x-0 data-[state=inactive]:-translate-x-1"
            >
              Certificats ({data.certifications.totalCertificates})
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="courses" 
            className={`space-y-4 transition-all duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {data.coursesProgress.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Aucun cours inscrit pour le moment</p>
                </div>
              </Card>
            ) : (
              data.coursesProgress.map((course) => (
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
            {data.certifications.certificates.length === 0 ? (
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
                {data.certifications.certificates.map((cert) => (
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

// Skeleton de chargement
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <Skeleton className="h-10 w-32" />
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-48 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}
