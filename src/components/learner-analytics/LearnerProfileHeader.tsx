import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crown, Medal, Trophy, Calendar, Mail, Phone, User, CheckCircle2, XCircle, Building2 } from "lucide-react";
import type { LearnerProfileHeader as ProfileType } from "@/types/learnerAnalytics";

interface LearnerProfileHeaderProps {
  profile: ProfileType;
}

export function LearnerProfileHeader({ profile }: LearnerProfileHeaderProps) {
  const getRankingIcon = (ranking: number) => {
    if (ranking === 1) {
      return <Crown className="h-5 w-5 text-amber-500" />;
    } else if (ranking === 2) {
      return <Trophy className="h-5 w-5 text-slate-500" />;
    } else if (ranking === 3) {
      return <Medal className="h-5 w-5 text-orange-600" />;
    }
    return null;
  };

  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) return email;
    return `${local}@${domain}`;
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section: Avatar & Basic Info */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-primary/20">
              <AvatarImage src={profile.profilePicture} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="text-3xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            {/* Status Badge */}
            <div className="absolute -bottom-2 -right-2">
              <Badge className={profile.isActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 hover:bg-slate-500"}>
                {profile.isActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Actif
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactif
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Middle Section: Personal Details */}
        <div className="flex-1 space-y-3">
          {/* Name & Username */}
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-muted-foreground">@{profile.userName}</p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{maskEmail(profile.email)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{profile.phoneNumber}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>
                {profile.gender === "MALE" ? "Garçon" : "Fille"} • {calculateAge(profile.dateOfBirth)} ans
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Inscrit le {formatDate(profile.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
              <Building2 className="w-4 h-4" />
              <span>{profile.organizationName || "Tech Academy Maroc"}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Ranking & Score */}
        <div className="flex flex-col items-center justify-center gap-4 lg:min-w-[200px] p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
          {/* Global Ranking */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getRankingIcon(profile.globalRanking)}
              <span className="text-5xl font-bold text-primary">
                #{profile.globalRanking}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Classement Global
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border" />

          {/* Total Score */}
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-1">
              {profile.totalScore}
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Points Total
            </p>
          </div>

          {/* Score Sparkline/Visual (optional for V2) */}
          <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
