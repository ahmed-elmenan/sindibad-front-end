import React from 'react';
import { useDrop } from 'react-dnd';
import { Folder, ChevronDown, ChevronRight, Edit, Check, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ItemTypes } from '@/types/ChapterManager';
import type { DroppableChapterProps } from '@/types/ChapterManager';

const DroppableChapter: React.FC<DroppableChapterProps> = ({
  chapter,
  onDropVideo,
  onSelect,
  isSelected,
  onToggleExpansion,
  onToggleEdit,
  onSave,
  onDelete,
  onUpdate,
  children
}) => {
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
          ? 'ring-4 ring-primary/50 ring-offset-4 bg-gradient-to-r from-secondary/10 to-primary/10 scale-[1.02] shadow-2xl' 
          : ''
        }
        ${isSelected 
          ? 'ring-4 ring-muted/50 ring-offset-4 bg-gradient-to-r from-muted/10 to-secondary/10' 
          : ''
        }
        ${!isSelected && !isOver ? 'hover:shadow-lg hover:scale-[1.01]' : ''}
      `}
    >
      <Card className={`
        ${chapter.isNew 
          ? 'bg-gradient-to-br from-secondary/10 via-primary/10 to-muted/10 border-2 border-primary shadow-primary/20' 
          : 'bg-white border-gray-200 shadow-sm'
        }
        ${isOver && canDrop 
          ? 'shadow-2xl border-primary bg-gradient-to-br from-secondary/10 to-white' 
          : ''
        }
        rounded-2xl transition-all duration-300 overflow-hidden
        hover:shadow-md backdrop-blur-sm pt-0
      `}>
        {/* Chapter Header - Always visible */}
        <CardHeader className={`
          py-3 sm:py-4 px-3 sm:px-6
          ${chapter.isNew 
            ? 'bg-gradient-to-r from-primary/10 to-muted/10 border-b border-primary/30' 
            : 'border-b border-gray-100'
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
                      w-4 h-4 sm:w-5 sm:h-5 rounded-lg border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-muted bg-muted shadow-lg shadow-muted/30' 
                        : 'border-gray-300 hover:border-muted hover:shadow-md'
                      }
                    `}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-muted rounded-full animate-ping opacity-75"></div>
                  )}
                </div>

                {/* Expand/Collapse Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    p-1.5 sm:p-2 h-auto rounded-xl transition-all duration-200
                    ${chapter.isExpanded 
                      ? 'bg-primary/10 hover:bg-primary/20 text-primary' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }
                  `}
                  onClick={onToggleExpansion}
                >
                  {chapter.isExpanded ? (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200" />
                  )}
                </Button>

                {/* Chapter Icon */}
                <div className={`
                  w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200
                  ${chapter.isNew 
                    ? 'bg-gradient-to-br from-primary to-muted shadow-lg shadow-primary/30' 
                    : 'bg-gradient-to-br from-primary to-muted shadow-lg shadow-primary/30'
                  }
                `}>
                  <Folder className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>

              {/* Action Buttons - Mobile positioned */}
              <div className="flex sm:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (chapter.isEditing) {
                      onSave();
                    } else {
                      onToggleEdit();
                    }
                  }}
                  className={`
                    ${chapter.isEditing 
                      ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 shadow-sm' 
                      : 'hover:bg-primary/10 text-primary hover:text-primary/80'
                    }
                    transition-all duration-200 font-medium px-2 py-1 text-xs
                  `}
                >
                  {chapter.isEditing ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Edit className="h-3 w-3 text-blue-500" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="
                    text-red-600 hover:text-red-700 hover:bg-red-100 
                    border border-transparent hover:border-red-300
                    transition-all duration-200 font-medium px-2 py-1 text-xs
                  "
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chapter Title and Description */}
            <div className="flex-1 w-full sm:w-auto min-w-0">
              {chapter.isEditing ? (
                <div className="space-y-3 sm:space-y-4 bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Chapter Title
                    </label>
                    <Input
                      defaultValue={chapter.title}
                      placeholder="Enter chapter title..."
                      className="
                        font-medium text-base sm:text-lg border-gray-300 
                        focus:border-primary focus:ring-2 focus:ring-primary/20 
                        transition-all duration-200 placeholder:text-gray-400
                        bg-white shadow-sm hover:border-gray-400 w-full
                      "
                      onChange={(e) => onUpdate('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Description
                    </label>
                    <Textarea
                      defaultValue={chapter.description}
                      placeholder="Describe this chapter content..."
                      rows={2}
                      className="
                        text-sm border-gray-300 
                        focus:border-primary focus:ring-2 focus:ring-primary/20 
                        transition-all duration-200 placeholder:text-gray-400
                        bg-white shadow-sm hover:border-gray-400 resize-none w-full
                      "
                      onChange={(e) => onUpdate('description', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent line-clamp-2 sm:line-clamp-1">
                      Chapter {chapter.chapterNumber}: {chapter.title}
                    </CardTitle>
                    {chapter.isNew && (
                      <span className="
                        inline-flex items-center gap-1 text-xs 
                        bg-gradient-to-r from-primary to-muted 
                        text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full 
                        font-semibold shadow-sm animate-pulse self-start sm:self-center
                      ">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <span className="hidden sm:inline">NEW CHAPTER</span>
                        <span className="sm:hidden">NEW</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                    <div className="inline-flex items-center gap-1 sm:gap-2 bg-primary/10 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-xs sm:text-sm">
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{chapter.videos.filter(v => !v.isDeleted).length} videos</span>
                      <span className="sm:hidden">{chapter.videos.filter(v => !v.isDeleted).length}</span>
                    </div>
                  </div>
                  {chapter.description && (
                    <CardDescription className="text-sm text-gray-600 bg-white p-2 sm:p-3 rounded-lg line-clamp-3 sm:line-clamp-none">
                      <strong>
                        Description : {" "}
                      </strong>
                      {chapter.description}
                    </CardDescription>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons - Desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (chapter.isEditing) {
                    onSave();
                  } else {
                    onToggleEdit();
                  }
                }}
                className={`
                  ${chapter.isEditing 
                    ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 shadow-sm' 
                    : 'hover:bg-primary/10 text-primary hover:text-primary/80'
                  }
                  transition-all duration-200 font-medium px-3 py-2 !border-0
                `}
              >
                {chapter.isEditing ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </>
                ) : (
                  <span className="text-blue-500 flex items-center">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="
                  text-red-600 hover:text-red-700 hover:bg-red-100 
                  border border-transparent hover:border-red-300
                  transition-all duration-200 font-medium px-3 py-2
                "
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chapter Videos - Only show when expanded */}
        {chapter.isExpanded && (
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 space-y-3 sm:space-y-4">
            {isOver && canDrop && (
              <div className="
                mb-4 sm:mb-6 p-4 sm:p-6 border-2 border-dashed border-primary 
                bg-gradient-to-r from-secondary/10 via-primary/10 to-muted/10 
                rounded-2xl text-center transition-all duration-300
                shadow-lg shadow-primary/20 animate-pulse
              ">
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-muted rounded-2xl flex items-center justify-center shadow-lg">
                    <Video className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-primary text-base sm:text-lg">Drop Video Here</p>
                    <p className="text-xs sm:text-sm text-muted">Move video to this chapter</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2 sm:space-y-3">
              {children}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DroppableChapter;