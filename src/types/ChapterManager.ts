import type { ReactNode } from 'react';

export interface VideoFile extends File {
  path: string;
  title?: string;
  description?: string;
}

export interface UnifiedVideo {
  id?: string;
  name: string;
  title: string;
  description: string;
  fileName?: string;
  duration?: number;
  videoUrl?: string;
  order: number;
  file?: File;
  isNew?: boolean;
  isDeleted?: boolean;
  isEditing?: boolean;
  originalLessonId?: string; // For existing lessons
  isMoved?: boolean; // Track if video was moved between chapters
  originalChapterId?: string; // Track original chapter for moved videos
  sourceChapterType?: 'existing' | 'new'; // Track if moved from existing or new chapter
}

export interface UnifiedChapter {
  id?: string;
  chapterNumber: number;
  title: string;
  description: string;
  videos: UnifiedVideo[];
  isNew?: boolean;
  isDeleted?: boolean;
  isEditing?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  originalChapterId?: string; // For existing chapters
}

export interface VideoMoveOperation {
  videoId?: string; // For existing videos
  videoData?: UnifiedVideo; // For new videos being moved to existing chapters
  fromChapterId?: string; // Original chapter ID (for existing chapters)
  toChapterId: string; // Target chapter ID
  newOrder: number;
  isNewVideo: boolean;
  moveType: 'existing-to-existing' | 'existing-to-new' | 'new-to-existing' | 'new-to-new';
  originalLessonId?: string;
}

export interface UnifiedChapterManagerProps {
  onUpload?: (files: File[], metadata: { chapters: { number: number, title: string, description: string, videos: { name: string, title: string, description: string }[] }[] }) => void;
  onUpdateChapter?: (chapterId: string, data: { title: string, description: string }) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onUpdateVideo?: (videoId: string, data: { title: string, description: string, duration?: number, order?: number }) => void;
  onDeleteVideo?: (videoId: string) => void;
  onAddChapter?: (data: { title: string, description: string, chapterNumber: number }) => void;
  onAddVideo?: (chapterId: string, data: { title: string, description: string, duration: number, order: number }) => void;
  onMergeChapters?: (sourceChapterId: string, targetChapterId: string) => void;
  onMoveVideo?: (videoId: string, fromChapterId: string, toChapterId: string, newOrder: number) => void;
  onBatchUpdateVideos?: (operations: VideoMoveOperation[]) => void;
  onMoveNewVideoToExisting?: (videoData: UnifiedVideo, targetChapterId: string, newOrder: number) => void;
}

export interface DraggableVideoProps {
  video: UnifiedVideo;
  chapterId: string;
  chapterIndex: number;
  videoIndex: number;
  isChapterNew: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: string | number) => void;
  isNew?: boolean;
}

export interface DroppableChapterProps {
  chapter: UnifiedChapter;
  onDropVideo: (videoData: any, targetChapterId: string, dropPosition?: 'top' | 'bottom' | 'middle') => void;
  onSelect: (chapterId: string) => void;
  isSelected: boolean;
  onToggleExpansion: () => void;
  onToggleEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: 'title' | 'description', value: string) => void;
  onAddVideo: () => void;
  children: ReactNode;
}

export const ItemTypes = {
  VIDEO: 'video',
  CHAPTER: 'chapter',
} as const;