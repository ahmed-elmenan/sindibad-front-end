import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAllOrganisations } from "@/services/organisation.service";
import { useAuth } from "@/hooks/useAuth";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { signUpLearnerSchema } from "@/schemas/signUpLearnerFormSchema";
import type { SignUpLearnerFormValues } from "@/schemas/signUpLearnerFormSchema";
import { registerLearner } from "@/services/auth.service";

interface AddLearnerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddLearnerModal({
  open,
  onClose,
  onSuccess,
}: AddLearnerModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [, setSelectedFile] = useState<File | null>(null);

  // Fetch organisations
  const { data: organisations = [], isLoading: isLoadingOrganisations } = useQuery({
    queryKey: ["organisations"],
    queryFn: getAllOrganisations,
  });

  const form = useForm<SignUpLearnerFormValues>({
    resolver: zodResolver(signUpLearnerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phoneNumber: "",
      email: "",
      organisationId: "",
      profilePicture: "",
      acceptTerms: true,
    },
  });

  // Si l'utilisateur est une organisation, pré-remplir et désactiver le champ
  console.log("-----------------")
  console.log(user)
  const isOrganisation = user?.role === "ORGANISATION";
  const currentOrganisationId = user?.id;

  useEffect(() => {
    if (isOrganisation && currentOrganisationId && open) {
      form.setValue("organisationId", currentOrganisationId);
    }
  }, [isOrganisation, currentOrganisationId, open, form]);

  console.log("📋 État du formulaire:", {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    values: form.getValues()
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        form.setValue("profilePicture", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage("");
    form.setValue("profilePicture", "");
  };

  const onSubmit = async (data: SignUpLearnerFormValues) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...data,
        isActive: true,
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
      };

      const result = await registerLearner(dataToSend);
      
      if (result.success) {
        console.log("✨ Succès - Affichage du toast et redirection");
        setIsSuccess(true);
        toast.success(t("common.success"), {
          description: "L'apprenant a été ajouté avec succès",
        });
        setTimeout(() => {
          console.log("🔄 Réinitialisation du formulaire et fermeture");
          onSuccess?.();
          onClose();
          form.reset();
          setPreviewImage("");
          setSelectedFile(null);
          setIsSuccess(false);
        }, 2000);
      } else {
        console.log("❌ Échec - Message:", result.message);
        toast.error(t("common.error"), {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("💥 Erreur lors de l'ajout:", error);
      toast.error(t("common.error"), {
        description: "Une erreur s'est produite lors de l'ajout de l'apprenant",
      });
    } finally {
      console.log("🏁 Fin de la soumission");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white">
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Succès !
              </h2>
              <p className="text-gray-600">
                L'apprenant a été ajouté avec succès
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[85vh] overflow-y-auto bg-white p-0">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/90 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Ajouter un apprenant test1</h2>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Remplissez les informations ci-dessous pour créer un nouveau compte apprenant
          </p>
        </div>

        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log("📝 Form onSubmit déclenché", e);
              console.log("📊 Validation errors:", form.formState.errors);
              form.handleSubmit(onSubmit)(e);
            }} 
            className="p-6 space-y-6"
          >
            {/* Photo de profil */}
            <div className="flex justify-center">
              <div className="relative">
                <div className={cn(
                  "w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center",
                  previewImage && "border-primary"
                )}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-500">Photo</span>
                    </div>
                  )}
                </div>
                {previewImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-5">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prénom */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Prénom <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le prénom"
                          {...field}
                          className="h-11 border-gray-300 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nom */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Nom <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le nom"
                          {...field}
                          className="h-11 border-gray-300 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date de naissance */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2">
                        Date de naissance <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 w-full justify-start text-left font-normal border-gray-300",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy")
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date: Date | undefined) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                            }}
                            disabled={(date: Date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Genre */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Genre <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-300">
                            <SelectValue placeholder="Sélectionner le genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-5">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations de contact</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="exemple@email.com"
                          {...field}
                          className="h-11 border-gray-300 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Téléphone */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Téléphone <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="06XXXXXXXX"
                          {...field}
                          className="h-11 border-gray-300 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Informations du compte */}
            <div className="space-y-5">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations du compte</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Organisation */}
                <FormField
                  control={form.control}
                  name="organisationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Organisation <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoadingOrganisations || isOrganisation}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-300">
                            <SelectValue
                              placeholder={
                                isLoadingOrganisations
                                  ? "Chargement..."
                                  : isOrganisation
                                  ? "Mon organisation"
                                  : "Sélectionner une organisation"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organisations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 px-8"
                onClick={(e) => {
                  console.log("🖱️ Bouton Ajouter cliqué", e);
                  console.log("🔍 Type du bouton:", e.currentTarget.type);
                  console.log("📝 Valeurs du formulaire:", form.getValues());
                  console.log("❌ Erreurs de validation:", form.formState.errors);
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ajouter l'apprenant
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
