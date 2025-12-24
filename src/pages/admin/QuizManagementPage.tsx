import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  FileQuestion,
  Filter,
  X,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

// Types
interface Quiz {
  id: string;
  title: string;
  duration: number; // en minutes
  questionCount: number;
  courseName: string;
  courseId: string;
  type: "SIMPLE" | "PHASE" | "FINAL";
  createdAt: string;
}

interface SkillQuestion {
  skillId: string;
  skillName: string;
  questionCount: number;
}

interface QuizFormData {
  title: string;
  duration: string;
  questionCount: string;
  courseId: string;
  type: "SIMPLE" | "PHASE" | "FINAL";
  skills: SkillQuestion[];
}

interface QuizManagementPageProps {
  courseTitle?: string;
  onBack?: () => void;
}

const QuizManagementPage = ({ courseTitle, onBack }: QuizManagementPageProps = {}) => {
  usePageTitle("quizManagement");
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    duration: "",
    questionCount: "",
    courseId: courseId || "",
    type: "SIMPLE",
    skills: [],
  });

  // States for skill management
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [currentSkillQuestions, setCurrentSkillQuestions] =
    useState<string>("");
  const [isCreatingNewSkill, setIsCreatingNewSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");

  // Mock data - À remplacer par de vrais appels API
  const mockQuizzes: Quiz[] = [
    {
      id: "1",
      title: "Quiz Introduction Python",
      duration: 30,
      questionCount: 15,
      courseName: "Python pour débutants",
      courseId: "course-1",
      type: "SIMPLE",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Quiz Phase 1 - Bases JavaScript",
      duration: 45,
      questionCount: 20,
      courseName: "JavaScript Moderne",
      courseId: "course-2",
      type: "PHASE",
      createdAt: "2024-02-10",
    },
    {
      id: "3",
      title: "Examen Final React",
      duration: 60,
      questionCount: 30,
      courseName: "Maîtriser React",
      courseId: "course-3",
      type: "FINAL",
      createdAt: "2024-03-05",
    },
  ];

  // Queries
  const { data: quizzes = mockQuizzes, isLoading } = useQuery({
    queryKey: ["quizzes", courseId],
    queryFn: async () => {
      // TODO: Remplacer par appel API réel
      // const response = await axios.get(`/api/admin/courses/${courseId}/quizzes`);
      // return response.data;
      return mockQuizzes.filter(q => q.courseId === courseId);
    },
    enabled: !!courseId,
  });

  // Récupérer les informations du cours actuel
  const { data: currentCourse, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (courseTitle) {
        // Si courseTitle est fourni via props, on l'utilise directement
        return { id: courseId, name: courseTitle };
      }
      // TODO: Remplacer par appel API réel
      // const response = await axios.get(`/api/admin/courses/${courseId}`);
      // return response.data;
      const courses = [
        { id: "course-1", name: "Python pour débutants" },
        { id: "course-2", name: "JavaScript Moderne" },
        { id: "course-3", name: "Maîtriser React" },
      ];
      return courses.find(c => c.id === courseId) || { id: courseId, name: "Cours" };
    },
    enabled: !!courseId,
  });

  // Mock skills data
  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      // TODO: Remplacer par appel API réel
      return [
        { id: "skill-1", name: "Variables et Types" },
        { id: "skill-2", name: "Boucles" },
        { id: "skill-3", name: "Fonctions" },
        { id: "skill-4", name: "POO" },
        { id: "skill-5", name: "Async/Await" },
      ];
    },
  });

  // Mutations
  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      // TODO: Implémenter l'appel API
      console.log("Create quiz:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz créé avec succès");
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création du quiz");
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async (data: { id: string; quiz: QuizFormData }) => {
      // TODO: Implémenter l'appel API
      console.log("Update quiz:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz modifié avec succès");
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la modification du quiz");
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implémenter l'appel API
      console.log("Delete quiz:", id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setSelectedQuiz(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du quiz");
    },
  });

  // Handlers
  const resetForm = () => {
    setFormData({
      title: "",
      duration: "",
      questionCount: "",
      courseId: courseId || "",
      type: "SIMPLE",
      skills: [],
    });
    setSelectedQuiz(null);
    setCurrentSkill("");
    setCurrentSkillQuestions("");
    setIsCreatingNewSkill(false);
    setNewSkillName("");
  };

  const handleAddSkill = () => {
    if (isCreatingNewSkill && !newSkillName.trim()) {
      toast.error("Veuillez entrer un nom de skill");
      return;
    }

    if (!isCreatingNewSkill && !currentSkill) {
      toast.error("Veuillez sélectionner un skill");
      return;
    }

    if (!currentSkillQuestions || parseInt(currentSkillQuestions) <= 0) {
      toast.error("Veuillez entrer un nombre de questions valide");
      return;
    }

    const skillId = isCreatingNewSkill ? `custom-${Date.now()}` : currentSkill;
    const skillName = isCreatingNewSkill
      ? newSkillName.trim()
      : skills.find((s: any) => s.id === currentSkill)?.name || "";

    // Vérifier si le skill existe déjà
    if (formData.skills.some((s) => s.skillId === skillId)) {
      toast.error("Ce skill est déjà ajouté");
      return;
    }

    setFormData({
      ...formData,
      skills: [
        ...formData.skills,
        {
          skillId,
          skillName,
          questionCount: parseInt(currentSkillQuestions),
        },
      ],
    });

    // Reset skill inputs
    setCurrentSkill("");
    setCurrentSkillQuestions("");
    setIsCreatingNewSkill(false);
    setNewSkillName("");

    toast.success("Skill ajouté avec succès");
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s.skillId !== skillId),
    });
    toast.success("Skill retiré");
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      duration: quiz.duration.toString(),
      questionCount: quiz.questionCount.toString(),
      courseId: quiz.courseId,
      type: quiz.type,
      skills: [], // TODO: Load skills from quiz data
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.duration || !formData.courseId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.skills.length === 0) {
      toast.error("Veuillez ajouter au moins un skill avec des questions");
      return;
    }

    // Calculer le nombre total de questions à partir des skills
    const totalQuestions = formData.skills.reduce(
      (acc, s) => acc + s.questionCount,
      0
    );

    const quizData = {
      ...formData,
      questionCount: totalQuestions.toString(),
    };

    if (selectedQuiz) {
      updateQuizMutation.mutate({ id: selectedQuiz.id, quiz: quizData });
    } else {
      createQuizMutation.mutate(quizData);
    }
  };

  const confirmDelete = () => {
    if (selectedQuiz) {
      deleteQuizMutation.mutate(selectedQuiz.id);
    }
  };

  // Filtrage
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || quiz.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Helpers
  const getTypeColor = (type: string) => {
    switch (type) {
      case "SIMPLE":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "PHASE":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "FINAL":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SIMPLE":
        return "Simple";
      case "PHASE":
        return "Phase";
      case "FINAL":
        return "Final";
      default:
        return type;
    }
  };

  // Vérifier si courseId existe, sinon rediriger
  if (!courseId) {
    navigate("/admin/courses");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onBack ? onBack() : navigate("/admin/courses")}
            className="rounded-full h-10 w-10"
            title={onBack ? "Retour au cours" : "Retour aux cours"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
              {isCourseLoading ? (
                <span className="animate-pulse">Chargement...</span>
              ) : (
                <>Quiz - {currentCourse?.name}</>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les quiz de ce cours
            </p>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90 gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter un quiz</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              {showFilters ? (
                <X className="h-4 w-4" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent
          className={`space-y-4 ${showFilters ? "block" : "hidden"} sm:block`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <Label
                htmlFor="search"
                className="text-sm font-medium mb-2 block"
              >
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher un quiz..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <Label
                htmlFor="type-filter"
                className="text-sm font-medium mb-2 block"
              >
                Type de quiz
              </Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les types</SelectItem>
                  <SelectItem value="SIMPLE">Simple</SelectItem>
                  <SelectItem value="PHASE">Phase</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || typeFilter !== "ALL") && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Filtres actifs:
              </span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {typeFilter !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Type: {getTypeLabel(typeFilter)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setTypeFilter("ALL")}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {filteredQuizzes.length} quiz{filteredQuizzes.length > 1 ? "s" : ""}{" "}
          trouvé{filteredQuizzes.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Table Card */}
      <Card className="shadow-md border-orange-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-orange-50/50 hover:bg-orange-50/70">
                  <TableHead className="font-semibold w-[35%] px-4">
                    Titre du Quiz
                  </TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell w-[12%] px-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Clock className="h-4 w-4" />
                      Durée (min)
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell w-[12%] px-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <FileQuestion className="h-4 w-4" />
                     Nombre de Questions
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold w-[12%] px-4">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-right w-[9%] px-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 px-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <p className="text-muted-foreground">
                          Chargement des quiz...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredQuizzes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 px-4">
                      <div className="flex flex-col items-center gap-3">
                        <FileQuestion className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <p className="font-medium text-lg">
                            Aucun quiz trouvé
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {searchTerm || typeFilter !== "ALL"
                              ? "Essayez de modifier vos filtres"
                              : "Commencez par créer votre premier quiz pour ce cours"}
                          </p>
                        </div>
                        {!searchTerm && typeFilter === "ALL" && (
                            <Button onClick={handleAdd} className="mt-2 gap-2">
                              <Plus className="h-4 w-4" />
                              Créer un quiz
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuizzes.map((quiz) => (
                    <TableRow
                      key={quiz.id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      <TableCell className="font-medium w-[35%] px-4">
                        <div className="truncate" title={quiz.title}>
                          {quiz.title}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell w-[12%] px-4">
                        <Badge
                          variant="outline"
                          className="gap-1 whitespace-nowrap"
                        >
                          <Clock className="h-3 w-3" />
                          {quiz.duration} min
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-[12%] px-4">
                        <Badge
                          variant="outline"
                          className="gap-1 whitespace-nowrap"
                        >
                          <FileQuestion className="h-3 w-3" />
                          {quiz.questionCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[12%] px-4">
                        <Badge className={getTypeColor(quiz.type)}>
                          {getTypeLabel(quiz.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[9%] px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(quiz)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(quiz)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedQuiz ? "Modifier le quiz" : "Créer un nouveau quiz"}
            </DialogTitle>
            <DialogDescription>
              {selectedQuiz
                ? "Modifiez les informations du quiz ci-dessous"
                : "Remplissez les informations pour créer un nouveau quiz"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre du quiz <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Quiz Introduction à Python"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full"
                required
              />
            </div>

            {/* Course (read-only display) */}
            <div className="space-y-2">
              <Label htmlFor="course">
                Cours
              </Label>
              <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm">
                {currentCourse?.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Durée (min) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full"
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type de quiz <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                  required
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                    <SelectItem value="PHASE">Phase</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type Description */}
            <p className="text-xs text-muted-foreground bg-orange-50/30 rounded-lg p-3">
              {formData.type === "SIMPLE" &&
                "📝 Quiz simple pour évaluer une leçon spécifique"}
              {formData.type === "PHASE" &&
                "📚 Quiz de phase pour évaluer un chapitre complet"}
              {formData.type === "FINAL" &&
                "🎓 Examen final pour évaluer le cours dans son ensemble"}
            </p>

            {/* Skills Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Skills et Questions
                </Label>
                <Badge variant="outline" className="text-xs">
                  {formData.skills.reduce((acc, s) => acc + s.questionCount, 0)}{" "}
                  questions
                </Badge>
              </div>

              {/* Add Skill Form */}
              <div className="bg-orange-50/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={!isCreatingNewSkill ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCreatingNewSkill(false)}
                    className={!isCreatingNewSkill ? "bg-primary" : ""}
                  >
                    Skill existant
                  </Button>
                  <Button
                    type="button"
                    variant={isCreatingNewSkill ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCreatingNewSkill(true)}
                    className={isCreatingNewSkill ? "bg-primary" : ""}
                  >
                    + Nouveau skill
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Skill Selection or Creation */}
                  <div className="space-y-2">
                    <Label htmlFor="skill-select">
                      {isCreatingNewSkill
                        ? "Nom du skill"
                        : "Sélectionner un skill"}
                    </Label>
                    {isCreatingNewSkill ? (
                      <Input
                        id="new-skill"
                        placeholder="Ex: Algorithmes avancés"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <Select
                        value={currentSkill}
                        onValueChange={setCurrentSkill}
                      >
                        <SelectTrigger id="skill-select" className="w-full">
                          <SelectValue placeholder="Choisir un skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {skills.map((skill: any) => (
                            <SelectItem key={skill.id} value={skill.id}>
                              {skill.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Question Count */}
                  <div className="space-y-2">
                    <Label htmlFor="skill-questions">Nombre de questions</Label>
                    <Input
                      id="skill-questions"
                      type="number"
                      min="1"
                      placeholder="5"
                      value={currentSkillQuestions}
                      onChange={(e) => setCurrentSkillQuestions(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddSkill}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter ce skill
                </Button>
              </div>

              {/* Skills List */}
              {formData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Skills ajoutés :
                  </Label>
                  <div className="space-y-2">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={skill.skillId}
                        className="flex items-center justify-between bg-white border rounded-lg p-3 hover:bg-orange-50/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-primary/10">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">
                              {skill.skillName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {skill.questionCount} question
                              {skill.questionCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSkill(skill.skillId)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 sm:gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={
                  createQuizMutation.isPending || updateQuizMutation.isPending
                }
              >
                {createQuizMutation.isPending ||
                updateQuizMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enregistrement...
                  </>
                ) : selectedQuiz ? (
                  "Modifier"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le quiz "{selectedQuiz?.title}"
              sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedQuiz(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuizMutation.isPending}
            >
              {deleteQuizMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizManagementPage;
