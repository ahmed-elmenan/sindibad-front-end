import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Upload,
  AlertCircle,
  Video,
  X,
  Save,
  ArrowLeft,
  Folder,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCourseChapters } from "@/hooks/useCourseQueries";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import SkillsModal from "./SkillsModal";
import QuizManagementModal from "./QuizManagementModal";
import FinalQuizSection from "./FinalQuizSection";
import { getAllSkills } from "@/services/skill.service";
import { uploadVideos, type UploadProgressCallback } from "@/services/chapter.service";
import { quizManagementService } from "@/services/quizManagement.service";
import type { QuizDetailResponse } from "@/types/QuizManagement";
import DroppablePhase from "./DroppablePhase";
import DroppableChapterPhase from "./DroppableChapterPhase";
import DraggableVideoPhase from "./DraggableVideoPhase";

import type {
  VideoFile,
  UnifiedVideo,
  UnifiedChapter,
  UnifiedPhase,
  UnifiedPhaseManagerProps,
} from "@/types/PhaseManager";
import type { Skill } from "@/types/Skill";

const PhaseManager: React.FC<UnifiedPhaseManagerProps> = () => {
  usePageTitle("managePhases");

  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: chaptersData = [],
    isLoading: chaptersLoading,
  } = useCourseChapters(courseId);

  const [phases, setPhases] = useState<UnifiedPhase[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const isInitialLoadRef = React.useRef(true);
  
  // Skills Modal State
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  
  // Chapter Delete Modal State
  const [deleteChapterModal, setDeleteChapterModal] = useState<{
    isOpen: boolean;
    phaseId: string | null;
    chapterId: string | null;
    chapterName: string | null;
    hasUploadedVideos: boolean;
  }>({ 
    isOpen: false, 
    phaseId: null, 
    chapterId: null, 
    chapterName: null,
    hasUploadedVideos: false 
  });
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);
  
  // Phase Delete Modal State
  const [deletePhaseModal, setDeletePhaseModal] = useState<{
    isOpen: boolean;
    phaseId: string | null;
    phaseName: string | null;
    hasUploadedVideos: boolean;
  }>({ 
    isOpen: false, 
    phaseId: null, 
    phaseName: null,
    hasUploadedVideos: false 
  });
  const [isDeletingPhase, setIsDeletingPhase] = useState(false);
  const [currentEditingVideo, setCurrentEditingVideo] = useState<{
    phaseId: string;
    chapterId: string;
    videoId: string;
  } | null>(null);
  const [existingSkills, setExistingSkills] = useState<Skill[]>([]);

  // Quiz Management State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuizPhase, setCurrentQuizPhase] = useState<UnifiedPhase | null>(null);
  const [existingQuiz, setExistingQuiz] = useState<QuizDetailResponse | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Afficher la page immédiatement - ne pas bloquer sur le loading des skills
  const isLoading = chaptersLoading;

  // Charger les skills en arrière-plan sans bloquer l'affichage
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await getAllSkills();
        setExistingSkills(skills);
      } catch {
        // Toast seulement si l'utilisateur ouvre le modal skills
        // toast.error({
        //   title: "Erreur",
        //   description: "Impossible de charger les compétences existantes",
        // });
      }
    };
    loadSkills();
  }, []);

  useEffect(() => {
    if (chaptersData.length === 0) {
      return;
    }
    
    // Ne pas charger si on est en train de sauvegarder
    if (isSavingMetadata) {
      return;
    }
    
    // Ne pas recharger si on a des modifications non sauvegardées ET que ce n'est pas le premier chargement
    if (hasChanges && !isInitialLoadRef.current) {
      return;
    }
    
    // Marquer comme chargé après le premier rendu
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }

    // Sauvegarder l'état isEditing actuel des vidéos pour le préserver
    const currentEditingState = new Map<string, boolean>();
    phases.forEach(phase => {
      phase.chapters.forEach(chapter => {
        chapter.videos.forEach(video => {
          if (video.originalLessonId && video.isEditing) {
            currentEditingState.set(video.originalLessonId, true);
          }
        });
      });
    });

    // Group lessons by miniChapter to create chapters
    const processedPhases: UnifiedPhase[] = chaptersData.map((backendChapter, phaseIndex) => {
      
      // Group lessons by miniChapter
      const chapterMap = new Map<string, UnifiedVideo[]>();
      
      (backendChapter.lessons || [])
        .sort((a, b) => a.order - b.order)
        .forEach((lesson) => {
          const miniChapter = lesson.miniChapter || "Default Chapter";
          if (!chapterMap.has(miniChapter)) {
            chapterMap.set(miniChapter, []);
          }
          
          // Préserver l'état isEditing si la vidéo était en cours d'édition
          const wasEditing = currentEditingState.get(lesson.id) || false;
          
          chapterMap.get(miniChapter)!.push({
            id: `unified-video-${lesson.id}`,
            originalLessonId: lesson.id,
            name: lesson.title,
            title: lesson.title,
            description: "",
            duration: typeof lesson.duration === "number" ? lesson.duration : 0,
            videoUrl: lesson.videoUrl,
            thumbnailUrl: lesson.thumbnailUrl,
            fileSize: lesson.fileSize,
            order: lesson.order,
            skills: lesson.skills?.map(skillName => ({ 
              id: skillName, 
              name: skillName, 
              level: "BEGINNER" 
            })) || [],
            isNew: false,
            isDeleted: false,
            isEditing: wasEditing, // Préserver l'état d'édition
            isMoved: false,
            originalChapterId: `unified-chapter-${backendChapter.id}-${miniChapter}`,
            originalPhaseId: `unified-phase-${backendChapter.id}`,
            sourceChapterType: "existing",
            sourcePhaseType: "existing",
          });
        });

      // Create chapters from the map
      const chapters: UnifiedChapter[] = Array.from(chapterMap.entries()).map(
        ([miniChapter, videos], chapterIndex) => {
          return {
            id: `unified-chapter-${backendChapter.id}-${miniChapter}`,
            chapterNumber: chapterIndex + 1,
            miniChapter,
            videos,
            isNew: false,
            isDeleted: false,
            isEditing: false,
            isExpanded: chapterIndex === 0,
            isSelected: false,
            originalChapterId: `${backendChapter.id}-${miniChapter}`,
          };
        }
      );

      return {
        id: `unified-phase-${backendChapter.id}`,
        originalPhaseId: backendChapter.id,
        phaseNumber: backendChapter.order,
        title: backendChapter.title,
        description: backendChapter.description || "",
        order: backendChapter.order,
        chapters,
        isNew: false,
        isDeleted: false,
        isEditing: false,
        isExpanded: phaseIndex === 0,
        isSelected: false,
      };
    });


    
    setPhases(processedPhases);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaptersData, hasChanges, isSavingMetadata]);

  // Validate file naming convention: ph1-ch1-v1.mp4
  const validateFileName = (fileName: string): boolean => {
    const pattern = /^ph\d+-ch\d+-v\d+\.[a-zA-Z0-9]+$/;
    return pattern.test(fileName);
  };

  // Extract phase, chapter, video numbers from filename
  const parseFileName = useCallback((fileName: string): { phase: number; chapter: number; video: number } | null => {
    const match = fileName.match(/^ph(\d+)-ch(\d+)-v(\d+)/);
    if (!match) return null;
    return {
      phase: parseInt(match[1]),
      chapter: parseInt(match[2]),
      video: parseInt(match[3]),
    };
  }, []);

  // Toggle phase expansion
  const togglePhaseExpansion = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId ? { ...phase, isExpanded: !phase.isExpanded } : phase
      )
    );
  };

  // Toggle chapter expansion
  const toggleChapterExpansion = (phaseId: string, chapterId: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              chapters: phase.chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch
              ),
            }
          : phase
      )
    );
  };

  // Toggle phase edit
  const togglePhaseEdit = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId ? { ...phase, isEditing: !phase.isEditing } : phase
      )
    );
  };

  // Update phase field
  const updatePhaseField = (phaseId: string, field: "title" | "description", value: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId ? { ...phase, [field]: value, hasModifications: true } : phase
      )
    );
    setHasChanges(true);
  };

  // Toggle chapter edit
  const toggleChapterEdit = (phaseId: string, chapterId: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              chapters: phase.chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, isEditing: !ch.isEditing } : ch
              ),
            }
          : phase
      )
    );
  };

  // Update chapter field
  const updateChapterField = (phaseId: string, chapterId: string, value: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              chapters: phase.chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, miniChapter: value.trim(), hasModifications: true } : ch
              ),
            }
          : phase
      )
    );
    setHasChanges(true);
  };

  // Save metadata changes (phase/chapter titles and descriptions) without uploading videos
  const handleSaveMetadataOnly = async () => {
    setIsSavingMetadata(true);
    try {
      
      let updatedCount = 0;
      
      // Update existing phases (Chapter entities in backend)
      for (const phase of phases) {
        if (!phase.isNew && !phase.isDeleted && phase.originalPhaseId && phase.hasModifications) {
          // Update phase (Chapter in backend)
          await api.patch(`/admin/chapters/${phase.originalPhaseId}`, {
            title: phase.title,
            description: phase.description,
            order: phase.phaseNumber,
          });
          updatedCount++;
        }
        
        // Update chapters and their videos
        for (const chapter of phase.chapters) {
          // Track which videos have been updated to avoid duplicate requests
          const updatedVideoIds = new Set<string>();
                              
          // Update existing videos with skills or other modifications
          for (const video of chapter.videos) {
            
            if (video.originalLessonId && !video.isNew && !video.isDeleted && video.isEditing) {
              // Update video with skills AND miniChapter if chapter was edited
              const payload = {
                title: video.title,
                description: video.description,
                skills: video.skills?.map(s => s.name) || [],
                referenceUrl: video.referenceUrl || "",
                ...(chapter.hasModifications && { miniChapter: chapter.miniChapter }), // Include miniChapter if chapter was edited
              };
              
              await api.patch(`/admin/videos/${video.originalLessonId}`, payload);
              updatedCount++;
              updatedVideoIds.add(video.originalLessonId);
            }
          }
          
          // If chapter name (miniChapter) was edited, update remaining videos that weren't already updated
          if (chapter.hasModifications && !chapter.isNew && !chapter.isDeleted) {
            for (const video of chapter.videos) {
              if (video.originalLessonId && !video.isDeleted && !updatedVideoIds.has(video.originalLessonId)) {
                await api.patch(`/admin/videos/${video.originalLessonId}`, {
                  miniChapter: chapter.miniChapter,
                });
                updatedCount++;
              }
            }
          }
        }
      }
      
      // Désactiver le mode édition pour toutes les phases et chapitres
      setPhases((prev) =>
        prev.map((phase) => ({
          ...phase,
          isEditing: false,
          hasModifications: false,
          chapters: phase.chapters.map((ch) => ({
            ...ch,
            isEditing: false,
            hasModifications: false,
          })),
        }))
      );
      
      if (updatedCount > 0) {
        toast.success("Modifications sauvegardées avec succès !");
      } else {
        toast.info("Aucune modification à sauvegarder");
      }
      
      setHasChanges(false);
      
      // Permettre le rechargement des données après la sauvegarde
      isInitialLoadRef.current = true;
      
      // Invalider le cache et refetch immédiatement pour synchroniser les données
      await queryClient.invalidateQueries({
        queryKey: ['course-chapters', courseId],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSavingMetadata(false);
    }
  };

  // Delete chapter with confirmation if it has uploaded videos
  const handleDeleteChapter = (phaseId: string, chapterId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    const chapter = phase?.chapters.find(ch => ch.id === chapterId);
    
    if (!chapter || !phase) return;
    
    // Vérifier si le chapitre contient des vidéos déjà uploadées (avec originalLessonId)
    const hasUploadedVideos = chapter.videos.some(v => v.originalLessonId && !v.isDeleted);
    
    // Vérifier si le chapitre existe dans le backend (pas nouveau)
    const existsInBackend = !chapter.isNew && phase.originalPhaseId;
    
    if (existsInBackend) {
      // Toujours afficher le modal de confirmation pour les chapitres existants
      setDeleteChapterModal({
        isOpen: true,
        phaseId,
        chapterId,
        chapterName: chapter.miniChapter,
        hasUploadedVideos,
      });
    } else {
      // Suppression immédiate uniquement pour les chapitres nouveaux (pas encore dans le backend)
      setPhases((prev) =>
        prev.map((p) =>
          p.id === phaseId
            ? {
                ...p,
                chapters: p.chapters.map((ch) =>
                  ch.id === chapterId ? { ...ch, isDeleted: true } : ch
                ),
              }
            : p
        )
      );
      setHasChanges(true);
      toast.success({
        title: "Chapitre supprimé",
        description: `Le chapitre "${chapter.miniChapter}" a été supprimé`,
      });
    }
  };

  // Delete phase with confirmation if it has uploaded videos
  const handleDeletePhase = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    
    if (!phase) return;
    
    // Vérifier si la phase existe dans le backend (a un originalPhaseId)
    const existsInBackend = !phase.isNew && phase.originalPhaseId;
    
    // Vérifier si la phase contient des vidéos déjà uploadées (avec originalLessonId)
    const hasUploadedVideos = phase.chapters.some(ch => 
      ch.videos.some(v => v.originalLessonId && !v.isDeleted)
    );
    
    if (existsInBackend) {
      // Toujours afficher le modal de confirmation pour les phases existantes
      setDeletePhaseModal({
        isOpen: true,
        phaseId,
        phaseName: phase.title,
        hasUploadedVideos,
      });
    } else {
      // Suppression immédiate uniquement pour les phases nouvelles (pas encore dans le backend)
      setPhases((prev) => prev.map((p) => p.id === phaseId ? { ...p, isDeleted: true } : p));
      setHasChanges(true);
      toast.success({
        title: "Phase supprimée",
        description: `La phase "${phase.title}" a été supprimée`,
      });
    }
  };

  // Confirmer la suppression de la phase avec appel backend
  const confirmDeletePhase = async () => {
    if (!deletePhaseModal.phaseId) return;
    
    const phase = phases.find(p => p.id === deletePhaseModal.phaseId);
    
    if (!phase) return;
    
    setIsDeletingPhase(true);
    
    try {
      // Appeler le backend pour supprimer la phase complète (Chapter) et toutes ses vidéos
      await api.delete(`/chapters/${phase.originalPhaseId}`);
            
      // Supprimer immédiatement la phase de l'UI
      setPhases((prev) => prev.filter(p => p.id !== deletePhaseModal.phaseId));
      
      // Invalider le cache ET recharger les données depuis le serveur
      await queryClient.invalidateQueries({ 
        queryKey: ['course-chapters', courseId],
        refetchType: 'active' // Force le rechargement immédiat pour éviter les doublons affichés
      });
      
      toast.success({
        title: "Phase supprimée",
        description: `La phase "${phase.title}" et toutes ses vidéos ont été supprimées avec succès`,
      });
      
      setDeletePhaseModal({ 
        isOpen: false, 
        phaseId: null, 
        phaseName: null,
        hasUploadedVideos: false 
      });
    } catch {
      toast.error({
        title: "Erreur de suppression",
        description: "Impossible de supprimer la phase. Veuillez réessayer.",
      });
    } finally {
      setIsDeletingPhase(false);
    }
  };

  // Confirmer la suppression du chapitre avec appel backend
  const confirmDeleteChapter = async () => {
    if (!deleteChapterModal.phaseId || !deleteChapterModal.chapterId || !deleteChapterModal.chapterName) return;
    
    const phase = phases.find(p => p.id === deleteChapterModal.phaseId);
    const chapter = phase?.chapters.find(ch => ch.id === deleteChapterModal.chapterId);
    
    if (!chapter || !phase) return;
    
    setIsDeletingChapter(true);
    
    try {
      // Appeler le backend pour supprimer le chapitre et ses vidéos
      // phase.originalPhaseId contient l'UUID du Chapter backend
      // chapter.miniChapter contient le nom du mini-chapitre (qui correspond à lesson.miniChapter)
      await api.delete(`/chapters/delete`, {
        params: {
          chapterId: phase.originalPhaseId, // UUID du Chapter backend
          chapterName: deleteChapterModal.chapterName // miniChapter à supprimer
        }
      });
            
      // Supprimer immédiatement le chapitre de l'UI
      setPhases((prev) =>
        prev.map((p) =>
          p.id === deleteChapterModal.phaseId
            ? {
                ...p,
                chapters: p.chapters.filter(ch => ch.id !== deleteChapterModal.chapterId),
              }
            : p
        )
      );
      
      // Invalider le cache ET recharger les données depuis le serveur
      await queryClient.invalidateQueries({ 
        queryKey: ['course-chapters', courseId],
        refetchType: 'active' // Force le rechargement immédiat pour éviter les doublons affichés
      });
      
      toast.success({
        title: "Chapitre supprimé",
        description: `Le chapitre "${chapter.miniChapter}" et toutes ses vidéos ont été supprimés avec succès`,
      });
      
      setDeleteChapterModal({ 
        isOpen: false, 
        phaseId: null, 
        chapterId: null, 
        chapterName: null,
        hasUploadedVideos: false 
      });
    } catch (error: unknown) {
      toast.error({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer le chapitre",
      });
    } finally {
      setIsDeletingChapter(false);
    }
  };

  // Handle skills save from modal
  const handleSkillsSave = useCallback((skills: Skill[]) => {
    if (!currentEditingVideo) {
      return;
    }

    const { phaseId, chapterId, videoId } = currentEditingVideo;

    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              chapters: p.chapters.map((ch) =>
                ch.id === chapterId
                    ? {
                      ...ch,
                      videos: ch.videos.map((v) => {
                        if (v.id === videoId) {
                          return { ...v, skills, isEditing: false };
                        }
                        return v;
                      }),
                    }
                  : ch
              ),
            }
          : p
      )
    );

    setCurrentEditingVideo(null);
    setHasChanges(true);
    // Ajoute un toast succès pour feedback utilisateur
    toast.success({
      title: "Succès",
      description: "Les compétences de la vidéo ont été enregistrées et synchronisées.",
    });
  }, [currentEditingVideo]);

  // Handle phase quiz management
  const handleManagePhaseQuiz = async (phase: UnifiedPhase) => {
    if (!phase.originalPhaseId) {
      toast.error({
        title: "Erreur",
        description: "La phase doit être enregistrée avant de créer un quiz",
      });
      return;
    }

    setCurrentQuizPhase(phase);
    setShowQuizModal(true);
    setIsLoadingQuiz(true);

    quizManagementService.getQuizByChapterId(phase.originalPhaseId)
      .then((quiz) => {
        setExistingQuiz(quiz);
      })
      .catch((error) => {
        console.error("Error loading phase quiz:", error);
        toast.error({
          title: "Erreur",
          description: "Impossible de charger les informations du quiz",
        });
      })
      .finally(() => {
        setIsLoadingQuiz(false);
      });
  };

  // Get all skills from a phase (from all lessons in all chapters)
  const getPhaseSkills = (phase: UnifiedPhase): Skill[] => {
    const skillsMap = new Map<string, Skill>();
    
    phase.chapters
      .filter((ch) => !ch.isDeleted)
      .forEach((chapter) => {
        chapter.videos
          .filter((v) => !v.isDeleted)
          .forEach((video) => {
            video.skills?.forEach((skill) => {
              if (!skillsMap.has(skill.id)) {
                skillsMap.set(skill.id, skill);
              }
            });
          });
      });

    return Array.from(skillsMap.values());
  };

  // Get all skills from the entire course
  const getCourseSkills = (): Skill[] => {
    const skillsMap = new Map<string, Skill>();
    
    phases
      .filter((p) => !p.isDeleted)
      .forEach((phase) => {
        phase.chapters
          .filter((ch) => !ch.isDeleted)
          .forEach((chapter) => {
            chapter.videos
              .filter((v) => !v.isDeleted)
              .forEach((video) => {
                video.skills?.forEach((skill) => {
                  if (!skillsMap.has(skill.id)) {
                    skillsMap.set(skill.id, skill);
                  }
                });
              });
          });
      });

    return Array.from(skillsMap.values());
  };

  const handleQuizSuccess = () => {
    toast.success({
      title: "Succès",
      description: "Le quiz a été enregistré avec succès",
    });
    // Mettre à jour les compétences de la phase localement
    if (currentQuizPhase && existingQuiz) {
      setPhases((prevPhases) =>
        prevPhases.map((phase) =>
          phase.id === currentQuizPhase.id
            ? {
                ...phase,
                quiz: existingQuiz,
                // Si le quiz contient des compétences, les mettre à jour
                skills: existingQuiz.skills?.map((s) => ({
                  id: s.skillId,
                  name: s.skillName,
                })) || phase.skills,
              }
            : phase
        )
      );
    }
    setShowQuizModal(false);
    setCurrentQuizPhase(null);
    setExistingQuiz(null);
  };

  // Organize uploaded files into phase/chapter/video structure
  const organizeFiles = useCallback((files: VideoFile[]) => {
    const phaseMap = new Map<number, Map<number, VideoFile[]>>();

    files.forEach((file) => {
      const parsed = parseFileName(file.name);
      if (!parsed) return;

      const { phase, chapter } = parsed;

      if (!phaseMap.has(phase)) {
        phaseMap.set(phase, new Map());
      }
      const chapterMap = phaseMap.get(phase)!;

      if (!chapterMap.has(chapter)) {
        chapterMap.set(chapter, []);
      }
      chapterMap.get(chapter)!.push(file);
    });

    setPhases((prev) => {
      const updated = [...prev];

      phaseMap.forEach((chapterMap, phaseNumber) => {
        let phase = updated.find((p) => p.phaseNumber === phaseNumber && !p.isDeleted);

        if (!phase) {
          // Create new phase
          phase = {
            id: `new-phase-${Date.now()}-${phaseNumber}`,
            phaseNumber,
            title: `Phase ${phaseNumber}`,
            description: "",
            order: phaseNumber,
            chapters: [],
            isNew: true,
            isDeleted: false,
            isEditing: false,
            isExpanded: true,
            isSelected: false,
          };
          updated.push(phase);
        }

        chapterMap.forEach((videos, chapterNumber) => {
          const newVideos: UnifiedVideo[] = videos.map((video, index) => {
            const parsed = parseFileName(video.name);
            return {
              id: `new-video-${Date.now()}-${Math.random()}-${index}`,
              name: video.name,
              fileName: video.name,
              title: video.name.replace(/\.[^/.]+$/, ""),
              description: "",
              duration: 0,
              order: 0,
              file: video,
              fileSize: video.size,
              skills: [],
              isNew: true,
              isEditing: false,
              isDeleted: false,
              isMoved: false,
              sourceChapterType: "new",
              sourcePhaseType: "new",
              phaseNumber: parsed?.phase || phaseNumber,
              chapterNumber: parsed?.chapter || chapterNumber,
              videoNumber: parsed?.video || (index + 1),
            };
          });

          const chapter = phase!.chapters.find(
            (ch) => ch.chapterNumber === chapterNumber && !ch.isDeleted
          );

          if (chapter) {
            // Calculer maxOrder en excluant les vidéos supprimées
            const activeVideos = chapter.videos.filter(v => !v.isDeleted);
            const maxOrder = activeVideos.length > 0 ? Math.max(...activeVideos.map((v) => v.order)) : 0;
            newVideos.forEach((video, index) => {
              video.order = maxOrder + index + 1;
            });
            chapter.videos = [...chapter.videos, ...newVideos].sort((a, b) => a.order - b.order);
          } else {
            newVideos.forEach((video, index) => {
              video.order = index + 1;
            });
            phase!.chapters.push({
              id: `new-chapter-${Date.now()}-${chapterNumber}`,
              chapterNumber,
              miniChapter: `Chapter ${chapterNumber}`,
              videos: newVideos,
              isNew: true,
              isDeleted: false,
              isEditing: false,
              isExpanded: true,
              isSelected: false,
            });
          }
        });
      });

      return updated.sort((a, b) => a.phaseNumber - b.phaseNumber);
    });

    setHasChanges(true);
  }, [parseFileName]);

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const videoFiles = acceptedFiles as VideoFile[];

      const invalidNames = videoFiles
        .filter((file) => !validateFileName(file.name))
        .map((file) => file.name);

      if (invalidNames.length > 0) {
        invalidNames.forEach((name) => {
          toast.error({
            title: t("admin.phaseManager.errors.invalidNaming.title", "Nom de fichier invalide"),
            description: t(
              "admin.phaseManager.errors.invalidNaming.description",
              "Le fichier {{name}} ne respecte pas le format ph1-ch1-v1.mp4",
              { name }
            ),
          });
        });
        return;
      }

      setInvalidFiles([]);
      toast.success({
        title: t("admin.phaseManager.success.filesValidated.title", "Fichiers validés"),
        description: t(
          "admin.phaseManager.success.filesValidated.description",
          "{{count}} fichier(s) prêt(s) pour l'upload",
          { count: videoFiles.length }
        ),
      });

      organizeFiles(videoFiles);
    },
    [t, organizeFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
  });

  // Placeholder upload function
  const handleUpload = async () => {
    if (!courseId) {
      toast.error({
        title: "Erreur",
        description: "ID du cours manquant",
      });
      return;
    }

    // Collect all files and metadata from phases
    const allFiles: File[] = [];
    const chaptersMetadata: any[] = [];
    const videosWithoutSkills: string[] = [];

    phases
      .filter((p) => !p.isDeleted)
      .forEach((phase) => {
        phase.chapters
          .filter((ch) => !ch.isDeleted && ch.isNew)
          .forEach((chapter) => {
            const chapterVideos = chapter.videos
              .filter((v) => !v.isDeleted && v.isNew && v.file)
              .map((video) => {
                // Check if video has at least 1 skill
                if (!video.skills || video.skills.length === 0) {
                  videosWithoutSkills.push(video.title);
                }
                
                if (video.file) {
                  allFiles.push(video.file);
                }

                return {
                  name: video.fileName || video.name, // Nom du fichier original
                  title: video.title, // Titre modifiable
                  description: video.description || "",
                  order: video.order,
                  skills: video.skills?.map(s => s.name) || [],
                  referenceUrl: video.referenceUrl || "",
                  chapterName: chapter.miniChapter, // Nom du mini-chapitre (pour identifier les leçons du même chapitre)
                };
              });

            if (chapterVideos.length > 0) {
              chaptersMetadata.push({
                chapterId: phase.phaseNumber, // phaseNumber devient chapterId dans le backend
                number: chapter.chapterNumber,
                title: phase.title, // Titre de la phase (devient le titre du Chapter dans le backend)
                description: phase.description || "", // Description de la phase (devient la description du Chapter)
                chapterName: chapter.miniChapter, // Nom du mini-chapitre (pour regrouper les leçons)
                videos: chapterVideos,
              });
            }
          });
      });

    if (allFiles.length === 0) {
      toast.error({
        title: "Aucun fichier à uploader",
        description: "Veuillez ajouter des vidéos avant de sauvegarder",
      });
      return;
    }

    // Check if any video has no skills
    if (videosWithoutSkills.length > 0) {
      toast.error({
        title: "Compétences manquantes",
        description: `${videosWithoutSkills.length} vidéo(s) n'ont pas de compétences associées: ${videosWithoutSkills.slice(0, 3).join(", ")}${videosWithoutSkills.length > 3 ? "..." : ""}. Veuillez ajouter au moins une compétence à chaque vidéo.`,
        duration: 8000,
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const onProgress: UploadProgressCallback = (progress) => {
        setUploadProgress(progress);
      };

      await uploadVideos(
        courseId,
        allFiles,
        { chapters: chaptersMetadata },
        onProgress
      );

      toast.success({
        title: "Succès",
        description: `${allFiles.length} vidéo(s) uploadée(s) avec succès`,
      });

      setHasChanges(false);
      setUploadProgress(0);

      // Permettre le rechargement des données après l'upload
      isInitialLoadRef.current = true;

      // Invalider le cache pour forcer le rechargement
      await queryClient.invalidateQueries({ 
        queryKey: ['course-chapters', courseId],
        refetchType: 'active'
      });
    } catch (error) {
      toast.error({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50/30 p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-7xl mx-auto shadow-xl border-0 rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 pt-0">
          <CardHeader className="bg-gradient-to-r from-primary to-muted text-white relative overflow-hidden py-5">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/courses/${courseId}`)}
                      className="group rounded-full h-11 w-11 bg-white border-2 border-white hover:scale-[1.02] hover:!bg-white shadow-sm hover:shadow-md backdrop-blur-sm flex-shrink-0 transition-all duration-300"
                    >
                      <ArrowLeft className="h-5 w-5 text-primary transition-colors duration-300" />
                    </Button>

                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                        {t("admin.phaseManager.title", "Gestionnaire de Phases")}
                      </CardTitle>
                      <p className="text-white/90 text-sm md:text-base">
                        Organisez les phases, chapitres et vidéos de votre cours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-white/80 text-sm flex-shrink-0">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Folder className="h-4 w-4" />
                      {phases.filter((p) => !p.isDeleted).length} phases
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Video className="h-4 w-4" />
                      {phases
                        .filter((p) => !p.isDeleted)
                        .reduce(
                          (total, p) =>
                            total +
                            p.chapters
                              .filter((ch) => !ch.isDeleted)
                              .reduce((chTotal, ch) => chTotal + ch.videos.filter((v) => !v.isDeleted).length, 0),
                          0
                        )}{" "}
                      vidéos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Upload Area */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-primary to-muted rounded-full"></div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
                  {t("admin.phaseManager.addContent", "Ajouter du Contenu Vidéo")}
                </h3>
              </div>

              <div
                {...getRootProps()}
                className={`
                  relative overflow-hidden border-2 border-dashed rounded-2xl p-4 md:p-6 text-center cursor-pointer 
                  transition-all duration-300 group
                  ${
                    isDragActive
                      ? "border-primary bg-gradient-to-br from-orange-50 to-yellow-50 scale-[1.02] shadow-lg"
                      : "border-gray-300 hover:border-primary hover:bg-gradient-to-br hover:from-gray-50 hover:to-orange-50/30"
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="relative z-10 space-y-3">
                  
                  {/* Upload Icon */}
                  <div
                    className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isDragActive
                        ? "bg-gradient-to-br from-primary to-muted text-white scale-110 shadow-xl"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-orange-100 group-hover:to-yellow-100 group-hover:text-primary group-hover:shadow-md"
                    }`}
                  >
                    <Upload className="w-7 h-7" />
                  </div>

                  {/* Main Title */}
                  <div>
                    <h4
                      className={`text-lg md:text-xl font-bold mb-1 transition-colors ${
                        isDragActive ? "text-primary" : "text-gray-900 group-hover:text-primary"
                      }`}
                    >
                      {isDragActive
                        ? t("admin.phaseManager.dropHere", "Déposez vos fichiers ici")
                        : t("admin.phaseManager.dragDrop", "Glissez-déposez vos vidéos")}
                    </h4>
                    <p className="text-xs text-gray-500">
                      ou cliquez pour parcourir vos fichiers
                    </p>
                  </div>

                  {/* Format Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 text-xs font-medium text-blue-700">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    Format : ph1-ch1-v1.mp4
                  </div>

                  {/* Nomenclature Guide */}
                  <div className="max-w-xl mx-auto">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3 shadow-sm">
                      {/* Title */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">📋</span>
                        </div>
                        <h5 className="text-sm font-bold text-orange-900">
                          Guide de nomenclature
                        </h5>
                      </div>

                      {/* Format Pattern */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-md p-2 mb-2 border border-orange-200/50">
                        <p className="text-center text-base font-mono font-bold text-gray-800 mb-2">
                          ph<span className="text-primary">1</span>-ch<span className="text-primary">1</span>-v<span className="text-primary">1</span>.mp4
                        </p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-10 h-6 bg-primary/10 rounded font-mono font-bold text-primary text-xs">
                              ph1
                            </span>
                            <span className="text-gray-700 flex-1">
                              → <span className="font-semibold text-gray-900">Phase 1</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-10 h-6 bg-primary/10 rounded font-mono font-bold text-primary text-xs">
                              ch1
                            </span>
                            <span className="text-gray-700 flex-1">
                              → <span className="font-semibold text-gray-900">Chapitre 1</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-10 h-6 bg-primary/10 rounded font-mono font-bold text-primary text-xs">
                              v1
                            </span>
                            <span className="text-gray-700 flex-1">
                              → <span className="font-semibold text-gray-900">Vidéo 1</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Warning Alert */}
                      <div className="bg-red-500 rounded-md p-2 text-white">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-xs mb-0.5">ATTENTION</p>
                            <p className="text-[10px] text-red-50">
                              Respectez strictement cette nomenclature. Tout fichier non conforme sera rejeté.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supported Formats */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                    <span>Format accepté :</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">.mp4</span>
                  </div>
                </div>
              </div>

              {invalidFiles.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="text-red-800 font-medium mb-2">Erreurs de Validation</h4>
                      <ul className="space-y-1 text-sm text-red-700">
                        {invalidFiles.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phases List */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-muted to-secondary rounded-full"></div>
                <h3 className="text-xl font-semibold">Phases du cours</h3>
              </div>

              {phases.filter((p) => !p.isDeleted).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-600">Aucune phase pour le moment</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {phases
                    .filter((p) => !p.isDeleted)
                    .sort((a, b) => a.phaseNumber - b.phaseNumber)
                    .map((phase) => (
                      <DroppablePhase
                        key={phase.id}
                        phase={phase}
                        onSelect={() => {}}
                        isSelected={false}
                        onToggleExpansion={() => togglePhaseExpansion(phase.id!)}
                        onToggleEdit={() => togglePhaseEdit(phase.id!)}
                        onSave={() => {
                          togglePhaseEdit(phase.id!);
                          setHasChanges(true);
                        }}
                        onDelete={() => handleDeletePhase(phase.id!)}
                        onUpdate={(field, value) => updatePhaseField(phase.id!, field, value)}
                        onDropVideo={() => {}}
                        onAddChapter={() => {}}
                        onManageQuiz={phase.originalPhaseId ? () => handleManagePhaseQuiz(phase) : undefined}
                      >
                        {phase.chapters
                          .filter((ch) => !ch.isDeleted)
                          .sort((a, b) => a.chapterNumber - b.chapterNumber)
                          .map((chapter) => (
                            <DroppableChapterPhase
                              key={chapter.id}
                              chapter={chapter}
                              phaseId={phase.id!}
                              onToggleExpansion={() => toggleChapterExpansion(phase.id!, chapter.id!)}
                              onToggleEdit={() => toggleChapterEdit(phase.id!, chapter.id!)}
                              onUpdate={(value: string) => updateChapterField(phase.id!, chapter.id!, value)}
                              onDelete={() => handleDeleteChapter(phase.id!, chapter.id!)}
                              onDrop={() => {
                                // TODO: Implement video move logic
                              }}
                            >
                              {chapter.videos
                                .filter((v) => !v.isDeleted)
                                .sort((a, b) => a.order - b.order)
                                .map((video) => (
                                  <DraggableVideoPhase
                                    key={video.id}
                                    video={video}
                                    chapterId={chapter.id!}
                                    phaseId={phase.id!}
                                    existingSkills={existingSkills}
                                    onEdit={(v) => {
                                      setCurrentEditingVideo({
                                        phaseId: phase.id!,
                                        chapterId: chapter.id!,
                                        videoId: v.id!,
                                      });
                                      setSkillsModalOpen(true);
                                    }}
                                    onDelete={(videoId) => {
                                      setPhases((prev) =>
                                        prev.map((p) => {
                                          if (p.id !== phase.id) return p;
                                          
                                          // Marquer la vidéo comme supprimée
                                          const updatedChapters = p.chapters.map((ch) => {
                                            if (ch.id !== chapter.id) return ch;
                                            
                                            const updatedVideos = ch.videos.map((v) =>
                                              v.id === videoId ? { ...v, isDeleted: true } : v
                                            );
                                            
                                            // Vérifier s'il reste des vidéos actives dans ce chapitre
                                            const hasActiveVideos = updatedVideos.some(v => !v.isDeleted);
                                            
                                            // Si plus de vidéos actives, marquer le chapitre comme supprimé
                                            return {
                                              ...ch,
                                              videos: updatedVideos,
                                              isDeleted: !hasActiveVideos
                                            };
                                          });
                                          
                                          // Ne PAS supprimer la phase, juste mettre à jour les chapitres
                                          return {
                                            ...p,
                                            chapters: updatedChapters
                                          };
                                        })
                                      );
                                      setHasChanges(true);
                                    }}
                                    onUpdate={(videoId, updates) => {
                                      setPhases((prev) =>
                                        prev.map((p) =>
                                          p.id === phase.id
                                            ? {
                                                ...p,
                                                chapters: p.chapters.map((ch) =>
                                                  ch.id === chapter.id
                                                    ? {
                                                        ...ch,
                                                        videos: ch.videos.map((v) => {
                                                          if (v.id === videoId) {
                                                            return { ...v, ...updates, isEditing: true };
                                                          }
                                                          return v;
                                                        }),
                                                      }
                                                    : ch
                                                ),
                                              }
                                            : p
                                        )
                                      );
                                      setHasChanges(true);
                                    }}
                                  />
                                ))}
                            </DroppableChapterPhase>
                          ))}
                      </DroppablePhase>
                    ))}
                </div>
              )}
            </div>

            {/* Final Quiz Section */}
            {courseId && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                  <h3 className="text-xl font-semibold">Quiz Final du Cours</h3>
                </div>
                <FinalQuizSection
                  courseId={courseId}
                  courseTitle="Cours"
                  availableSkills={getCourseSkills()}
                />
              </div>
            )}

            {hasChanges && (
              <div className="bg-gradient-to-r from-gray-50 to-secondary/10 rounded-2xl p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Modifications Non Sauvegardées</h4>
                    <p className="text-sm text-gray-600">
                      {isUploading 
                        ? `Upload en cours... ${uploadProgress}%` 
                        : phases.some(p => !p.isDeleted && p.chapters.some(ch => ch.isNew && !ch.isDeleted && ch.videos.some(v => v.isNew && !v.isDeleted && v.file)))
                        ? "Enregistrez vos nouvelles vidéos"
                        : "Modifications de métadonnées en attente d'enregistrement"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setHasChanges(false)}
                      disabled={isUploading || isSavingMetadata}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    
                    {/* Button for saving metadata changes only (no video upload) */}
                    {!phases.some(p => !p.isDeleted && p.chapters.some(ch => ch.isNew && !ch.isDeleted && ch.videos.some(v => v.isNew && !v.isDeleted && v.file))) && (
                      <Button
                        onClick={handleSaveMetadataOnly}
                        disabled={isUploading || isSavingMetadata}
                        className="bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingMetadata ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* Button for uploading new videos */}
                    {phases.some(p => !p.isDeleted && p.chapters.some(ch => ch.isNew && !ch.isDeleted && ch.videos.some(v => v.isNew && !v.isDeleted && v.file))) && (
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || isSavingMetadata}
                        className="bg-gradient-to-r from-primary to-muted hover:from-primary/90 hover:to-muted/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Upload {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Uploader les vidéos
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-muted h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills Modal */}
      <SkillsModal
        open={skillsModalOpen}
        onClose={() => {
          setSkillsModalOpen(false);
          setCurrentEditingVideo(null);
        }}
        onSave={handleSkillsSave}
        initialSkills={
          currentEditingVideo
            ? phases
                .find((p) => p.id === currentEditingVideo.phaseId)
                ?.chapters.find((ch) => ch.id === currentEditingVideo.chapterId)
                ?.videos.find((v) => v.id === currentEditingVideo.videoId)?.skills || []
            : []
        }
        existingSkills={existingSkills}
      />

      {/* Phase Quiz Management Modal */}
      {showQuizModal && currentQuizPhase && currentQuizPhase.originalPhaseId && (
        <QuizManagementModal
          open={showQuizModal}
          onClose={() => {
            setShowQuizModal(false);
            setCurrentQuizPhase(null);
            setExistingQuiz(null);
          }}
          quizType="PHASE_QUIZ"
          resourceId={currentQuizPhase.originalPhaseId}
          resourceTitle={currentQuizPhase.title}
          availableSkills={getPhaseSkills(currentQuizPhase)}
          existingQuiz={existingQuiz}
          onSuccess={handleQuizSuccess}
          loading={isLoadingQuiz}
        />
      )}

      {/* Phase Delete Confirmation Modal */}
      {deletePhaseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Confirmer la suppression de la phase
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Folder className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-2">
                    Êtes-vous sûr de vouloir supprimer cette phase complète ?
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {deletePhaseModal.phaseName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    Cette action est irréversible. La phase entière avec TOUS ses chapitres et TOUTES ses vidéos (avec leurs miniatures) seront définitivement supprimés de S3 et de la base de données.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletePhaseModal({ 
                  isOpen: false, 
                  phaseId: null, 
                  phaseName: null,
                  hasUploadedVideos: false 
                })}
                disabled={isDeletingPhase}
                className="border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmDeletePhase}
                disabled={isDeletingPhase}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {isDeletingPhase ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer définitivement
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Delete Confirmation Modal */}
      {deleteChapterModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Confirmer la suppression du chapitre
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Folder className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-2">
                    Êtes-vous sûr de vouloir supprimer ce chapitre ?
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {deleteChapterModal.chapterName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    Cette action est irréversible. Le chapitre et toutes ses vidéos (avec leurs miniatures) seront définitivement supprimés de S3 et de la base de données.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteChapterModal({ 
                  isOpen: false, 
                  phaseId: null, 
                  chapterId: null, 
                  chapterName: null,
                  hasUploadedVideos: false 
                })}
                disabled={isDeletingChapter}
                className="border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmDeleteChapter}
                disabled={isDeletingChapter}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {isDeletingChapter ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer définitivement
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
};

export default PhaseManager;
