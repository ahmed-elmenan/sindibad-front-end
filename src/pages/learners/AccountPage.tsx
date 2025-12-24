import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { learnerService } from "@/services/learner.service";
import { updateLearnerFormSchema } from "@/schemas/learnerSchema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Learner } from "@/types/Learner";
import type { UpdateLearnerFormValues } from "@/schemas/learnerSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Trash2,
  Save,
  X,
  Shield,
  AlertTriangle,
  LogOut, // Add this import
} from "lucide-react";
import ChangePasswordForm from "@/components/form/ChangePasswordForm";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {logout} = useAuth();

  const form = useForm<UpdateLearnerFormValues>({
    resolver: zodResolver(updateLearnerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const data = await learnerService.getLearnerProfile();
        const normalizedData: Learner = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
        };
        setLearner(normalizedData);
        form.reset({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        });
      } catch (err) {
        setError(t("account.errors.loadingFailed"));
        console.error("Error fetching learner profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearner();
  }, [form, t]);

  const handleUpdateProfile = async (data: UpdateLearnerFormValues) => {
    if (!learner) return;

    try {
      // Ensure consistent field naming when sending to backend
      const updatedLearner = await learnerService.updateLearnerProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      // Normalize the response data
      const normalizedUpdatedLearner: Learner = {
        ...learner,
        firstName: updatedLearner.firstName || learner.firstName,
        lastName: updatedLearner.lastName || learner.lastName,
        email: updatedLearner.email || learner.email,
        phone: updatedLearner.phone || learner.phone,
        avatar: updatedLearner.avatar || learner.avatar,
      };

      setLearner(normalizedUpdatedLearner);
      setShowUpdateForm(false);
      toast.success(t("account.success.profileUpdated"));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(t("account.errors.updateFailed"));
      toast.error(t("account.errors.updateFailed"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!learner) return;

    try {
      await learnerService.deleteLearnerAccount();
      setLearner(null);
      toast.success(t("account.success.accountDeleted"));
      // Ensure proper cleanup
      logout();
      // Use the imported navigate function
      navigate("/signin", { replace: true });
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(t("account.errors.deleteFailed"));
      toast.error(t("account.errors.deleteFailed"));
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              {t("account.errors.userNotFound")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("account.title")}
          </h1>
          <p className="text-muted-foreground">{t("account.description")}</p>
        </div>
        <Badge variant="secondary" className="hidden sm:flex">
          <Shield className="w-3 h-3 mr-1" />
          {t("account.status.active")}
        </Badge>
      </div>

      {/* Profile Information Card */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className=" from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>{t("account.sections.personalInfo")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24 ring-2 ring-primary/10 shadow-lg">
              <AvatarImage
                src={
                  learner.avatar ||
                  `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=128`
                }
                alt={`${learner.firstName} ${learner.lastName}'s avatar`}
              />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {getInitials(`${learner.firstName} ${learner.lastName}`)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("account.fields.fullName")}
                    </p>
                    <p className="text-lg font-semibold text-foreground">{`${learner.firstName} ${learner.lastName}`}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("account.fields.email")}
                    </p>
                    <p className="text-lg font-semibold text-foreground break-all">
                      {learner.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 md:col-span-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("account.fields.phone")}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {learner.phone || t("account.fields.phoneNotSet")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>{t("account.sections.updateInfo")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showUpdateForm ? (
            <Button
              onClick={() => setShowUpdateForm(true)}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {t("account.buttons.updateInfo")}
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {t("account.sections.updateProfile")}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              <form
                onSubmit={form.handleSubmit(handleUpdateProfile)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      {t("account.fields.firstName")} *
                    </Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="h-10"
                      placeholder={t("account.placeholders.firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-destructive text-sm font-medium">
                        {t(form.formState.errors.firstName.message || "")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      {t("account.fields.lastName")} *
                    </Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="h-10"
                      placeholder={t("account.placeholders.lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-destructive text-sm font-medium">
                        {t(form.formState.errors.lastName.message || "")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t("account.fields.email")} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="h-10"
                      placeholder={t("account.placeholders.email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-destructive text-sm font-medium">
                        {t(form.formState.errors.email.message || "")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {t("account.fields.phone")}
                    </Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      className="h-10"
                      placeholder={t("account.placeholders.phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-destructive text-sm font-medium">
                        {t(form.formState.errors.phone.message || "")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="flex-1 sm:flex-none"
                    size="lg"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t("account.buttons.updating")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t("account.buttons.saveChanges")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateForm(false)}
                    className="flex-1 sm:flex-none"
                    size="lg"
                  >
                    {t("account.buttons.cancel")}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <ChangePasswordForm />

      {/* Add this new card before the Delete Account Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LogOut className="h-5 w-5" />
            <span>{t("account.sections.logout")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-x-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("account.logout.description")}
            </p>
            <Button
              variant="destructive"
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await logout();
                  navigate("/signin", { replace: true });
                } catch {
                  toast.error(
                    <>
                      <strong>{t("account.logout.error")}</strong>
                      <div>{t("account.logout.error_description")}</div>
                    </>
                  );
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t("account.buttons.logging_out")}
                </div>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("account.buttons.logout")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{t("account.sections.dangerZone")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-x-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-destructive mb-2">
                {t("account.sections.deleteAccount")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("account.deleteWarning")}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("account.buttons.deleteAccount")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>{t("account.deleteDialog.title")}</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>{t("account.deleteDialog.confirmation")}</p>
                    <p className="text-sm">
                      {t("account.deleteDialog.warning")}
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:space-x-2">
                  <AlertDialogCancel>
                    {t("account.buttons.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {t("account.buttons.confirmDelete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
