import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react';
import type { UnifiedVideo, UnifiedPhase } from '@/types/PhaseManager';
import type { Skill } from '@/types/Skill';

interface LessonEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UnifiedVideo> & { newPhaseTitle?: string; newChapterName?: string }) => void;
  lesson: UnifiedVideo;
  currentPhaseId: string;
  currentChapterId: string;
  phases: UnifiedPhase[];
  existingSkills: Skill[];
}

const LessonEditModal: React.FC<LessonEditModalProps> = ({
  open,
  onClose,
  onSave,
  lesson,
  currentPhaseId,
  currentChapterId,
  phases,
  existingSkills,
}) => {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || '');
  const [order, setOrder] = useState(lesson.order.toString());
  const [referenceUrl, setReferenceUrl] = useState(lesson.referenceUrl || '');
  const [selectedPhaseId, setSelectedPhaseId] = useState(currentPhaseId);
  const [selectedChapterId, setSelectedChapterId] = useState(currentChapterId);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(lesson.skills || []);
  
  // New phase/chapter creation
  const [showNewPhaseInput, setShowNewPhaseInput] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [showNewChapterInput, setShowNewChapterInput] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  
  // New skill creation
  const [showNewSkillInput, setShowNewSkillInput] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  useEffect(() => {
    if (open) {
      setTitle(lesson.title);
      setDescription(lesson.description || '');
      setOrder(lesson.order.toString());
      setReferenceUrl(lesson.referenceUrl || '');
      setSelectedPhaseId(currentPhaseId);
      setSelectedChapterId(currentChapterId);
      setSelectedSkills(lesson.skills || []);
      setShowNewPhaseInput(false);
      setNewPhaseTitle('');
      setShowNewChapterInput(false);
      setNewChapterName('');
      setShowNewSkillInput(false);
      setNewSkillName('');
      setNewSkillLevel('BEGINNER');
    }
  }, [open, lesson, currentPhaseId, currentChapterId]);

  const getChaptersForPhase = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    return phase?.chapters.filter(ch => !ch.isDeleted) || [];
  };

  const handlePhaseChange = (value: string) => {
    if (value === 'new') {
      setShowNewPhaseInput(true);
      setSelectedPhaseId('');
      setSelectedChapterId('');
    } else {
      setShowNewPhaseInput(false);
      setNewPhaseTitle('');
      setSelectedPhaseId(value);
      // Reset chapter selection when phase changes
      const chapters = getChaptersForPhase(value);
      setSelectedChapterId(chapters[0]?.id || '');
    }
  };

  const handleChapterChange = (value: string) => {
    if (value === 'new') {
      setShowNewChapterInput(true);
      setSelectedChapterId('');
    } else {
      setShowNewChapterInput(false);
      setNewChapterName('');
      setSelectedChapterId(value);
    }
  };

  const handleAddSkill = (skillId: string) => {
    const skill = existingSkills.find(s => s.id === skillId);
    if (skill && !selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddNewSkill = () => {
    if (newSkillName.trim()) {
      const newSkill: Skill = {
        id: `temp-${Date.now()}`,
        name: newSkillName.trim(),
        level: newSkillLevel,
      };
      setSelectedSkills([...selectedSkills, newSkill]);
      setNewSkillName('');
      setNewSkillLevel('BEGINNER');
      setShowNewSkillInput(false);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  const handleSave = () => {
    const updates: Partial<UnifiedVideo> & { newPhaseTitle?: string; newChapterName?: string } = {
      title: title.trim(),
      description: description.trim(),
      order: parseInt(order) || lesson.order,
      referenceUrl: referenceUrl.trim() || undefined,
      skills: selectedSkills,
    };

    if (showNewPhaseInput && newPhaseTitle.trim()) {
      updates.newPhaseTitle = newPhaseTitle.trim();
    }

    if (showNewChapterInput && newChapterName.trim()) {
      updates.newChapterName = newChapterName.trim();
    }

    onSave(updates);
    onClose();
  };

  const isValid = 
    title.trim().length > 0 && 
    parseInt(order) > 0 && 
    selectedSkills.length > 0 &&
    (showNewPhaseInput ? newPhaseTitle.trim().length > 0 : selectedPhaseId.length > 0) &&
    (showNewChapterInput ? newChapterName.trim().length > 0 : selectedChapterId.length > 0);

  const availableSkills = existingSkills.filter(
    skill => !selectedSkills.find(s => s.id === skill.id)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifier la Leçon</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la leçon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title" className="text-sm font-bold text-gray-700">
              Titre de la Leçon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de la leçon..."
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="lesson-description" className="text-sm font-bold text-gray-700">
              Description
            </Label>
            <Textarea
              id="lesson-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez cette leçon..."
              rows={3}
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="lesson-order" className="text-sm font-bold text-gray-700">
              Ordre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lesson-order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="Ordre de la leçon"
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Reference URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="lesson-reference" className="text-sm font-bold text-gray-700">
              URL de Référence <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </Label>
            <Input
              id="lesson-reference"
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://example.com/resource"
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Phase Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Phase <span className="text-red-500">*</span>
            </Label>
            {showNewPhaseInput ? (
              <div className="space-y-2">
                <Input
                  value={newPhaseTitle}
                  onChange={(e) => setNewPhaseTitle(e.target.value)}
                  placeholder="Nom de la nouvelle phase..."
                  className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewPhaseInput(false);
                    setNewPhaseTitle('');
                    setSelectedPhaseId(currentPhaseId);
                  }}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <Select value={selectedPhaseId} onValueChange={handlePhaseChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionner une phase" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {phases.filter(p => !p.isDeleted).map((phase) => (
                    <SelectItem key={phase.id} value={phase.id!}>
                      Phase {phase.phaseNumber}: {phase.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Créer une nouvelle phase
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Chapter Selection */}
          {selectedPhaseId && !showNewPhaseInput && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">
                Chapitre <span className="text-red-500">*</span>
              </Label>
              {showNewChapterInput ? (
                <div className="space-y-2">
                  <Input
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="Nom du nouveau chapitre..."
                    className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewChapterInput(false);
                      setNewChapterName('');
                      const chapters = getChaptersForPhase(selectedPhaseId);
                      setSelectedChapterId(chapters[0]?.id || '');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Select value={selectedChapterId} onValueChange={handleChapterChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Sélectionner un chapitre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {getChaptersForPhase(selectedPhaseId).map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id!}>
                        Chapitre {chapter.chapterNumber}: {chapter.miniChapter}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">
                      <Plus className="h-4 w-4 inline mr-2" />
                      Créer un nouveau chapitre
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Skills Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Compétences <span className="text-red-500">* (minimum 1)</span>
            </Label>
            
            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md bg-muted/50">
              {selectedSkills.length === 0 ? (
                <span className="text-sm text-muted-foreground">Aucune compétence sélectionnée</span>
              ) : (
                selectedSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                    {skill.name}
                    <span className="text-xs text-muted-foreground ml-1">({skill.level})</span>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {selectedSkills.length === 0 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Vous devez sélectionner au moins une compétence</span>
              </div>
            )}

            {/* Add Existing Skill */}
            {availableSkills.length > 0 && (
              <div className="flex gap-2">
                <Select onValueChange={handleAddSkill}>
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue placeholder="Ajouter une compétence existante" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {availableSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name} ({skill.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Add New Skill */}
            {showNewSkillInput ? (
              <div className="space-y-2 p-3 border rounded-md bg-blue-50/50">
                <div className="flex gap-2">
                  <Input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Nom de la compétence"
                    className="flex-1"
                  />
                  <Select value={newSkillLevel} onValueChange={(value: any) => setNewSkillLevel(value)}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="BEGINNER">Débutant</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                      <SelectItem value="ADVANCED">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewSkill}
                    disabled={!newSkillName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewSkillInput(false);
                      setNewSkillName('');
                      setNewSkillLevel('BEGINNER');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewSkillInput(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une nouvelle compétence
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonEditModal;
