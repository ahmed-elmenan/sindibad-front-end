import { useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCourse, getCategories } from "@/services/course.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  DollarSign,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Users,
  Percent,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

// Type pour les packs de réduction
type Pack = {
  id: string;
  minLearners: number;
  maxLearners: number;
  discountPercentage: number;
};

// Type pour le formulaire avec gestion du fichier image
type CourseFormValues = {
  title: string;
  description: string;
  price: string;
  duration?: number;
  category: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  imgFile: File | null; // Vraie image file
  imgPreview?: string; // Base64 string pour l'aperçu
  packs: Pack[]; // Packs de réduction
  features: string[]; // Fonctionnalités du cours
};

// Constants pour améliorer la maintenabilité
const LEVEL_LABELS = {
  BEGINNER: { label: "Débutant", color: "text-gray-900" },
  INTERMEDIATE: {
    label: "Intermédiaire",
    color: "text-gray-900",
  },
  ADVANCED: { label: "Avancé", color: "text-gray-900" },
} as const;

const FORM_SECTIONS = {
  BASIC: "Informations de base",
  DETAILS: "Détails du cours",
  PRICING: "Tarification",
} as const;

// Hooks personnalisés pour une meilleure séparation des responsabilités
const useAddCourse = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onMutate: async (newCourseData) => {
      // 1. Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ["admin-courses"] });

      // 2. Sauvegarder l'état précédent (pour rollback en cas d'erreur)
      const previousCourses = queryClient.getQueryData(["admin-courses"]);

      // 3. Créer un cours temporaire avec un ID unique temporaire
      const optimisticCourse = {
        id: `temp-${Date.now()}`,
        title:
          newCourseData instanceof FormData
            ? (newCourseData.get("title") as string) || "Nouveau cours"
            : newCourseData.title || "Nouveau cours",
        description:
          newCourseData instanceof FormData
            ? (newCourseData.get("description") as string) || ""
            : newCourseData.description || "",
        price:
          newCourseData instanceof FormData
            ? parseFloat((newCourseData.get("price") as string) || "0")
            : parseFloat(newCourseData.price || "0"),
        category:
          newCourseData instanceof FormData
            ? (newCourseData.get("category") as string) || "Autre"
            : newCourseData.category || "Autre",
        level:
          newCourseData instanceof FormData
            ? (newCourseData.get("level") as string) || "BEGINNER"
            : newCourseData.level || "BEGINNER",
        imgUrl: "", // Pas encore disponible
        avgRating: 0,
        numberOfReviews: 0,
        participants: 0,
        duration: (() => {
          const d =
            newCourseData instanceof FormData
              ? (newCourseData.get("duration") as string | null)
              : (newCourseData as any).duration;
          return parseInt(String(d ?? "0"));
        })(),
        isOptimistic: true, // Flag pour identifier les cours optimistes
      };

      // 4. Mise à jour optimiste du cache
      queryClient.setQueryData(["admin-courses"], (oldData: any) => {
        if (!oldData) return [optimisticCourse];
        return [optimisticCourse, ...oldData];
      });

      // 5. Retourner le contexte pour onError et onSuccess
      return { previousCourses, optimisticCourse };
    },

    onSuccess: (newCourse, _variables, context) => {
      // Remplacer le cours optimiste par le cours réel du serveur
      queryClient.setQueryData(["admin-courses"], (oldData: any) => {
        if (!oldData) return [newCourse];

        // Supprimer le cours temporaire et ajouter le vrai
        return [
          newCourse,
          ...oldData.filter((c: any) => c.id !== context?.optimisticCourse.id),
        ];
      });

      toast.success("Cours créé avec succès", {
        description: "Le nouveau cours a été ajouté à la plateforme",
        duration: 4000,
      });

      // Invalidation pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      // Redirection après succès
      navigate("/admin/courses");
    },

    onError: (error: any, _variables, context) => {
      // ROLLBACK: Restaurer l'état précédent
      if (context?.previousCourses) {
        queryClient.setQueryData(["admin-courses"], context.previousCourses);
      }

      // Afficher l'erreur à l'utilisateur
      const errorMessage =
        error?.response?.data?.message || "Échec de la création du cours";

      toast.error("Erreur lors de la création", {
        description: errorMessage,
        duration: 5000,
        action: {
          label: "Réessayer",
          onClick: () => navigate("/admin/courses/new"),
        },
      });

      console.error("Error creating course:", error);

      // Rediriger vers la page d'ajout si on est déjà sur la liste
      navigate("/admin/courses/new");
    },
  });
};

const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await getCategories();
      } catch (error) {
        toast.error("Impossible de charger les catégories");
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (gcTime remplace cacheTime)
    retry: 2,
  });
};

// Composant d'icône pour les champs
const FieldIcon = ({
  icon: Icon,
  className = "h-4 w-4",
}: {
  icon: any;
  className?: string;
}) => <Icon className={`text-gray-500 ${className}`} />;

// Composant pour les messages d'erreur
const ErrorMessage = ({ error }: { error?: string }) => {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  );
};

// Composant pour les champs de formulaire
const FormField = ({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: any;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {icon && <FieldIcon icon={icon} />}
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
    </div>
    {children}
    <ErrorMessage error={error} />
  </div>
);

// Composant pour l'upload d'images
const ImageUploader = ({
  onImageSelect,
  currentImage,
  error,
}: {
  onImageSelect: (file: File | null) => void;
  currentImage?: string;
  error?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImage || null,
  );

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (file) {
        // Vérifier le type de fichier
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          toast.error("Format non supporté", {
            description: "Veuillez sélectionner une image PNG, JPG ou JPEG",
          });
          return;
        }

        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Fichier trop volumineux", {
            description: "La taille maximale autorisée est de 5MB",
          });
          return;
        }

        // Créer l'aperçu
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        onImageSelect(file);
      } else {
        setImagePreview(null);
        onImageSelect(null);
      }
    },
    [onImageSelect],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect],
  );

  const removeImage = useCallback(() => {
    setImagePreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageSelect]);

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            dragActive
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
          }
          ${error ? "border-red-300 bg-red-50" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleInputChange}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="max-w-full h-48 object-cover rounded-lg mx-auto"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Glissez-déposez une image ici
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ou{" "}
                <span className="text-orange-600 font-medium">
                  cliquez pour parcourir
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-400">PNG, JPG, JPEG jusqu'à 5MB</p>
          </div>
        )}
      </div>

      <ErrorMessage error={error} />
    </div>
  );
};

export default function AddCoursePage() {
  usePageTitle("addCourse");
  const navigate = useNavigate();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");

  // Hooks personnalisés
  const createCourseMutation = useAddCourse();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories() as {
    data: string[];
    isLoading: boolean;
    error: any;
  };

  const form = useForm<CourseFormValues>({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      duration: 0, // Valeur par défaut pour maintenir la compatibilité
      category: "",
      level: undefined,
      imgFile: null,
      imgPreview: "",
      packs: [],
      features: [],
    },
    mode: "onChange", // Validation en temps réel
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = form;

  // Observer les valeurs pour la prévisualisation
  const watchedValues = watch();

  const isSubmitting = createCourseMutation.isPending; // isPending remplace isLoading

  // Gestionnaire pour l'upload d'image
  const handleImageSelect = useCallback(
    (file: File | null) => {
      if (file) {
        // Stocker le fichier image réel
        setSelectedImageFile(file);
        setValue("imgFile", file, { shouldValidate: true });

        // Créer aperçu base64 pour l'affichage
        const reader = new FileReader();
        reader.onload = (e) => {
          setValue("imgPreview", e.target?.result as string, {
            shouldValidate: true,
          });
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedImageFile(null);
        setValue("imgFile", null, { shouldValidate: true });
        setValue("imgPreview", "", { shouldValidate: true });
      }
    },
    [setValue],
  );

  // Gestionnaire pour la sélection de catégorie
  const handleCategoryChange = useCallback(
    (value: string) => {
      if (value === "autre") {
        setShowCustomCategory(true);
        setValue("category", "", { shouldValidate: true });
      } else {
        setShowCustomCategory(false);
        setCustomCategory("");
        setValue("category", value, { shouldValidate: true });
      }
    },
    [setValue],
  );

  // Gestionnaire pour la catégorie personnalisée
  const handleCustomCategoryChange = useCallback(
    (value: string) => {
      setCustomCategory(value);
      setValue("category", value, { shouldValidate: true });
    },
    [setValue],
  );

  // Gestionnaire de soumission optimisé
  const onSubmit = useCallback(
    async (data: CourseFormValues) => {
      // Validation manuelle simple
      const validateForm = (data: CourseFormValues): boolean => {
        const errors: Array<string> = [];
        if (!data.title?.trim()) errors.push("Le titre est requis");
        if (!data.price?.trim()) errors.push("Le prix est requis");
        if (!data.category?.trim()) errors.push("La catégorie est requise");
        if (!data.level) errors.push("Le niveau est requis");
        if (!selectedImageFile) errors.push("L'image du cours est obligatoire");
        // Validation du format du prix
        if (data.price && !/^\d+(\.\d{1,2})?$/.test(data.price)) {
          errors.push("Format de prix invalide");
        }
        if (errors.length > 0) {
          errors.forEach((error) => toast.error(error));
          setImageError(
            errors.includes("L'image du cours est obligatoire")
              ? "L'image du cours est obligatoire"
              : "",
          );
          return false;
        }
        setImageError("");
        return true;
      };

      try {
        // Validation des données du formulaire
        if (!validateForm(data)) {
          return;
        }
        // Envoyer FormData avec le fichier image réel
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("category", data.category);
        formData.append("level", data.level!);
        formData.append("duration", String(data.duration || 0));
        formData.append("imgFile", selectedImageFile!, selectedImageFile!.name);

        // Ajouter les packs de réduction si présents
        if (data.packs && data.packs.length > 0) {
          formData.append("packs", JSON.stringify(data.packs));
        }

        // Ajouter les fonctionnalités si présentes
        if (data.features && data.features.length > 0) {
          const filteredFeatures = data.features.filter((f) => f.trim() !== "");
          if (filteredFeatures.length > 0) {
            formData.append("features", JSON.stringify(filteredFeatures));
          }
        }
        // Afficher le contenu du FormData pour le débogage
        const formDataObject: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
          formDataObject[key] =
            value instanceof File
              ? `${value.name} (${value.size} bytes)`
              : value;
        }
        await createCourseMutation.mutateAsync(formData as any);
      } catch (error) {
        console.error("Error in onSubmit:", error);
        // L'erreur est déjà gérée dans le hook useAddCourse
      }
    },
    [createCourseMutation, selectedImageFile],
  );

  // Gestionnaire pour annuler avec confirmation si le formulaire a été modifié
  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (
        window.confirm(
          "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?",
        )
      ) {
        navigate("/admin/courses");
      }
    } else {
      navigate("/admin/courses");
    }
  }, [isDirty, navigate]);

  // Vérifier si les catégories sont en cours de chargement
  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          </div>

          {/* Main Layout Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Skeleton */}
            <div className="flex-1 lg:w-2/3">
              <div className="bg-white rounded-lg border shadow-lg p-6 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-64"></div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Preview Skeleton */}
            <div className="w-full lg:w-1/3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border p-6 space-y-4">
                <div className="h-6 bg-orange-200 rounded w-32"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-orange-200 rounded w-full"></div>
                  <div className="h-4 bg-orange-200 rounded w-5/6"></div>
                  <div className="h-4 bg-orange-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header amélioré */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/admin/courses`}>
            <Button
              variant="ghost"
              size="icon"
              className="group rounded-full h-11 w-11 bg-white border-2 border-white hover:scale-[1.02] hover:!bg-white shadow-sm hover:shadow-md backdrop-blur-sm flex-shrink-0 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-primary transition-colors duration-300" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
              Créer un nouveau cours
            </h1>
            <p className="text-gray-600 mt-1">
              Ajoutez un cours à votre plateforme d'apprentissage
            </p>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            {isDirty ? "Modifications en cours" : "Nouveau cours"}
          </Badge>
        </div>
      </div>

      {/* Alerte d'erreur si les catégories n'ont pas pu être chargées */}
      {categoriesError && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Impossible de charger les catégories. Certaines fonctionnalités
            peuvent être limitées.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulaire principal */}
        <div className="flex-1 lg:w-2/3">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {FORM_SECTIONS.BASIC}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Informations essentielles du cours
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section des informations de base */}
                <div className="space-y-6">
                  <FormField
                    label="Titre du cours"
                    icon={BookOpen}
                    error={errors.title?.message}
                  >
                    <Input
                      {...register("title")}
                      placeholder="ex: Introduction à React.js"
                      className={`transition-all duration-200 ${
                        errors.title
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                      }`}
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    error={errors.description?.message}
                  >
                    <Textarea
                      {...register("description")}
                      placeholder="Décrivez le contenu et les objectifs du cours..."
                      rows={5}
                      className={`transition-all duration-200 resize-none ${
                        errors.description
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                      }`}
                    />
                  </FormField>
                </div>

                <Separator />

                {/* Section des détails */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {FORM_SECTIONS.DETAILS}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Catégorie"
                      icon={Tag}
                      error={errors.category?.message}
                    >
                      <div className="space-y-3">
                        <Select onValueChange={handleCategoryChange}>
                          <SelectTrigger
                            className={`w-full md:w-[100%] transition-all duration-200  ${
                              errors.category
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                            }`}
                          >
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center gap-2">
                                  <Tag className="h-3 w-3" />
                                  {category}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="autre">
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                <span className="font-medium text-orange-600">
                                  Autre (catégorie personnalisée)
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Input pour catégorie personnalisée */}
                        {showCustomCategory && (
                          <div className="animate-in slide-in-from-top-2 duration-200">
                            <Input
                              value={customCategory}
                              onChange={(e) =>
                                handleCustomCategoryChange(e.target.value)
                              }
                              placeholder="Entrez votre catégorie personnalisée..."
                              className={`transition-all duration-200 ${
                                errors.category
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                              }`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              💡 Exemple: "Intelligence Artificielle",
                              "Blockchain", etc.
                            </p>
                          </div>
                        )}
                      </div>
                    </FormField>

                    <FormField
                      label="Niveau"
                      icon={TrendingUp}
                      error={errors.level?.message}
                    >
                      <Select
                        onValueChange={(value) =>
                          setValue("level", value as any, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          className={`w-full md:w-[100%] transition-all duration-200 ${
                            errors.level
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                          }`}
                        >
                          <SelectValue placeholder="Sélectionnez un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LEVEL_LABELS).map(
                            ([value, { label, color }]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs ${color}`}
                                  >
                                    {label}
                                  </div>
                                </div>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* Image du cours - 100% de largeur */}
                  <FormField label="Image du cours">
                    <ImageUploader
                      onImageSelect={handleImageSelect}
                      currentImage={watchedValues.imgPreview}
                      error={imageError}
                    />
                  </FormField>
                </div>

                <Separator />

                {/* Section tarification */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {FORM_SECTIONS.PRICING}
                    </h3>
                  </div>

                  <FormField
                    label="Prix (MAD)"
                    icon={DollarSign}
                    error={errors.price?.message}
                  >
                    <Input
                      {...register("price")}
                      placeholder="299.99"
                      className={`transition-all duration-200 placeholder:text-gray-400 ${
                        errors.price
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                      }`}
                    />
                  </FormField>
                </div>

                <Separator />

                {/* Section Packs de Réduction */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Packs de Réduction pour les organisations
                        </h3>
                        <p className="text-xs text-gray-600">
                          Définissez des réductions par paliers d'apprenants
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentPacks = watchedValues.packs || [];
                        const newPack: Pack = {
                          id: Date.now().toString(),
                          minLearners:
                            currentPacks.length > 0
                              ? Math.max(
                                  ...currentPacks.map((p) => p.maxLearners),
                                ) + 1
                              : 5,
                          maxLearners:
                            currentPacks.length > 0
                              ? Math.max(
                                  ...currentPacks.map((p) => p.maxLearners),
                                ) + 10
                              : 10,
                          discountPercentage: 0,
                        };
                        setValue("packs", [...currentPacks, newPack], {
                          shouldValidate: true,
                        });
                      }}
                      className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400  hover:text-black transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un pack
                    </Button>
                  </div>

                  {/* Liste des packs */}
                  {watchedValues.packs && watchedValues.packs.length > 0 ? (
                    <div className="space-y-4">
                      {watchedValues.packs.map((pack, index) => (
                        <Card
                          key={pack.id}
                          className="border-2 border-purple-100 bg-purple-50/30 hover:border-purple-200 transition-all"
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-800"
                                >
                                  Pack {index + 1}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const currentPacks =
                                    watchedValues.packs || [];
                                  setValue(
                                    "packs",
                                    currentPacks.filter(
                                      (p) => p.id !== pack.id,
                                    ),
                                    { shouldValidate: true },
                                  );
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              {/* Min Learners */}
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Min
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={pack.minLearners}
                                  onChange={(e) => {
                                    const currentPacks = [
                                      ...(watchedValues.packs || []),
                                    ];
                                    const packIndex = currentPacks.findIndex(
                                      (p) => p.id === pack.id,
                                    );
                                    if (packIndex !== -1) {
                                      currentPacks[packIndex].minLearners =
                                        parseInt(e.target.value) || 0;
                                      setValue("packs", currentPacks, {
                                        shouldValidate: true,
                                      });
                                    }
                                  }}
                                  className="h-9 text-sm"
                                  placeholder="5"
                                />
                              </div>

                              {/* Max Learners */}
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Max
                                </Label>
                                <Input
                                  type="number"
                                  min={pack.minLearners}
                                  value={pack.maxLearners}
                                  onChange={(e) => {
                                    const currentPacks = [
                                      ...(watchedValues.packs || []),
                                    ];
                                    const packIndex = currentPacks.findIndex(
                                      (p) => p.id === pack.id,
                                    );
                                    if (packIndex !== -1) {
                                      currentPacks[packIndex].maxLearners =
                                        parseInt(e.target.value) || 0;
                                      setValue("packs", currentPacks, {
                                        shouldValidate: true,
                                      });
                                    }
                                  }}
                                  className="h-9 text-sm"
                                  placeholder="10"
                                />
                              </div>

                              {/* Discount Percentage */}
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                  <Percent className="h-3 w-3" />
                                  Réduction
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={pack.discountPercentage}
                                    onChange={(e) => {
                                      const currentPacks = [
                                        ...(watchedValues.packs || []),
                                      ];
                                      const packIndex = currentPacks.findIndex(
                                        (p) => p.id === pack.id,
                                      );
                                      if (packIndex !== -1) {
                                        currentPacks[
                                          packIndex
                                        ].discountPercentage =
                                          parseInt(e.target.value) || 0;
                                        setValue("packs", currentPacks, {
                                          shouldValidate: true,
                                        });
                                      }
                                    }}
                                    className="h-9 text-sm pr-8"
                                    placeholder="10"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Pack Summary */}
                            {watchedValues.price &&
                              pack.discountPercentage > 0 && (
                                <div className="mt-3 pt-3 border-t border-purple-200">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">
                                      Prix final:{" "}
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                      {(
                                        parseFloat(watchedValues.price) *
                                        (1 - pack.discountPercentage / 100)
                                      ).toFixed(2)}{" "}
                                      MAD
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                      par apprenant ({pack.minLearners}-
                                      {pack.maxLearners} apprenants)
                                    </span>
                                  </p>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/20">
                      <Users className="h-12 w-12 mx-auto text-purple-300 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Aucun pack de réduction défini
                      </p>
                      <p className="text-xs text-gray-500">
                        Cliquez sur "Ajouter un pack" pour créer des réductions
                        par paliers
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Section Fonctionnalités */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Fonctionnalités du cours
                        </h3>
                        <p className="text-xs text-gray-600">
                          Ajoutez les caractéristiques et avantages du cours
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentFeatures = watchedValues.features || [];
                        setValue("features", [...currentFeatures, ""], {
                          shouldValidate: true,
                        });
                      }}
                      className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:text-black transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>

                  {/* Liste des fonctionnalités */}
                  {watchedValues.features &&
                  watchedValues.features.length > 0 ? (
                    <div className="space-y-3">
                      {watchedValues.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border-2 border-blue-100 bg-blue-50/30 rounded-lg hover:border-blue-200 transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <Input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const currentFeatures = [
                                ...(watchedValues.features || []),
                              ];
                              currentFeatures[index] = e.target.value;
                              setValue("features", currentFeatures, {
                                shouldValidate: true,
                              });
                            }}
                            className="flex-1 border-1 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Ex: Accès à vie, Certificat de fin de cours..."
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const currentFeatures =
                                watchedValues.features || [];
                              setValue(
                                "features",
                                currentFeatures.filter((_, i) => i !== index),
                                { shouldValidate: true },
                              );
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/20">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-blue-300 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Aucune fonctionnalité ajoutée
                      </p>
                      <p className="text-xs text-gray-500">
                        Cliquez sur "Ajouter une fonctionnalité" pour définir
                        les avantages du cours
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="order-2 sm:order-1"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="order-1 sm:order-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Créer le cours
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de prévisualisation */}
        <aside className="w-full lg:w-1/3 lg:min-w-[320px]">
          <div className="sticky top-32 space-y-6 max-h-[calc(100vh-9rem)] overflow-y-auto">
            {/* Aperçu du cours */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {watchedValues.title || "Titre du cours"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {watchedValues.description || "Description du cours..."}
                    </p>
                  </div>

                  {watchedValues.price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700">
                        {watchedValues.price} MAD
                      </span>
                    </div>
                  )}

                  {watchedValues.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">
                        {watchedValues.category}
                      </span>
                      {showCustomCategory && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-orange-50 border-orange-200 text-orange-800"
                        >
                          Personnalisée
                        </Badge>
                      )}
                    </div>
                  )}

                  {watchedValues.level && (
                    <Badge className={LEVEL_LABELS[watchedValues.level].color}>
                      {LEVEL_LABELS[watchedValues.level].label}
                    </Badge>
                  )}

                  {watchedValues.imgPreview && (
                    <div className="mt-3">
                      <img
                        src={watchedValues.imgPreview}
                        alt="Aperçu du cours"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Packs Preview */}
                  {watchedValues.packs && watchedValues.packs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700">
                          Packs de réduction
                        </span>
                      </div>
                      <div className="space-y-2">
                        {watchedValues.packs.map((pack) => (
                          <div
                            key={pack.id}
                            className="bg-white/60 rounded-lg p-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">
                                {pack.minLearners}-{pack.maxLearners} apprenants
                              </span>
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                -{pack.discountPercentage}%
                              </Badge>
                            </div>
                            {watchedValues.price && (
                              <p className="text-gray-600 mt-1">
                                {(
                                  parseFloat(watchedValues.price) *
                                  (1 - pack.discountPercentage / 100)
                                ).toFixed(2)}{" "}
                                MAD/apprenant
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features Preview */}
                  {watchedValues.features &&
                    watchedValues.features.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-orange-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">
                            Fonctionnalités
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {watchedValues.features
                            .filter((f) => f.trim() !== "")
                            .map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-700"
                              >
                                <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 text-sm">
                  Conseils pour un bon cours
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-blue-700 space-y-2">
                  <li>• Utilisez un titre accrocheur et descriptif</li>
                  <li>• Rédigez une description claire des objectifs</li>
                  <li>• Choisissez une image de qualité</li>
                  <li>• Fixez un prix compétitif</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
