import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpLearnerSchema } from "@/schemas/signUpLearnerFormSchema";
import type { SignUpLearnerFormValues } from "@/schemas/signUpLearnerFormSchema";
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProfileImageUploader from "@/components/ProfileImageUploader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TermsAndConditions } from "@/components/TermsAndConditions";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react"; // Add this import
import { cn } from "@/lib/utils";
import { registerLearner } from "@/services/auth.service";

const SignUpLearner = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Initialize form with validation schema
  const form = useForm<SignUpLearnerFormValues>({
    resolver: zodResolver(signUpLearnerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "", // This will store the date as string
      gender: "male",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePicture: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignUpLearnerFormValues) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...data,
        isActive: true,
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE"
      };
      const result = await registerLearner(dataToSend);
      if (result.success) {
        setIsSuccess(true);
      } else {
        toast.error("Registration Failed", {
          description: result.message,
        });
        // Handle specific error cases
        if (result.message.toLowerCase().includes('email')) {
          form.setError('email', { message: result.message });
        } else if (result.message.toLowerCase().includes('phone')) {
          form.setError('phoneNumber', { message: result.message });
        } else if (result.message.toLowerCase().includes('password')) {
          form.setError('password', { message: result.message });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Créez une fonction de rendu personnalisée pour FormMessage
  const CustomFormMessage: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const { t } = useTranslation();
    // Si le message est une clé de traduction, traduisez-le
    if (typeof children === "string" && children.startsWith("errors.")) {
      return <p className="text-sm text-destructive">{t(children)}</p>;
    }
    // Sinon, affichez-le tel quel
    return <FormMessage>{children}</FormMessage>;
  };

  // Au début du rendu, vérifiez si l'inscription est réussie
  if (isSuccess) {
    return (
       <Card className="w-full mx-auto">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                {/* Contenu de succès existant */}
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-accent mb-2">
                    {t("signUp.signUpOrganisation.stepSummary.success.title")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("signUp.signUpOrganisation.stepSummary.success.description")}
                  </p>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t(
                      "signUp.signUpOrganisation.stepSummary.success.emailNotification"
                    )}{" "}
                    <strong>{form.getValues("email")}</strong>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center">
          <Card className="w-full mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {t("signUp.signUpLearner.title")}
              </CardTitle>
              <CardDescription>
                {t("signUp.signUpLearner.description")}
              </CardDescription>
            </CardHeader>

            <hr />

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* --- Section Photo de profil --- */}
                  <div className="space-y-4 mb-10">
                    <div className="flex flex-col items-center">
                      <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ProfileImageUploader
                                onChange={(file) => field.onChange(file)}
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* --- Informations personnelles --- */}
                  <div className="space-y-4">
                    {/* --- Ligne : Prénom et Nom --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.firstName.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "common.form.firstName.placeholder"
                                  )}
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <CustomFormMessage>
                                {form.formState.errors.firstName?.message}
                              </CustomFormMessage>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.lastName.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "common.form.lastName.placeholder"
                                  )}
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <CustomFormMessage>
                                {form.formState.errors.lastName?.message}
                              </CustomFormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* --- Ligne : Date de naissance et Genre --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.dateOfBirth.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "h-11 w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(
                                          new Date(field.value),
                                          "dd MMMM yyyy",
                                          { locale: fr }
                                        )
                                      ) : (
                                        <span>
                                          {t(
                                            "common.form.dateOfBirth.placeholder"
                                          )}
                                        </span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(date: Date | undefined) => {
                                      // Format the date as YYYY-MM-DD string for the form value
                                      field.onChange(
                                        date ? format(date, "yyyy-MM-dd") : ""
                                      );
                                    }}
                                    autoFocus
                                    disabled={(date: Date) => {
                                      // Disable future dates and dates more than 100 years ago
                                      const now = new Date();
                                      const minDate = new Date();
                                      minDate.setFullYear(
                                        now.getFullYear() - 100
                                      );
                                      return date > now || date < minDate;
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <CustomFormMessage>
                                {form.formState.errors.dateOfBirth?.message}
                              </CustomFormMessage>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.gender.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center h-11 px-3 py-2 border border-input rounded-md">
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-row space-x-6 rtl:space-x-reverse"
                                  >
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <RadioGroupItem value="male" id="male" />
                                      <FormLabel
                                        htmlFor="male"
                                        className="font-normal cursor-pointer text-sm"
                                      >
                                        {t("common.form.gender.options.male")}
                                      </FormLabel>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <RadioGroupItem
                                        value="female"
                                        id="female"
                                      />
                                      <FormLabel
                                        htmlFor="female"
                                        className="font-normal cursor-pointer text-sm"
                                      >
                                        {t("common.form.gender.options.female")}
                                      </FormLabel>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </FormControl>
                              <CustomFormMessage>
                                {form.formState.errors.gender?.message}
                              </CustomFormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* --- Ligne : Email et Téléphone --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.email.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder={t(
                                      "common.form.email.placeholder"
                                    )}
                                    {...field}
                                    className="h-11 pl-10"
                                  />
                                </FormControl>
                                <CustomFormMessage>
                                  {form.formState.errors.email?.message}
                                </CustomFormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.phone.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      "common.form.phone.placeholder"
                                    )}
                                    {...field}
                                    className="h-11 pl-10"
                                  />
                                </FormControl>
                                <CustomFormMessage>
                                  {form.formState.errors.phoneNumber?.message}
                                </CustomFormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Mots de passe --- */}
                  <div className="space-y-4">
                    {/* --- Ligne : Mot de passe et Confirmation --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.password.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t(
                                      "common.form.password.placeholder"
                                    )}
                                    {...field}
                                    className="h-11 pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    tabIndex={-1}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs text-muted-foreground">
                                {t("common.form.password.helper")}
                              </FormDescription>
                              <CustomFormMessage>
                                {form.formState.errors.password?.message}
                              </CustomFormMessage>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          {t("common.form.confirmPassword.label")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    placeholder={t(
                                      "common.form.confirmPassword.placeholder"
                                    )}
                                    {...field}
                                    className="h-11 pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                    tabIndex={-1}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <CustomFormMessage>
                                {form.formState.errors.confirmPassword?.message}
                              </CustomFormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* --- Acceptation des conditions --- */}
                  {/* Section: Conditions d'utilisation */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={form.watch("acceptTerms")}
                      className="border-2 border-primary"
                      onCheckedChange={(checked) => {
                        form.setValue("acceptTerms", checked as boolean, {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      <div className="text-sm flex flex-wrap gap-x-1 items-center">
                        <span className="font-semibold whitespace-nowrap">
                          {t("common.terms.label")}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <a className="p-0 h-auto text-primary hover:underline text-start">
                              {t("common.terms.link")}
                            </a>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <ScrollArea className="h-[60vh] w-full">
                              <TermsAndConditions userType="learner" />
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Label>
                  </div>
                  <CustomFormMessage>
                    {form.formState.errors.acceptTerms?.message}
                  </CustomFormMessage>

                  {/* --- Bouton de soumission --- */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 h-12 px-12 text-lg font-semibold min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t("signUp.signUpLearner.submit")}
                        </>
                      ) : (
                        t("signUp.signUpLearner.submit")
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground pt-4">
                    <p>
                      {t("signUp.signUpLearner.alreadyHaveAccount")}{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate("/signin")}
                        type="button"
                      >
                        {t("signUp.signUpLearner.loginHere")}
                      </Button>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUpLearner;
