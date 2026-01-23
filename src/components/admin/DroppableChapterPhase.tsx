import React from 'react';
import { useDrop } from 'react-dnd';
import { FolderOpen, ChevronDown, ChevronRight, Trash2, Video, Edit2, Check, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemTypes } from '@/types/PhaseManager';
import type { UnifiedChapter } from '@/types/PhaseManager';

interface DroppableChapterPhaseProps {
  chapter: UnifiedChapter;
  phaseId: string;
  onToggleExpansion: () => void;
  onToggleEdit: () => void;
  onUpdate: (value: string) => void;
  onDelete: () => void;
  onDrop: (item: any) => void;
  children: React.ReactNode;
}

const DroppableChapterPhase: React.FC<DroppableChapterPhaseProps> = ({
  chapter,
  phaseId,
  onToggleExpansion,
  onToggleEdit,
  onUpdate,
  onDelete,
  onDrop,
  children
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.VIDEO,
    drop: (item: any) => {
      onDrop(item);
      return { chapterId: chapter.id, phaseId };
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [chapter.id, phaseId, onDrop]);

  const videoCount = chapter.videos.filter(v => !v.isDeleted).length;

  const handleEditClick = () => {
    if (chapter.isEditing) {
      onUpdate(chapter.miniChapter);
      onToggleEdit();
    } else {
      onToggleEdit();
    }
  };

  return (
    <div
      ref={drop as any}
      className={`
        transition-all duration-300 ease-in-out rounded-xl
        ${isOver && canDrop 
          ? 'ring-2 ring-primary/40 ring-offset-2 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg' 
          : ''
        }
        ${!isOver ? 'hover:shadow-md' : ''}
      `}
    >
      <Card className={`
        ${chapter.isNew 
          ? 'bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 border-2 border-blue-200/40 shadow-sm' 
          : 'bg-white border-2 border-gray-200/40 shadow-sm'
        }
        ${isOver && canDrop 
          ? 'shadow-lg border-primary/50 bg-gradient-to-br from-primary/10 to-white' 
          : ''
        }
        rounded-xl transition-all duration-300 overflow-hidden
        hover:shadow-md backdrop-blur-sm
      `}>
        {/* Chapter Header */}
        <CardHeader className={`
          py-4 px-5
          ${chapter.isNew 
            ? 'bg-gradient-to-r from-blue-100/50 to-indigo-100/30 border-b-2 border-blue-200/40' 
            : 'border-b-2 border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white'
          }
        `}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Expand/Collapse Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={`
                  p-2 h-auto rounded-lg transition-all duration-300 shadow-sm
                  ${chapter.isExpanded 
                    ? 'bg-primary/10 hover:bg-primary/15 text-primary shadow-md' 
                    : 'bg-gray-100/70 hover:bg-gray-200/70 text-gray-500 hover:text-gray-700'
                  }
                `}
                onClick={onToggleExpansion}
              >
                {chapter.isExpanded ? (
                  <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                ) : (
                  <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                )}
              </Button>

              {/* Chapter Icon */}
              <div className={`
                w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md ring-2
                ${
                  chapter.isNew 
                    ? 'bg-gradient-to-br from-muted via-secondary to-muted shadow-muted/30 ring-muted/40' 
                    : 'bg-gradient-to-br from-primary via-primary/90 to-muted shadow-primary/30 ring-primary/40'
                }
                hover:shadow-lg
              `}>
                <FolderOpen className="h-5 w-5 text-white drop-shadow-md" />
              </div>

              {/* Chapter Title */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {chapter.isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                          Chapitre {chapter.chapterNumber}:
                        </span>
                        <Input
                          value={chapter.miniChapter}
                          onChange={(e) => onUpdate(e.target.value)}
                          className="flex-1 text-base font-bold border-2 border-primary/40 focus:border-primary shadow-sm"
                          placeholder="Nom du chapitre"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <CardTitle className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                        Chapitre {chapter.chapterNumber}: {chapter.miniChapter}
                      </CardTitle>
                    )}
                    {chapter.isNew && (
                      <span className="
                        inline-flex items-center gap-1 text-xs 
                        bg-gradient-to-r from-primary to-muted 
                        text-white px-2.5 py-1 rounded-full 
                        font-bold shadow-sm animate-pulse self-start sm:self-center
                        ring-2 ring-primary/30
                      ">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping absolute"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <span className="hidden sm:inline">NOUVEAU</span>
                        <span className="sm:hidden">NOUVEAU</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-muted/10 to-secondary/10 text-muted px-2.5 py-1 rounded-lg font-semibold text-xs shadow-sm border border-muted/30 w-fit">
                    <Video className="h-3.5 w-3.5" />
                    <span>{videoCount} vidéo{videoCount > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Action Menu - Mobile */}
              <div className="flex sm:hidden items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-primary/10 hover:to-primary/20 hover:shadow-sm hover:scale-105 transition-all duration-300 border border-gray-300/50"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-lg shadow-lg border border-gray-200 bg-white">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick();
                      }}
                      className="rounded-md hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-900"
                    >
                      {chapter.isEditing ? (
                        <>
                          <Check className="mr-2 h-4 w-4 text-gray-900" />
                          Enregistrer
                        </>
                      ) : (
                        <>
                          <Edit2 className="mr-2 h-4 w-4 text-gray-900" />
                          Modifier
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="rounded-md hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Action Menu - Desktop */}
            <div className="hidden sm:flex items-center ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-primary/10 hover:to-primary/20 hover:shadow-sm hover:scale-105 transition-all duration-300 border border-gray-300/50"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border border-gray-200 bg-white">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}
                    className="rounded-md hover:bg-gray-100 cursor-pointer transition-colors text-sm font-medium text-gray-900"
                  >
                    {chapter.isEditing ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-gray-900" />
                        Enregistrer
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4 text-gray-900" />
                        Modifier les informations
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="rounded-md hover:bg-gray-100 cursor-pointer transition-colors text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Chapter Content (Videos) */}
        {chapter.isExpanded && (
          <CardContent className="pt-4 px-5 pb-4 space-y-3 bg-gradient-to-b from-gray-50/20 to-white">
            <div className="flex flex-col gap-3 w-full">
              {videoCount > 0 ? (
                children
              ) : (
                <div className="py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Aucune vidéo dans ce chapitre
                    </p>
                    <p className="text-xs text-gray-400">
                      Glissez-déposez des vidéos ici
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DroppableChapterPhase;
