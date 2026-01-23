import type { ReactNode } from 'react';
import type { Skill } from './Skill';

export interface VideoFile extends File {
  path: string;
  title?: string;
  description?: string;
  size: number;
}

export interface UnifiedVideo {
  id?: string;
  name: string;
  title: string;
  description: string;
  fileName?: string;
  duration?: number;
  videoUrl?: string;
  referenceUrl?: string;
  order: number;
  file?: File;
  fileSize?: number; // Taille du fichier en bytes
  thumbnailUrl?: string; // URL de la miniature dans S3
  isNew?: boolean;
  isDeleted?: boolean;
  isEditing?: boolean;
  originalLessonId?: string; // For existing lessons
  isMoved?: boolean;
  originalChapterId?: string;
  originalPhaseId?: string;
  sourceChapterType?: 'existing' | 'new';
  sourcePhaseType?: 'existing' | 'new';
  skills?: Skill[]; // Skills associés à la vidéo/lesson
  phaseNumber?: number; // For display in video card
  chapterNumber?: number; // For display in video card
  videoNumber?: number; // For display in video card
}

export interface UnifiedChapter {
  id?: string;
  chapterNumber: number;
  miniChapter: string; // Le nom du chapitre (miniChapter dans Lesson)
  videos: UnifiedVideo[];
  isNew?: boolean;
  isDeleted?: boolean;
  isEditing?: boolean;
  hasModifications?: boolean; // Track if chapter has unsaved changes
  isExpanded?: boolean;
  isSelected?: boolean;
  originalChapterId?: string;
}

export interface UnifiedPhase {
  id?: string;
  phaseNumber: number;
  title: string;
  description: string;
  order: number;
  chapters: UnifiedChapter[];
  isNew?: boolean;
  isDeleted?: boolean;
  isEditing?: boolean;
  hasModifications?: boolean; // Track if phase has unsaved changes
  isExpanded?: boolean;
  isSelected?: boolean;
  originalPhaseId?: string; // Pour les phases existantes (Chapter entity)
  videoPath?: string;
}

export interface VideoMoveOperation {
  videoId?: string;
  videoData?: UnifiedVideo;
  fromChapterId?: string;
  fromPhaseId?: string;
  toChapterId: string;
  toPhaseId: string;
  newOrder: number;
  isNewVideo: boolean;
  moveType: 'existing-to-existing' | 'existing-to-new' | 'new-to-existing' | 'new-to-new';
  originalLessonId?: string;
}

export interface UnifiedPhaseManagerProps {
  onUpload?: (files: File[], metadata: { 
    phases: { 
      number: number, 
      title: string, 
      description: string, 
      chapters: { 
        number: number, 
        miniChapter: string, 
        videos: { 
          name: string, 
          title: string, 
          description: string,
          skills: Skill[]
        }[] 
      }[] 
    }[] 
  }) => void;
  onUpdatePhase?: (phaseId: string, data: { title: string, description: string }) => void;
  onDeletePhase?: (phaseId: string) => void;
  onUpdateChapter?: (chapterId: string, data: { miniChapter: string }) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onUpdateVideo?: (videoId: string, data: { 
    title: string, 
    description: string, 
    duration?: number, 
    order?: number,
    referenceUrl?: string,
    skills?: Skill[]
  }) => void;
  onDeleteVideo?: (videoId: string) => void;
  onAddPhase?: (data: { title: string, description: string, phaseNumber: number }) => void;
  onAddChapter?: (phaseId: string, data: { miniChapter: string, chapterNumber: number }) => void;
  onAddVideo?: (chapterId: string, data: { 
    title: string, 
    description: string, 
    duration: number, 
    order: number,
    referenceUrl?: string,
    skills: Skill[]
  }) => void;
  onMergePhases?: (sourcePhaseId: string, targetPhaseId: string) => void;
  onMoveVideo?: (videoId: string, fromChapterId: string, toChapterId: string, newOrder: number) => void;
  onBatchUpdateVideos?: (operations: VideoMoveOperation[]) => void;
  onMoveNewVideoToExisting?: (videoData: UnifiedVideo, targetChapterId: string, newOrder: number) => void;
}

export interface DraggableVideoProps {
  video: UnifiedVideo;
  chapterId: string;
  phaseId: string;
  chapterIndex: number;
  videoIndex: number;
  isChapterNew: boolean;
  isPhaseNew: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: string | number) => void;
  isNew?: boolean;
}

export interface DroppableChapterProps {
  chapter: UnifiedChapter;
  phaseId: string;
  onDropVideo: (videoData: any, targetChapterId: string, dropPosition?: 'top' | 'bottom' | 'middle') => void;
  onSelect: (chapterId: string) => void;
  isSelected: boolean;
  onToggleExpansion: () => void;
  onToggleEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: 'miniChapter', value: string) => void;
  onAddVideo: () => void;
  children: ReactNode;
}

export interface DroppablePhaseProps {
  phase: UnifiedPhase;
  onDropVideo: (videoData: any, targetPhaseId: string, targetChapterId: string, dropPosition?: 'top' | 'bottom' | 'middle') => void;
  onSelect: (phaseId: string) => void;
  isSelected: boolean;
  onToggleExpansion: () => void;
  onToggleEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: 'title' | 'description', value: string) => void;
  onAddChapter: () => void;
  onManageQuiz?: () => void;
  children: ReactNode;
}

export const ItemTypes = {
  VIDEO: 'video',
  CHAPTER: 'chapter',
  PHASE: 'phase',
} as const;
