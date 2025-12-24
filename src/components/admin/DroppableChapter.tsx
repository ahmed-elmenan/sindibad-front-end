import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Folder, ChevronDown, ChevronRight, Edit, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ItemTypes } from '@/types/ChapterManager';
import type { DroppableChapterProps } from '@/types/ChapterManager';
import { ChapterEditModal } from './ChapterEditModal';
import { ChapterDeleteModal } from './ChapterDeleteModal';

const DroppableChapter: React.FC<DroppableChapterProps> = ({
  chapter,
  onDropVideo,
  onSelect,
  isSelected,
  onToggleExpansion,
  onSave,
  onDelete,
  onUpdate,
  children
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleSaveEdit = (data: { title: string; description: string }) => {
    onUpdate('title', data.title);
    onUpdate('description', data.description);
    onSave();
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.VIDEO,
    drop: (item: any) => {
      onDropVideo(item, chapter.id!, 'middle');
    },
    canDrop: (item: any) => {
      // Prevent dropping video onto itself or same chapter for better UX
      if (item.chapterId === chapter.id && !item.isNewVideo) {
        return false;
      }
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [chapter.id, onDropVideo]);

  return (
    <div
      ref={drop as any}
      className={`
        transition-all duration-300 ease-in-out rounded-2xl
        ${isOver && canDrop 
          ? 'ring-2 ring-primary/30 ring-offset-2 bg-gradient-to-r from-primary/5 to-secondary/5 scale-[1.01] shadow-xl' 
          : ''
        }
        ${isSelected 
          ? 'ring-2 ring-primary/40 ring-offset-2 bg-gradient-to-r from-primary/5 to-white' 
          : ''
        }
        ${!isSelected && !isOver ? 'hover:shadow-lg hover:scale-[1.005]' : ''}
      `}
    >
      <Card className={`
        ${chapter.isNew 
          ? 'bg-gradient-to-br from-orange-50/50 via-white to-yellow-50/30 border border-orange-200/30 shadow-sm' 
          : 'bg-white border border-gray-200/50 shadow-sm'
        }
        ${isOver && canDrop 
          ? 'shadow-xl border-primary/40 bg-gradient-to-br from-primary/5 to-white' 
          : ''
        }
        rounded-2xl transition-all duration-300 overflow-hidden
        hover:shadow-md backdrop-blur-sm
      `}>
        {/* Chapter Header - Always visible */}
        <CardHeader className={`
          py-4 sm:py-5 px-4 sm:px-6
          ${chapter.isNew 
            ? 'bg-gradient-to-r from-orange-50/50 to-yellow-50/30 border-b border-orange-200/30' 
            : 'border-b border-gray-100/80 bg-gradient-to-r from-gray-50/30 to-white'
          }
        `}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Top Row: Controls */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Selection Checkbox */}
                <div className="relative">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(chapter.id!)}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      w-5 h-5 rounded-lg border-2 transition-all duration-300
                      ${isSelected 
                        ? 'border-primary bg-primary shadow-md shadow-primary/20 scale-110' 
                        : 'border-gray-300/60 hover:border-primary/50 hover:shadow-sm hover:scale-105'
                      }
                    `}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping opacity-60"></div>
                  )}
                </div>

                {/* Expand/Collapse Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    p-2 h-auto rounded-xl transition-all duration-300 shadow-sm
                    ${chapter.isExpanded 
                      ? 'bg-primary/10 hover:bg-primary/15 text-primary scale-105 shadow-md' 
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700 hover:scale-105'
                    }
                  `}
                  onClick={onToggleExpansion}
                >
                  {chapter.isExpanded ? (
                    <ChevronDown className="h-5 w-5 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="h-5 w-5 transition-transform duration-300" />
                  )}
                </Button>

                {/* Chapter Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ring-2
                  ${chapter.isNew 
                    ? 'bg-gradient-to-br from-primary via-primary/90 to-muted shadow-primary/20 ring-primary/20' 
                    : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-gray-400/20 ring-gray-200/50'
                  }
                  hover:scale-105 hover:shadow-lg
                `}>
                  <Folder className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
              </div>
              {/* Action Buttons - Mobile positioned */}
              <div className="flex sm:hidden items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="
                    bg-blue-100/80 hover:bg-blue-200 text-blue-600 shadow-sm hover:shadow-md
                    transition-all duration-300 font-semibold px-2.5 py-1.5 text-xs rounded-lg
                  "
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="
                    bg-red-100/80 hover:bg-red-200 text-red-600 hover:text-red-700
                    shadow-sm hover:shadow-md
                    transition-all duration-300 font-semibold px-2.5 py-1.5 text-xs rounded-lg
                  "
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Chapter Title and Description */}
            <div className="flex-1 w-full sm:w-auto min-w-0">
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 sm:line-clamp-1">
                    Chapitre {chapter.chapterNumber}: {chapter.title}
                  </CardTitle>
                  {chapter.isNew && (
                    <span className="
                      inline-flex items-center gap-1.5 text-xs 
                      bg-gradient-to-r from-primary to-muted 
                      text-white px-3 py-1.5 rounded-full 
                      font-bold shadow-sm animate-pulse self-start sm:self-center
                      ring-2 ring-primary/20
                    ">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <span className="hidden sm:inline">NOUVEAU</span>
                      <span className="sm:hidden">NOUVEAU</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-muted/10 text-primary px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm border border-primary/20">
                    <Video className="h-4 w-4" />
                    <span>{chapter.videos.filter(v => !v.isDeleted).length} vidéo{chapter.videos.filter(v => !v.isDeleted).length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                {chapter.description && (
                  <CardDescription className="text-sm text-gray-600 leading-relaxed bg-gradient-to-r from-gray-50/50 to-white p-3 rounded-lg line-clamp-3 sm:line-clamp-none border border-gray-100/50">
                    <strong className="text-gray-700">Description:</strong> {chapter.description}
                  </CardDescription>
                )}
              </div>
            </div>

            {/* Action Buttons - Desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="
                  bg-blue-100/80 hover:bg-blue-200 text-blue-600 shadow-sm hover:shadow-md
                  transition-all duration-300 font-semibold px-4 py-2 rounded-xl hover:text-blue-700
                "
              >
                <Edit className="h-4 w-4 mr-1.5" />
                <span>Modifier</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="
                  bg-red-100/80 hover:bg-red-200 text-red-600 hover:text-red-700
                  shadow-sm hover:shadow-md
                  transition-all duration-300 font-semibold px-4 py-2 rounded-xl
                "
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chapter Videos - Only show when expanded */}
        {chapter.isExpanded && (
          <CardContent className="pt-4 px-4 sm:px-6 pb-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
            {isOver && canDrop && (
              <div className="
                mb-6 p-6 border-2 border-dashed border-primary/40 
                bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 
                rounded-2xl text-center transition-all duration-300
                shadow-lg shadow-primary/10 animate-pulse
              ">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-muted rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                    <Video className="h-8 w-8 text-white drop-shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-primary text-lg">Déposez la vidéo ici</p>
                    <p className="text-sm text-gray-600">Déplacez la vidéo vers ce chapitre</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {children}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modals */}
      <ChapterEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        chapter={chapter}
      />

      <ChapterDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        chapterTitle={chapter.title}
        videoCount={chapter.videos.filter(v => !v.isDeleted).length}
      />
    </div>
  );
};

export default DroppableChapter;