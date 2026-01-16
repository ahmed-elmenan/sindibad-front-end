import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCourse, useCoursePacks } from "@/hooks/useCourseQueries";
import { updateCourse, getCategories } from "@/services/course.service";
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
  Edit,
  Plus,
  Trash2,
  Users,
  Percent,
} from "lucide-react";

import { type CourseFormData } from "@/schemas/courseSchema";
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
  imgFile?: File; // Nouveau fichier image
  imgPreview?: string; // Base64 string pour l'aperçu
  currentImgUrl?: string; // URL actuelle de l'image
  packs: Pack[]; // Packs de réduction
  features: string[]; // Fonctionnalités du cours
};

// Constants pour améliorer la maintenabilité
const LEVEL_LABELS = {
  BEGINNER: { label: "Débutant", color: "bg-green-100 text-green-800" },
  INTERMEDIATE: {
    label: "Intermédiaire",
    color: "bg-yellow-100 text-yellow-800",
  },
  ADVANCED: { label: "Avancé", color: "bg-red-100 text-red-800" },
} as const;

const FORM_SECTIONS = {
  BASIC: "Informations de base",
  DETAILS: "Détails du cours",
  PRICING: "Tarification",
} as const;

// Hooks personnalisés pour une meilleure séparation des responsabilités
const useUpdateCourse = (courseId: string) => {
  usePageTitle("editCourse");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseFormData | FormData) =>
      updateCourse(courseId, data),
    onSuccess: (updatedCourse) => {
      // ✅ Mise à jour immédiate du cache avec les données reçues (200 response)
      queryClient.setQueryData(["course", courseId], updatedCourse);
      
      // ✅ Mise à jour de la liste des cours admin
      queryClient.setQueryData(["admin-courses"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((course: any) => 
          course.id === courseId ? updatedCourse : course
        );
      });
      
      // Invalider les autres caches liés (chapitres, reviews, packs)
      queryClient.invalidateQueries({ queryKey: ["course-chapters", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-packs", courseId] });
      
      toast.success("Cours mis à jour avec succès", {
        description: "Les modifications ont été enregistrées",
        duration: 4000,
      });
      navigate(`/admin/courses/${courseId}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Échec de la mise à jour du cours";
      toast.error("Erreur lors de la mise à jour", {
        description: errorMessage,
        duration: 5000,
      });
      console.error("Error updating course:", error);
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
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    currentImage || null
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
        setImagePreview(currentImage || null);
        onImageSelect(null);
      }
    },
    [onImageSelect, currentImage]
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
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const removeImage = useCallback(() => {
    setImagePreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageSelect]);

  // Mettre à jour l'aperçu quand currentImage change
  useEffect(() => {
    setImagePreview(currentImage || null);
  }, [currentImage]);

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
                Glissez-déposez une nouvelle image ici
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

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | ""
  >("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Hooks personnalisés
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: existingPacks = [], isLoading: packsLoading } =
    useCoursePacks(courseId);
  const updateCourseMutation = useUpdateCourse(courseId!);
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
      duration: 0,
      category: "",
      level: undefined,
      imgFile: undefined,
      imgPreview: "",
      currentImgUrl: "",
      packs: [],
      features: [],
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
    reset,
  } = form;

  // Observer les valeurs pour la prévisualisation
  const watchedValues = watch();

  const isSubmitting = updateCourseMutation.isPending;

  // Update form when course data is loaded
  useEffect(() => {
    if (course && categories.length > 0 && !packsLoading) {
      // S'assurer que les catégories sont chargées
      const courseLevel = course.level as
        | "BEGINNER"
        | "INTERMEDIATE"
        | "ADVANCED";
      const courseCategory = course.category || "";

      // Convertir les packs existants au format du formulaire
      const formattedPacks: Pack[] = existingPacks.map((pack: any) => ({
        id: pack.id?.toString() || Date.now().toString(),
        minLearners: pack.minLearners || 0,
        maxLearners: pack.maxLearners || 0,
        discountPercentage: pack.discountPercentage || 0,
      }));

      // Reset le formulaire avec les données du cours
      reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price?.toString() || "",
        duration: course.duration || 60,
        category: courseCategory,
        level: courseLevel,
        imgFile: undefined,
        imgPreview: course.imgUrl || "",
        currentImgUrl: course.imgUrl || "",
        packs: formattedPacks,
        features: course.features || [],
      });

      // Mise à jour des valeurs des sélecteurs de manière forcée
      setTimeout(() => {
        // Initialiser les états locaux pour les sélects
        setSelectedLevel(courseLevel);
        setSelectedCategory(courseCategory);

        setValue("category", courseCategory, { shouldValidate: true });
        setValue("level", courseLevel, { shouldValidate: true });

        // Vérifier si la catégorie du cours existe dans les catégories disponibles
        if (courseCategory && !categories.includes(courseCategory)) {
          setShowCustomCategory(true);
          setCustomCategory(courseCategory);
          setSelectedCategory("autre"); // Sélectionner "autre" dans le dropdown
        } else {
          setShowCustomCategory(false);
          setCustomCategory("");
        }
      }, 100); // Petit délai pour s'assurer que le DOM est mis à jour
    }
  }, [course, categories, existingPacks, packsLoading, reset, setValue]);

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
        setValue("imgFile", undefined, { shouldValidate: true });
        setValue("imgPreview", watchedValues.currentImgUrl || "", {
          shouldValidate: true,
        });
      }
    },
    [setValue, watchedValues.currentImgUrl]
  );

  // Gestionnaire pour la sélection de catégorie
  const handleCategoryChange = useCallback(
    (value: string) => {
      if (value === "autre") {
        // Afficher l'input pour catégorie personnalisée
        setShowCustomCategory(true);
        // Si on a déjà une catégorie personnalisée, la conserver
        if (customCategory) {
          setValue("category", customCategory, { shouldValidate: true });
        } else {
          setValue("category", "", { shouldValidate: true });
        }
      } else {
        setShowCustomCategory(false);
        setCustomCategory("");
        setValue("category", value, { shouldValidate: true });
      }
    },
    [setValue, customCategory]
  );

  // Gestionnaire pour la catégorie personnalisée
  const handleCustomCategoryChange = useCallback(
    (value: string) => {
      setCustomCategory(value);
      setValue("category", value, { shouldValidate: true });
    },
    [setValue]
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

        // Validation du format du prix
        if (data.price && !/^\d+(\.\d{1,2})?$/.test(data.price)) {
          errors.push("Format de prix invalide");
        }

        if (errors.length > 0) {
          errors.forEach((error) => toast.error(error));
          return false;
        }

        return true;
      };

      try {
        // Validation des données du formulaire
        if (!validateForm(data)) {
          return;
        }

        if (selectedImageFile) {
          // Envoyer FormData avec le nouveau fichier image
          const formData = new FormData();
          formData.append("title", data.title);
          formData.append("description", data.description);
          formData.append("price", data.price);
          formData.append("category", data.category);
          formData.append("level", data.level!);
          formData.append("duration", String(data.duration || 60));
          // Le nouveau fichier image
          formData.append("imgFile", selectedImageFile, selectedImageFile.name);

          // Ajouter les packs de réduction si présents
          if (data.packs && data.packs.length > 0) {
            formData.append("packs", JSON.stringify(data.packs));
          }

          // Ajouter les fonctionnalités si présentes
          if (data.features && data.features.length > 0) {
            const filteredFeatures = data.features.filter(
              (f) => f.trim() !== ""
            );
            if (filteredFeatures.length > 0) {
              formData.append("features", JSON.stringify(filteredFeatures));
            }
          }

          await updateCourseMutation.mutateAsync(formData as any);
        } else {
          // Pour l'update sans image, on envoie aussi en FormData pour cohérence
          const formData = new FormData();
          formData.append("title", data.title);
          formData.append("description", data.description);
          formData.append("price", data.price);
          formData.append("category", data.category);
          formData.append("level", data.level!);
          formData.append("duration", String(data.duration || 60));

          // Ajouter les packs de réduction si présents
          if (data.packs && data.packs.length > 0) {
            formData.append("packs", JSON.stringify(data.packs));
          }

          // Ajouter les fonctionnalités si présentes
          if (data.features && data.features.length > 0) {
            const filteredFeatures = data.features.filter(
              (f) => f.trim() !== ""
            );
            if (filteredFeatures.length > 0) {
              formData.append("features", JSON.stringify(filteredFeatures));
            }
          }

          await updateCourseMutation.mutateAsync(formData as any);
        }
      } catch (error) {
        console.error("Error in onSubmit:", error);
      }
    },
    [updateCourseMutation, selectedImageFile]
  );

  // Gestionnaire pour annuler avec confirmation si le formulaire a été modifié
  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (
        window.confirm(
          "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?"
        )
      ) {
        navigate("/admin/courses");
      }
    } else {
      navigate("/admin/courses");
    }
  }, [isDirty, navigate]);

  // Vérifier si les données sont en cours de chargement
  if (courseLoading || categoriesLoading || packsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded"></div>
                <div className="h-4 w-48 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Form skeleton */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 lg:w-2/3 space-y-6">
              {/* Image section */}
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="aspect-video bg-gray-100 rounded-lg"></div>
              </div>

              {/* Form fields */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
                </div>
              ))}

              {/* Textarea */}
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
                <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="w-full lg:w-1/3 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-40 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Cours non trouvé
          </h1>
          <Link to={`/admin/courses`}>
            <Button className="bg-accent text-white hover:bg-accent/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux cours
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header amélioré */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/admin/courses/${courseId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="group rounded-full h-11 w-11 bg-gray-100 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-200 transition-all duration-300 hover:scale-105 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 group-hover:text-orange-600 transition-colors duration-300" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
              <Edit className="inline h-6 w-6 mr-2 text-orange-500" />
              Modifier le cours
            </h1>
            <p className="text-gray-600 mt-1">
              Modifiez les informations de votre cours
            </p>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            {isDirty ? "Modifications en cours" : "Mode édition"}
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
                        <Select
                          key={`category-select-${selectedCategory}`} // Forcer la recréation lorsque la valeur change
                          onValueChange={(value) => {
                            handleCategoryChange(value);
                            setSelectedCategory(value);
                          }}
                          value={selectedCategory}
                          defaultValue={selectedCategory}
                        >
                          <SelectTrigger
                            className={`w-full md:w-[100%] transition-all duration-200 ${
                              errors.category
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                            }`}
                          >
                            <SelectValue placeholder="Sélectionnez une catégorie">
                              {selectedCategory &&
                                (selectedCategory === "autre"
                                  ? "Autre"
                                  : selectedCategory)}
                            </SelectValue>
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
                        key={`level-select-${selectedLevel}`} // Forcer la recréation lorsque la valeur change
                        onValueChange={(value) => {
                          setValue("level", value as any, {
                            shouldValidate: true,
                          });
                          setSelectedLevel(
                            value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
                          );
                        }}
                        value={selectedLevel}
                        defaultValue={selectedLevel}
                      >
                        <SelectTrigger
                          className={`w-full md:w-[100%] transition-all duration-200 ${
                            errors.level
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                          }`}
                        >
                          <SelectValue placeholder="Sélectionnez un niveau">
                            {selectedLevel &&
                              LEVEL_LABELS[selectedLevel]?.label}
                          </SelectValue>
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
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* Image du cours - 100% de largeur */}
                  <FormField label="Image du cours">
                    <ImageUploader
                      onImageSelect={handleImageSelect}
                      currentImage={
                        watchedValues.imgPreview || watchedValues.currentImgUrl
                      }
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
                                  ...currentPacks.map((p) => p.maxLearners)
                                ) + 1
                              : 5,
                          maxLearners:
                            currentPacks.length > 0
                              ? Math.max(
                                  ...currentPacks.map((p) => p.maxLearners)
                                ) + 10
                              : 10,
                          discountPercentage: 0,
                        };
                        setValue("packs", [...currentPacks, newPack], {
                          shouldValidate: true,
                        });
                      }}
                      className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400 hover:text-black transition-all"
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
                                      (p) => p.id !== pack.id
                                    ),
                                    { shouldValidate: true }
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
                                      (p) => p.id === pack.id
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
                                      (p) => p.id === pack.id
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
                                        (p) => p.id === pack.id
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
                                { shouldValidate: true }
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
                    variant={"default"}
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de prévisualisation */}
        <div className="w-full lg:w-1/3 lg:min-w-[320px]">
          <div
            className="sticky top-4 space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto"
            style={{
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
            }}
          >
            {/* Aperçu du cours */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Aperçu des modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {watchedValues.title || course.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {watchedValues.description || course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">
                      {watchedValues.price || course.price} MAD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      {watchedValues.category || course.category}
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

                  {(watchedValues.level || course.level) && (
                    <Badge
                      className={
                        LEVEL_LABELS[
                          watchedValues.level ||
                            (course.level as keyof typeof LEVEL_LABELS)
                        ].color
                      }
                    >
                      {
                        LEVEL_LABELS[
                          watchedValues.level ||
                            (course.level as keyof typeof LEVEL_LABELS)
                        ].label
                      }
                    </Badge>
                  )}

                  {(watchedValues.imgPreview || course.imgUrl) && (
                    <div className="mt-3">
                      <img
                        src={watchedValues.imgPreview || course.imgUrl}
                        alt="Aperçu du cours"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
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
                  Conseils pour la modification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-blue-700 space-y-2">
                  <li>• Vérifiez que les informations sont à jour</li>
                  <li>• Une nouvelle image peut améliorer l'attractivité</li>
                  <li>• Adaptez le prix selon le marché</li>
                  <li>• Précisez la description si nécessaire</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
