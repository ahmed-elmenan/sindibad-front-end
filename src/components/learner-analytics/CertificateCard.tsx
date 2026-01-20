import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import type { CertificateDetail } from "@/types/learnerAnalytics";

interface CertificateCardProps {
  certificate: CertificateDetail;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-600">Excellent</Badge>;
    } else if (score >= 80) {
      return <Badge className="bg-blue-600">Très bien</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-yellow-600">Bien</Badge>;
    }
    return <Badge variant="secondary">Passable</Badge>;
  };

  const handleDownload = () => {
    window.open(certificate.certificateUrl, "_blank");
  };

  const daysSinceIssued = Math.floor(
    (new Date().getTime() - new Date(certificate.issuedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-full">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{certificate.courseTitle}</h3>
            <p className="text-sm text-muted-foreground">Certificat de complétion</p>
          </div>
          {daysSinceIssued <= 7 && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Nouveau
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="pt-4">
        {/* Certificate Thumbnail */}
        {certificate.courseThumbnail && (
          <div className="mb-4">
            <img
              src={certificate.courseThumbnail}
              alt={certificate.courseTitle}
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x120?text=Certificate";
              }}
            />
          </div>
        )}

        {/* Score & Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Score final</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{certificate.finalScore}%</span>
              {getScoreBadge(certificate.finalScore)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Obtenu le {formatDate(certificate.issuedDate)}</span>
          </div>

          {certificate.verificationCode && (
            <div className="p-2 bg-muted/30 rounded-md text-center">
              <p className="text-xs text-muted-foreground mb-1">Code de vérification</p>
              <code className="text-sm font-mono font-semibold">{certificate.verificationCode}</code>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
