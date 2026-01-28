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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Edit2,
  Lock,
  LogOut,
  Trash2,
  Save,
  X,
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
  const { logout } = useAuth();

  const form = useForm<UpdateLearnerFormValues>({
    resolver: zodResolver(updateLearnerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const data = await learnerService.getLearnerProfile();
        const calculateAge = (dob?: string | null) => {
          if (!dob) return undefined;
          const birth = new Date(dob);
          if (isNaN(birth.getTime())) return undefined;
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          return age;
        };

        const normalizedData: Learner = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          profilePicture: data.profilePicture || data.avatar || undefined,
          age: calculateAge(data.dateOfBirth),
          isActive: data.isActive,
          dateOfBirth: data.dateOfBirth || ""
        };
        setLearner(normalizedData);
        form.reset({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
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
      const updatedLearner = await learnerService.updateLearnerProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      const normalizedUpdatedLearner: Learner = {
        ...learner,
        firstName: updatedLearner.firstName || learner.firstName,
        lastName: updatedLearner.lastName || learner.lastName,
        email: updatedLearner.email || learner.email,
        phoneNumber: updatedLearner.phoneNumber || learner.phoneNumber,
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
      logout();
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
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !learner) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              {error || t("account.errors.userNotFound")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("account.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("account.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={
                      learner.avatar ||
                      `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200`
                    }
                    alt={`${learner.firstName} ${learner.lastName}`}
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gray-200 text-gray-700">
                    {getInitials(`${learner.firstName} ${learner.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {`${learner.firstName} ${learner.lastName}`}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {learner.age} {t("account.yearsOld")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Informations de Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Email
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white break-all">
                    {learner.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Téléphone
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {learner.phoneNumber || "Non renseigné"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms and Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations Personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showUpdateForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-xs font-medium text-gray-500 uppercase">
                        Prénom
                      </Label>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                        {learner.firstName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500 uppercase">
                        Nom
                      </Label>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                        {learner.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500 uppercase">
                        Email
                      </Label>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-white break-all">
                        {learner.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500 uppercase">
                        Téléphone
                      </Label>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                        {learner.phoneNumber || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setShowUpdateForm(true)}
                      className="bg-accent hover:bg-accent-dark text-white"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Modifier mes informations
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={form.handleSubmit(handleUpdateProfile)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {t("account.fields.firstName")} *
                      </Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        placeholder={t("account.placeholders.firstName")}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-600 text-xs">
                          {t(form.formState.errors.firstName.message || "")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {t("account.fields.lastName")} *
                      </Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        placeholder={t("account.placeholders.lastName")}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-600 text-xs">
                          {t(form.formState.errors.lastName.message || "")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">
                        {t("account.fields.email")} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder={t("account.placeholders.email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-600 text-xs">
                          {t(form.formState.errors.email.message || "")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phoneNumber">{t("account.fields.phoneNumber")}</Label>
                      <Input
                        id="phoneNumber"
                        {...form.register("phoneNumber")}
                        placeholder={t("account.placeholders.phoneNumber")}
                      />
                      {form.formState.errors.phoneNumber && (
                        <p className="text-red-600 text-xs">
                          {t(form.formState.errors.phoneNumber.message || "")}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUpdateForm(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Sécurité</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {/* Account Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Gestion du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Se déconnecter
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Déconnectez-vous de votre compte
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={isLoggingOut}
                  onClick={async () => {
                    setIsLoggingOut(true);
                    try {
                      await logout();
                      navigate("/signin", { replace: true });
                    } catch {
                      toast.error(t("account.logout.error"));
                    } finally {
                      setIsLoggingOut(false);
                    }
                  }}
                  className="border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-red-700 mb-1">
                    Supprimer le compte
                  </h3>
                  <p className="text-sm text-red-600">
                    Cette action est irréversible. Toutes vos données seront
                    supprimées définitivement.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("account.deleteDialog.title")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("account.deleteDialog.confirmation")}
                        <br />
                        <br />
                        <strong className="text-red-600">
                          {t("account.deleteDialog.warning")}
                        </strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("account.buttons.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
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
      </div>
    </div>
  );
};

export default AccountPage;