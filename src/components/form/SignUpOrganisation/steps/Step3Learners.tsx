import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  AlertTriangle,
} from "lucide-react";

// Context & Custom Components
import { useFormContext } from "@/contexts/SignUpOrgFormContext";
import { TermsAndConditions } from "@/components/TermsAndConditions";
import { learnersSchema } from "@/schemas/signUpOrgFormShema";
import type { LearnersData } from "@/schemas/signUpOrgFormShema";
import {
  downloadTemplate,
  handleFileUpload,
  handleRemoveFile,
  type ValidationError,
  type HeaderValidationResult,
} from "@/services/organisation.service";

// ============================================================
// Types
// ============================================================

type RawLearner = {
  nom: string;
  prenom: string;
  date_de_naissance: string;
  email: string | { text: string };
  telephone: string;
  sexe: string;
};

// ============================================================
// Main Component
// ============================================================

export const Step3Learners: React.FC = () => {
  // ============================================================
  // Hooks & State
  // ============================================================
  const { t } = useTranslation();
  const { formData, updateFormData, setCurrentStep } = useFormContext();

  // État pour gérer le fichier Excel
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<RawLearner[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [headerValidation, setHeaderValidation] = useState<HeaderValidationResult | null>(null);
  const [, setSubmitAttempt] = useState(0);

  // Configuration React Hook Form
  const form = useForm<LearnersData>({
    resolver: zodResolver(learnersSchema),
    defaultValues: formData.learners || { acceptTerms: false },
    mode: "onSubmit",
  });

  // Fonction pour restaurer l'état depuis le contexte
  const restoreStateFromContext = () => {
    const savedData = formData.learners;
    if (savedData) {
      // Restaurer le fichier et les données Excel
      if (savedData.excelFile) {
        setUploadedFile(savedData.excelFile);
      }
      if (savedData.excelData) {
        setExcelData(savedData.excelData);
      }
      
      // Si on a des données valides, considérer la validation comme réussie
      if (savedData.excelFile && savedData.excelData && savedData.excelData.length > 0) {
        setHeaderValidation({ isValid: true, missingHeaders: [], incorrectHeaders: [], extraHeaders: [] });
        setValidationErrors([]);
        setFileError(null);
      }
    }
  };

  // Réinitialiser le formulaire ET l'état quand les données changent ou au montage
  useEffect(() => {
    form.reset(formData.learners || { acceptTerms: false });
    restoreStateFromContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, formData.learners]);

  // ============================================================
  // Event Handlers
  // ============================================================

  // Dans Step3Learners.tsx, ajoutez cette fonction helper
  const resetFileInput = () => {
    const fileInput = document.getElementById("excel-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Ajoutez cette fonction pour forcer la réinitialisation si nécessaire
  const forceResetAllStates = () => {
    setFileError(null);
    setValidationErrors([]);
    setHeaderValidation(null);
    setUploadedFile(null);
    setExcelData([]);
    form.setValue("excelFile", undefined);

    // Reset l'input file
    const fileInput = document.getElementById("excel-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    
    // Mettre à jour le contexte pour supprimer les données
    updateFormData("learners", {
      acceptTerms: form.getValues("acceptTerms"),
      excelFile: undefined,
      excelData: []
    });
  };

  /**
   * Soumet le formulaire après validation
   */
  const onSubmit = (data: LearnersData) => {
    // Vérifier qu'il n'y a pas d'erreurs de validation
    if (validationErrors.length > 0) {
      setFileError("Veuillez corriger toutes les erreurs avant de continuer.");
      return;
    }

    if (headerValidation && !headerValidation.isValid) {
      setFileError("Les en-têtes du fichier Excel ne sont pas conformes au modèle.");
      return;
    }

    const submissionData = {
      ...data,
      excelFile: uploadedFile || undefined,
      excelData: excelData,
    };

    updateFormData("learners", submissionData);
    setCurrentStep(3);
  };

  /**
   * Handler de soumission avec gestion des erreurs
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempt((prev) => prev + 1);

    form.handleSubmit(
      (validatedData) => onSubmit(validatedData),
      (errors) => console.error("Validation failed:", errors)
    )();
  };

  // Handler pour la suppression du fichier mis à jour
  const handleRemoveFileWithContext = () => {
    handleRemoveFile({
      setUploadedFile,
      setExcelData,
      form,
      setValidationErrors,
      setHeaderValidation,
      setFileError,
    });
    
    // Mettre à jour le contexte immédiatement
    updateFormData("learners", {
      acceptTerms: form.getValues("acceptTerms"),
      excelFile: undefined,
      excelData: []
    });
  };

  // Handler pour l'upload de fichier mis à jour
  const handleFileUploadWithContext = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileUpload(
        e,
        setFileError,
        setUploadedFile,
        setExcelData,
        form,
        t,
        setValidationErrors,
        setHeaderValidation
      );
      
    } catch (error) {
      console.error("Erreur lors du traitement du fichier:", error);
      forceResetAllStates();
      return;
    }

    // Toujours réinitialiser l'input après traitement
    resetFileInput();
  };

  // Calculer si le bouton submit doit être désactivé
  const isSubmitDisabled =
    validationErrors.length > 0 ||
    (headerValidation && !headerValidation.isValid) ||
    !form.watch("acceptTerms");

  // ============================================================
  // Render UI
  // ============================================================

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-secondary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t("signUp.signUpOrganisation.step3Learners.title")}
        </CardTitle>
        <CardDescription>
          {t("signUp.signUpOrganisation.step3Learners.description")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Section: Téléchargement du modèle */}
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center space-y-4">
                <Download className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">
                    {t("signUp.signUpOrganisation.step3Learners.downloadTemplate.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("signUp.signUpOrganisation.step3Learners.downloadTemplate.description")}
                  </p>
                </div>
                <Button variant="outline" type="button" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("signUp.signUpOrganisation.step3Learners.downloadTemplate.button")}
                </Button>
              </div>
            </div>

            {/* Section: Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong className="text-red-600">
                  {t("signUp.signUpOrganisation.step3Learners.instructions.title")}:
                </strong>{" "}
                {t("signUp.signUpOrganisation.step3Learners.instructions.content")}
              </AlertDescription>
            </Alert>

            {/* Section: Import du fichier */}
            <div className="space-y-2">
              <Label>
                {t("signUp.signUpOrganisation.step3Learners.upload.label")}
              </Label>

              {/* Zone de drop pour fichier */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById("excel-upload")?.click()}
              >
                <div className="text-center space-y-4">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground hover:text-primary transition-colors" />
                  <div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUploadWithContext}
                      className="hidden"
                      id="excel-upload"
                    />
                    <Label
                      htmlFor="excel-upload"
                      className="cursor-pointer text-primary hover:text-primary/80 text-center block mb-2 pointer-events-none"
                    >
                      {t("signUp.signUpOrganisation.step3Learners.upload.placeholder")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 pointer-events-none">
                      {t("signUp.signUpOrganisation.step3Learners.upload.formats")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Affichage des erreurs de fichier */}
              {fileError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}

              {/* Validation des en-têtes */}
              {headerValidation && !headerValidation.isValid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Erreurs dans les en-têtes Excel :</p>
                      {headerValidation.missingHeaders.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">En-têtes manquants :</p>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {headerValidation.missingHeaders.map((header, idx) => (
                              <li key={idx}>{header}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {headerValidation.incorrectHeaders.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">En-têtes incorrects :</p>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {headerValidation.incorrectHeaders.map((header, idx) => (
                              <li key={idx}>
                                Trouvé: "{header.found}" → Attendu: "{header.expected}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {headerValidation.extraHeaders.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">En-têtes supplémentaires (ignorés) :</p>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {headerValidation.extraHeaders.map((header, idx) => (
                              <li key={idx}>{header}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Erreurs de validation des données */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">
                        {validationErrors.length} erreur(s) de validation détectée(s) :
                      </p>
                      <div className="max-h-64 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Ligne</TableHead>
                              <TableHead className="w-32">Colonne</TableHead>
                              <TableHead className="w-32">Valeur</TableHead>
                              <TableHead>Erreur</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validationErrors.slice(0, 20).map((error, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{error.row}</TableCell>
                                <TableCell className="text-sm">{error.field}</TableCell>
                                <TableCell className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                  {error.value || "(vide)"}
                                </TableCell>
                                <TableCell className="text-sm">{error.message}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {validationErrors.length > 20 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            ... et {validationErrors.length - 20} autres erreurs
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Affichage du fichier uploadé avec succès */}
              {uploadedFile &&
                headerValidation?.isValid &&
                validationErrors.length === 0 && (
                  <div className="mt-4 p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      {/* Icône du fichier */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>

                      {/* Infos du fichier */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                            {t("signUp.signUpOrganisation.step3Learners.upload.success")}
                          </h4>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          >
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </Badge>
                          {excelData.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                            >
                              {excelData.length} enregistrements valides
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bouton supprimer */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFileWithContext}
                        className="text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900/50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

              {/* Affichage du fichier uploadé avec erreurs */}
              {uploadedFile &&
                (headerValidation?.isValid === false || validationErrors.length > 0) && (
                  <div className="mt-4 p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      {/* Icône du fichier */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>

                      {/* Infos du fichier */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                            Fichier uploadé avec erreurs
                          </h4>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                          >
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </Badge>
                          {validationErrors.length > 0 && (
                            <Badge
                              variant="destructive"
                              className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                            >
                              {validationErrors.length} erreurs
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bouton supprimer */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFileWithContext}
                        className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-200 dark:hover:bg-orange-900/50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
            </div>

            {/* Section: Conditions d'utilisation */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={form.watch("acceptTerms")}
                className="border-2 border-primary"
                onCheckedChange={(checked) => {
                  form.setValue("acceptTerms", checked as boolean);
                  // Synchroniser immédiatement avec le contexte
                  updateFormData("learners", {
                    acceptTerms: checked as boolean,
                    excelFile: uploadedFile || undefined,
                    excelData: excelData
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
                        <TermsAndConditions userType="coordinator" />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </Label>
            </div>

            {/* Erreurs de validation du formulaire */}
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-destructive">
                {t(form.formState.errors.acceptTerms.message || "")}
              </p>
            )}
          </div>

          {/* Boutons de navigation */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4 rtl:rotate-180" />
              {t("signUp.signUpOrganisation.step3Learners.buttons.previous")}
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90 text-foreground"
              disabled={isSubmitDisabled}
            >
              {t("signUp.signUpOrganisation.step3Learners.buttons.next")}
              <ChevronRight className="ml-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};