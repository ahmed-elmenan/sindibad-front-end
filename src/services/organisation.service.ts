import type { LearnersData, SignUpOrgFormData } from "@/schemas/signUpOrgFormShema";
import api from "@/lib/axios";
import type { AxiosError } from "axios";
import type { LearnerPayload, OrganisationPayload, RawLearner } from "@/types";
import * as ExcelJS from "exceljs";
import type { useForm } from "react-hook-form";

// ============================================================
// Constants & Types
// ============================================================

/**
 * Constantes pour la validation des fichiers Excel
 */
const EXCEL_VALIDATION = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ],
  TEMPLATE_PATH: "/templates/apprenants-inscription.xlsx",
  TEMPLATE_DOWNLOAD_NAME: "modele-apprenants.xlsx",
};

// En-têtes requis avec leur format exact
const REQUIRED_HEADERS = {
  prenom: "prenom",
  nom: "nom", 
  date_de_naissance: "date_de_naissance(jj/mm/yyyy)",
  email: "email",
  telephone: "telephone(06_ou_07)",
  sexe: "sexe(masculin/feminin)"
} as const;

// Regex de validation pour chaque champ
const FIELD_VALIDATIONS = {
  prenom: {
    regex: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/,
    message: "Le prénom doit contenir entre 2 et 50 caractères alphabétiques"
  },
  nom: {
    regex: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/,
    message: "Le nom doit contenir entre 2 et 50 caractères alphabétiques"
  },
  date_de_naissance: {
    regex: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    message: "La date doit être au format jj/mm/yyyy (ex: 15/03/1995)"
  },
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "L'email doit être au format valide (ex: nom@domaine.com)"
  },
  telephone: {
    regex: /^(\+33|0)[1-9](\d{8})$/,
    message: "Le téléphone doit être au format français (ex: 0123456789 ou +33123456789)"
  },
  sexe: {
    regex: /^(masculin|feminin)$/i,
    message: "Le sexe doit être 'masculin' ou 'feminin'"
  }
} as const;

export type ValidationError = {
  row: number;
  column: string;
  value: string;
  message: string;
  field: keyof typeof FIELD_VALIDATIONS;
};

export type HeaderValidationResult = {
  isValid: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
  incorrectHeaders: Array<{ found: string; expected: string }>;
};

export type ValidationResult = {
  isValid: boolean;
  headerValidation: HeaderValidationResult;
  dataErrors: ValidationError[];
  validData: RawLearner[];
};

// ============================================================
// Validation Functions
// ============================================================

/**
 * Valide les en-têtes du fichier Excel
 */
export const validateHeaders = (headers: string[]): HeaderValidationResult => {
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  const requiredHeadersArray = Object.values(REQUIRED_HEADERS);
  const normalizedRequired = requiredHeadersArray.map(h => h.toLowerCase());

  const missingHeaders: string[] = [];
  const extraHeaders: string[] = [];
  const incorrectHeaders: Array<{ found: string; expected: string }> = [];

  // Vérifier les en-têtes manquants
  for (const required of requiredHeadersArray) {
    const normalizedRequired = required.toLowerCase();
    if (!normalizedHeaders.includes(normalizedRequired)) {
      missingHeaders.push(required);
    }
  }

  // Vérifier les en-têtes supplémentaires et incorrects
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    const normalizedHeader = header.toLowerCase();
    
    if (!normalizedRequired.includes(normalizedHeader)) {
      // Chercher si c'est une variation d'un en-tête requis
      const similarHeader = requiredHeadersArray.find(req => 
        req.toLowerCase().includes(normalizedHeader) || 
        normalizedHeader.includes(req.toLowerCase())
      );
      
      if (similarHeader) {
        incorrectHeaders.push({ found: header, expected: similarHeader });
      } else {
        extraHeaders.push(header);
      }
    }
  }

  return {
    isValid: missingHeaders.length === 0 && incorrectHeaders.length === 0,
    missingHeaders,
    extraHeaders,
    incorrectHeaders
  };
};

/**
 * Valide les données avec regex
 */
export const validateDataWithRegex = (data: Array<Record<string, unknown>>): ValidationError[] => {
  const errors: ValidationError[] = [];

  data.forEach((row, rowIndex) => {
    Object.entries(FIELD_VALIDATIONS).forEach(([field, validation]) => {
      const headerName = REQUIRED_HEADERS[field as keyof typeof REQUIRED_HEADERS];
      const value = row[headerName];
      let stringValue = '';

      // Traitement spécial pour les dates Excel
      if (field === 'date_de_naissance' && value instanceof Date) {
        stringValue = `${value.getDate().toString().padStart(2, '0')}/${(value.getMonth() + 1).toString().padStart(2, '0')}/${value.getFullYear()}`;
      } else {
        stringValue = String(value || '').trim();
      }

      // Vérifier si le champ est vide
      if (!stringValue) {
        errors.push({
          row: rowIndex + 3, // +3 car ligne 1 = titre, ligne 2 = en-têtes
          column: headerName,
          value: stringValue,
          message: `Le champ ${field} est requis`,
          field: field as keyof typeof FIELD_VALIDATIONS
        });
        return;
      }

      // Validation regex
      if (!validation.regex.test(stringValue)) {
        errors.push({
          row: rowIndex + 3,
          column: headerName,
          value: stringValue,
          message: validation.message,
          field: field as keyof typeof FIELD_VALIDATIONS
        });
      }
    });
  });

  return errors;
};

/**
 * Valide que le fichier a bien le format binaire d'un Excel
 */
export const validateExcelFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength < 4) {
          resolve(false);
          return;
        }

        const uint8Array = new Uint8Array(buffer);

        // Vérifier les signatures de fichier Excel
        const isXLSX =
          uint8Array[0] === 0x50 &&
          uint8Array[1] === 0x4b &&
          uint8Array[2] === 0x03 &&
          uint8Array[3] === 0x04;

        const isXLS =
          uint8Array[0] === 0xd0 &&
          uint8Array[1] === 0xcf &&
          uint8Array[2] === 0x11 &&
          uint8Array[3] === 0xe0;

        resolve(isXLSX || isXLS);
      } catch (error) {
        console.error("File validation error:", error);
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Télécharge le modèle Excel vide
 */
export const downloadTemplate = () => {
  const templatePath = EXCEL_VALIDATION.TEMPLATE_PATH;

  const link = document.createElement("a");
  link.href = templatePath;
  link.download = EXCEL_VALIDATION.TEMPLATE_DOWNLOAD_NAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Extrait et valide complètement un fichier Excel
 */
export const extractAndValidateExcelData = async (file: File): Promise<ValidationResult> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    // Récupérer les en-têtes depuis la ligne 2
    const headers: string[] = [];
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell((cell) => {
      headers.push(cell.value?.toString().trim() || "");
    });

    // Validation des en-têtes
    const headerValidation = validateHeaders(headers);

    if (!headerValidation.isValid) {
      return {
        isValid: false,
        headerValidation,
        dataErrors: [],
        validData: []
      };
    }

    // Extraction des données
    const rawData: Array<Record<string, unknown>> = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 2) {
        const rowData: Record<string, unknown> = {};

        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            const cellValue = cell.value;

            // Formater selon le type de donnée
            if (cellValue instanceof Date) {
              // Garder la date comme objet Date pour validation spéciale
              rowData[header] = cellValue;
            } else if (typeof cellValue === 'string') {
              rowData[header] = cellValue.trim();
            } else if (cellValue && typeof cellValue === 'object' && 'text' in cellValue) {
              rowData[header] = String((cellValue as any).text).trim();
            } else {
              rowData[header] = cellValue;
            }
          }
        });

        // Ajouter seulement les lignes non complètement vides
        if (Object.values(rowData).some(value => 
          value !== null && value !== undefined && String(value).trim() !== ""
        )) {
          rawData.push(rowData);
        }
      }
    });

    // Validation des données avec regex
    const dataErrors = validateDataWithRegex(rawData);

    // Mapping des données valides
    const validData: RawLearner[] = rawData.map((row) => ({
      nom: String(row.nom ?? ""),
      prenom: String(row.prenom ?? ""),
      date_de_naissance: row["date_de_naissance(jj/mm/yyyy)"] instanceof Date 
      ? `${(row["date_de_naissance(jj/mm/yyyy)"] as Date).getDate().toString().padStart(2, '0')}/${((row["date_de_naissance(jj/mm/yyyy)"] as Date).getMonth() + 1).toString().padStart(2, '0')}/${(row["date_de_naissance(jj/mm/yyyy)"] as Date).getFullYear()}`
      : String(row["date_de_naissance(jj/mm/yyyy)"] ?? ""),
      email: typeof row.email === "string"
      ? row.email
      : typeof row.email === "object" && row.email !== null && "text" in row.email
      ? (row.email as { text: string }).text
      : "",
      telephone: String(row["telephone(06_ou_07)"] ?? ""),
      sexe: String(row["sexe(masculin/feminin)"] ?? ""),
    }));

    return {
      isValid: dataErrors.length === 0,
      headerValidation,
      dataErrors,
      validData
    };

  } catch (error) {
    console.error("Erreur lors de l'extraction des données Excel:", error);
    throw error;
  }
};

/**
 * Gère l'upload d'un fichier Excel avec validation complète
 */

/**
 * Gère l'upload d'un fichier Excel avec validation complète
 */
export const handleFileUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setFileError: React.Dispatch<React.SetStateAction<string | null>>,
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>,
  setExcelData: React.Dispatch<React.SetStateAction<RawLearner[]>>,
  form: ReturnType<typeof useForm<LearnersData>>,
  t: (key: string) => string,
  setValidationErrors?: React.Dispatch<React.SetStateAction<ValidationError[]>>,
  setHeaderValidation?: React.Dispatch<React.SetStateAction<HeaderValidationResult | null>>
) => {
  const file = event.target.files?.[0];
  
  if (!file) {
    // Si aucun fichier, on nettoie tout
    setFileError(null);
    setValidationErrors?.([]);
    setHeaderValidation?.(null);
    setUploadedFile(null);
    setExcelData([]);
    form.setValue("excelFile", undefined);
    return;
  }

  // RÉINITIALISATION DES ERREURS ET VALIDATIONS UNIQUEMENT
  setFileError(null);
  setValidationErrors?.([]);
  setHeaderValidation?.(null);

  try {
    // 1. Vérification de la taille
    if (file.size > EXCEL_VALIDATION.MAX_FILE_SIZE) {
      throw new Error("errors.fileTooLarge");
    }

    // 2. Vérification du type MIME déclaré
    if (!EXCEL_VALIDATION.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error("errors.invalidFileType");
    }

    // 3. Vérification de la signature binaire du fichier
    const isValidExcel = await validateExcelFile(file);
    if (!isValidExcel) {
      throw new Error("errors.invalidExcelFile");
    }

    // 4. Extraction et validation complète
    const validationResult = await extractAndValidateExcelData(file);

    // 5. Gestion des résultats de validation
    setHeaderValidation?.(validationResult.headerValidation);

    if (!validationResult.headerValidation.isValid) {
      setFileError("Les en-têtes du fichier Excel ne correspondent pas au modèle requis.");
      // Ne pas définir le fichier comme uploadé si les headers sont invalides
      setUploadedFile(null);
      setExcelData([]);
      form.setValue("excelFile", undefined);
      return;
    }

    setValidationErrors?.(validationResult.dataErrors);

    if (validationResult.dataErrors.length > 0) {
      setFileError(`${validationResult.dataErrors.length} erreur(s) de validation détectée(s) dans les données.`);
    }

    // 6. TOUJOURS définir le fichier et les données (même s'il y a des erreurs de données)
    // L'utilisateur doit pouvoir voir le fichier uploadé avec ses erreurs
    setUploadedFile(file);
    form.setValue("excelFile", file);
    setExcelData(validationResult.validData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "errors.invalidExcelFile";
    setFileError(t(errorMessage));
    console.error("Erreur lors de l'upload:", error);

    // RÉINITIALISATION COMPLÈTE EN CAS D'ERREUR CRITIQUE
    setUploadedFile(null);
    setExcelData([]);
    setValidationErrors?.([]);
    setHeaderValidation?.(null);
    form.setValue("excelFile", undefined);

    // Reset l'input file
    const fileInput = document.getElementById("excel-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }
};


/**
 * Supprime le fichier uploadé
 */
export const handleRemoveFile = ({
  setUploadedFile,
  setExcelData,
  form,
  setValidationErrors,
  setHeaderValidation,
  setFileError
}: {
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setExcelData: React.Dispatch<React.SetStateAction<RawLearner[]>>;
  form: ReturnType<typeof useForm<LearnersData>>;
  setValidationErrors?: React.Dispatch<React.SetStateAction<ValidationError[]>>;
  setHeaderValidation?: React.Dispatch<React.SetStateAction<HeaderValidationResult | null>>;
  setFileError?: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  setUploadedFile(null);
  setExcelData([]);
  setValidationErrors?.([]);
  setHeaderValidation?.(null);
  setFileError?.(null);
  form.setValue("excelFile", undefined);

  // Reset l'input file
  const fileInput = document.getElementById("excel-upload") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};

// ============================================================
// Existing Functions (unchanged)
// ============================================================

export async function createOrganisation(formData: SignUpOrgFormData) {
  const learners = mapValidLearners(formData.learners?.excelData ?? []);
  const payload = buildOrganisationPayload(formData, learners);

  try {
    const response = await api.post("/organisations/register", payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// --- Helpers ---
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type EmailText = { text: string };

function extractEmail(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof (value as EmailText).text === "string"
  ) {
    return (value as EmailText).text;
  }
  return null;
}

function mapValidLearners(rawLearners: RawLearner[]): LearnerPayload[] {
  return rawLearners
    .filter((learner) => {
      const email = extractEmail(learner.email);
      const validGender = learner.sexe === "masculin" || learner.sexe === "feminin";

      return (
        learner.nom &&
        learner.prenom &&
        learner.date_de_naissance &&
        email &&
        isValidEmail(email) &&
        validGender
      );
    })
    .map((learner) => ({
      firstName: learner.prenom ?? "",
      lastName: learner.nom ?? "",
      email: extractEmail(learner.email) ?? "",
      phoneNumber: learner.telephone ?? "",
      dateOfBirth: learner.date_de_naissance ?? "",
      gender: learner.sexe === "masculin" ? "MALE" : "FEMALE",
      isActive: false,
    }));
}

function buildOrganisationPayload(
  formData: SignUpOrgFormData,
  learners: LearnerPayload[]
): OrganisationPayload {
  const org = formData.organisation;
  const coordinator = formData.coordinator;

  return {
    type: org.organisationType,
    name: org.organisationName,
    city: org.city,
    address: org.organisationAddress,
    websiteUrl: org.organisationWebsite ?? "",
    email: org.organisationEmail,
    phoneNumber: org.organisationPhone,
    password: org.password,
    firstName: coordinator.firstName,
    lastName: coordinator.lastName,
    learners,
  };
}

function handleApiError(error: unknown): never {
  const axiosError = error as AxiosError;
  const message =
    typeof axiosError.response?.data === "string"
      ? axiosError.response.data
      : "Unknown error";
  console.error("API Error:", message);
  throw new Error(message);
}