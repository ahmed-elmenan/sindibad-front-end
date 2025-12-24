import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Skill } from "@/types/Skill";

interface SkillsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (skills: Skill[]) => void;
  initialSkills?: Skill[];
  existingSkills?: Skill[]; // Liste des skills déjà existants dans le système
}

const SkillsModal: React.FC<SkillsModalProps> = ({
  open,
  onClose,
  onSave,
  initialSkills = [],
  existingSkills = [],
}) => {
  const { t } = useTranslation();
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(initialSkills);
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedExistingSkill, setSelectedExistingSkill] =
    useState<string>("");

  useEffect(() => {
    setSelectedSkills(initialSkills);
  }, [initialSkills]);

  const handleAddNewSkill = () => {
    if (newSkillName.trim()) {
      const newSkill: Skill = {
        id: `temp-${Date.now()}`, // Temporary ID for new skills
        name: newSkillName.trim(),
      };
      setSelectedSkills([...selectedSkills, newSkill]);
      setNewSkillName("");
    }
  };

  const handleAddExistingSkill = () => {
    const skill = existingSkills.find((s) => s.id === selectedExistingSkill);
    if (skill && !selectedSkills.find((s) => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSelectedExistingSkill("");
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== skillId));
    // Réinitialiser la sélection du dropdown pour forcer le re-render
    setSelectedExistingSkill("");
  };

  const handleSave = () => {
    onSave(selectedSkills);
    onClose();
  };

  // Filtrer les skills existants pour ne montrer que ceux qui ne sont pas déjà sélectionnés
  // Comparer par nom car les nouveaux skills ont des IDs temporaires
  const availableExistingSkills = existingSkills.filter(
    (skill) => !selectedSkills.find((s) => s.name.toLowerCase() === skill.name.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[650px] bg-white border shadow-2xl">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                {t("admin.skills.manageSkills", "Gérer les compétences")}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {t(
                  "admin.skills.description",
                  "Sélectionnez des compétences existantes ou créez-en de nouvelles"
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Selected Skills */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {t("admin.skills.selectedSkills", "Compétences sélectionnées")}
              <span className="ml-auto text-xs font-normal text-gray-500">
                {selectedSkills.length} {selectedSkills.length > 1 ? "compétences" : "compétence"}
              </span>
            </Label>
            <div className="flex flex-wrap gap-2 min-h-[80px] p-4 border-2 border-dashed rounded-xl bg-gradient-to-br from-orange-50/50 to-yellow-50/30 transition-all duration-300 hover:border-primary/30">
              {selectedSkills.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {t(
                      "admin.skills.noSkillsSelected",
                      "Aucune compétence sélectionnée"
                    )}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Ajoutez des compétences ci-dessous
                  </span>
                </div>
              ) : (
                selectedSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="pl-3 pr-2 py-1.5 bg-white border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-gray-700 font-medium group"
                  >
                    <span className="mr-1.5">{skill.name}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="ml-1 p-0.5 rounded-full hover:bg-red-100 transition-colors"
                      title="Retirer"
                    >
                      <X className="h-3.5 w-3.5 text-gray-500 group-hover:text-red-600 transition-colors" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Add Existing Skill */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {t(
                "admin.skills.addExisting",
                "Ajouter une compétence existante"
              )}
            </Label>
            {availableExistingSkills.length > 0 ? (
              <div className="flex gap-2">
                <Select
                  key={`select-${selectedSkills.length}`}
                  value={selectedExistingSkill}
                  onValueChange={setSelectedExistingSkill}
                >
                  <SelectTrigger className="flex-1 h-11 border-2 hover:border-primary/50 transition-all bg-white">
                    <SelectValue
                      placeholder={t(
                        "admin.skills.selectExisting",
                        "Sélectionner une compétence..."
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {availableExistingSkills.map((skill) => (
                      <SelectItem 
                        key={skill.id} 
                        value={skill.id}
                        className="cursor-pointer hover:bg-orange-50"
                      >
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddExistingSkill}
                  disabled={!selectedExistingSkill}
                  variant="outline"
                  className="h-11 w-11 border-2 hover:bg-blue-50 hover:border-blue-500 transition-all disabled:opacity-50"
                  title="Ajouter"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed rounded-xl bg-gray-50 text-center">
                <span className="text-sm text-gray-500">
                  Toutes les compétences existantes sont déjà sélectionnées
                </span>
              </div>
            )}
          </div>

          {/* Create New Skill */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {t("admin.skills.createNew", "Créer une nouvelle compétence")}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder={t(
                  "admin.skills.skillName",
                  "Nom de la compétence..."
                )}
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 h-11 border-2 hover:border-primary/50 focus:border-primary transition-all bg-white"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewSkill();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddNewSkill}
                disabled={!newSkillName.trim()}
                variant="outline"
                className="h-11 w-11 border-2 hover:bg-green-50 hover:border-green-500 transition-all disabled:opacity-50"
                title="Créer"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-6 border-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {t("common.cancel", "Annuler")}
          </Button>
          <Button 
            onClick={handleSave}
            className="h-11 px-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="flex items-center gap-2">
              {t("common.save", "Enregistrer")}
              <span className="text-xs opacity-75">({selectedSkills.length})</span>
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsModal;
