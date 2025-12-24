import React from 'react';
import { useDrop } from 'react-dnd';
import { Folder, ChevronDown, ChevronRight, Edit, Trash2, FolderOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ItemTypes } from '@/types/PhaseManager';
import type { DroppablePhaseProps } from '@/types/PhaseManager';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DroppablePhase: React.FC<DroppablePhaseProps> = ({
  phase,
  isSelected,
  onToggleExpansion,
  onToggleEdit,
  onDelete,
  onUpdate,
  children
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.VIDEO,
    drop: () => {
      // Phase-level drop - handle in parent
    },
    canDrop: () => {
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [phase.id]);

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
        ${phase.isNew 
          ? 'bg-gradient-to-br from-orange-50/50 via-white to-yellow-50/30 border-2 border-orange-200/40 shadow-md' 
          : 'bg-white border-2 border-gray-200/50 shadow-md'
        }
        ${isOver && canDrop 
          ? 'shadow-xl border-primary/40 bg-gradient-to-br from-primary/5 to-white' 
          : ''
        }
        rounded-2xl transition-all duration-300 overflow-hidden
        hover:shadow-lg backdrop-blur-sm
      `}>
        {/* Phase Header */}
        <CardHeader className={`
          py-5 px-6
          ${phase.isNew 
            ? 'bg-gradient-to-r from-orange-100/50 to-yellow-100/30 border-b-2 border-orange-200/40' 
            : 'border-b-2 border-gray-200/60 bg-gradient-to-r from-gray-100/30 to-white'
          }
        `}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                {/* Expand/Collapse Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    p-2.5 h-auto rounded-xl transition-all duration-300 shadow-md
                    ${phase.isExpanded 
                      ? 'bg-primary/10 hover:bg-primary/15 text-primary scale-110 shadow-lg' 
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700 hover:scale-105'
                    }
                  `}
                  onClick={onToggleExpansion}
                >
                  {phase.isExpanded ? (
                    <ChevronDown className="h-5 w-5 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="h-5 w-5 transition-transform duration-300" />
                  )}
                </Button>

                {/* Phase Icon */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ring-2
                  ${phase.isNew 
                    ? 'bg-gradient-to-br from-secondary via-muted to-primary shadow-muted/30 ring-muted/40' 
                    : 'bg-gradient-to-br from-primary via-primary/90 to-muted shadow-primary/30 ring-primary/40'
                  }
                  hover:scale-105 hover:shadow-xl
                `}>
                  {phase.isExpanded ? (
                    <FolderOpen className="h-7 w-7 text-white drop-shadow-md" />
                  ) : (
                    <Folder className="h-7 w-7 text-white drop-shadow-md" />
                  )}
                </div>
              </div>
              
              {/* Action Buttons - Mobile */}
              <div className="flex sm:hidden items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (phase.isEditing) {
                      // Marquer les changements et désactiver le mode édition
                      onUpdate('title', phase.title);
                      onUpdate('description', phase.description);
                      onToggleEdit();
                    } else {
                      // Activer le mode édition
                      onToggleEdit();
                    }
                  }}
                  className={
                    phase.isEditing
                      ? "bg-gray-100/80 hover:bg-gray-200 text-gray-700 hover:text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 font-semibold px-2.5 py-1.5 text-xs rounded-lg"
                      : "bg-muted/20 hover:bg-muted/30 text-muted hover:text-muted shadow-sm hover:shadow-md transition-all duration-300 font-semibold px-2.5 py-1.5 text-xs rounded-lg"
                  }
                >
                  {phase.isEditing ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Edit className="h-3.5 w-3.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
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

            {/* Phase Title and Description */}
            <div className="flex-1 w-full sm:w-auto min-w-0">
              {phase.isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      Titre de la Phase
                    </label>
                    <Input
                      value={phase.title}
                      onChange={(e) => onUpdate('title', e.target.value)}
                      placeholder="Entrez le titre de la phase..."
                      className="border-gray-300/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      Description
                    </label>
                    <Textarea
                      value={phase.description}
                      onChange={(e) => onUpdate('description', e.target.value)}
                      placeholder="Décrivez cette phase..."
                      rows={2}
                      className="border-gray-300/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <CardTitle className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2 sm:line-clamp-1">
                      Phase {phase.phaseNumber}: {phase.title}
                    </CardTitle>
                    {phase.isNew && (
                      <span className="
                        inline-flex items-center gap-1.5 text-xs 
                        bg-gradient-to-r from-primary to-muted 
                        text-white px-3 py-1.5 rounded-full 
                        font-bold shadow-sm animate-pulse self-start sm:self-center
                        ring-2 ring-primary/20
                      ">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <span className="hidden sm:inline">NOUVELLE PHASE</span>
                        <span className="sm:hidden">NOUVEAU</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-muted/10 to-secondary/10 text-muted px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm border border-muted/30">
                      <Folder className="h-4 w-4" />
                      <span>{phase.chapters.filter(ch => !ch.isDeleted).length} chapitre{phase.chapters.filter(ch => !ch.isDeleted).length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {phase.description && (
                    <CardDescription className="text-sm text-gray-600 leading-relaxed bg-gradient-to-r from-gray-50/50 to-white p-3 rounded-lg line-clamp-3 sm:line-clamp-none border border-gray-100/50">
                      <strong className="text-gray-700">Description:</strong> {phase.description}
                    </CardDescription>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (phase.isEditing) {
                    // Marquer les changements et désactiver le mode édition
                    onUpdate('title', phase.title);
                    onUpdate('description', phase.description);
                    onToggleEdit();
                  } else {
                    // Activer le mode édition
                    onToggleEdit();
                  }
                }}
                className={
                  phase.isEditing
                    ? "bg-gray-100/80 hover:bg-gray-200 text-gray-700 hover:text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                    : "bg-muted/20 hover:bg-muted/30 text-muted hover:text-muted shadow-sm hover:shadow-md transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                }
              >
                {phase.isEditing ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5" />
                    <span>Enregistrer</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1.5" />
                    <span>Modifier</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
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

        {/* Phase Content (Chapters) */}
        {phase.isExpanded && (
          <CardContent className="pt-4 px-6 pb-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
            <div className="space-y-4">
              {children}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DroppablePhase;
