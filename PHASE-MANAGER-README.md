# Migration de ChapterManager vers PhaseManager

## Vue d'ensemble

Le système a été restructuré pour passer d'une hiérarchie à 2 niveaux (Chapter > Video) à une hiérarchie à 3 niveaux (Phase > Chapter > Video), alignée avec la structure backend.

## Correspondance Backend ↔ Frontend

### Structure Backend (Java Entities)

```
Course
  └── Chapter (entity)                 → Phase (frontend)
       ├── title (String)              → title
       ├── description (String)        → description
       ├── order (Integer)             → order/phaseNumber
       ├── videoPath (String)          → videoPath
       └── Lessons (List<Lesson>)
            └── Lesson (entity)        → Video (frontend)
                 ├── title (String)           → title
                 ├── description (String)     → description
                 ├── videoUrl (String)        → videoUrl
                 ├── duration (Integer)       → duration
                 ├── order (Integer)          → order
                 ├── referenceUrl (String)    → referenceUrl
                 ├── miniChapter (String)     → Chapter.miniChapter
                 └── skills (List<Skill>)     → skills
```

### Nomenclature des fichiers

**ANCIEN FORMAT :** `ch1-v1.mp4` (Chapitre 1, Vidéo 1)

**NOUVEAU FORMAT :** `ph1-ch1-v1.mp4` (Phase 1, Chapitre 1, Vidéo 1)

## Nouveaux Composants Créés

### 1. **PhaseManager.tsx**
Remplace `ChapterManager.tsx` avec la nouvelle structure hiérarchique :
- Gestion des Phases (backend Chapter)
- Gestion des Chapitres (backend Lesson.miniChapter)
- Gestion des Vidéos (backend Lesson)
- Affichage de la taille des fichiers
- Validation du format de nommage `ph1-ch1-v1.mp4`

### 2. **SkillsModal.tsx**
Modal pour gérer les compétences (skills) des vidéos :
- Sélection de skills existants
- Création de nouveaux skills
- Support de plusieurs skills par vidéo
- Niveaux de compétence : BEGINNER, INTERMEDIATE, ADVANCED

### 3. **PhaseManager.ts** (types)
Nouveaux types TypeScript pour la structure à 3 niveaux :
- `UnifiedPhase` : Représente une phase avec ses chapitres
- `UnifiedChapter` : Représente un chapitre avec ses vidéos
- `UnifiedVideo` : Vidéo enrichie avec skills et fileSize

### 4. **skill.service.ts**
Service pour la gestion des skills via l'API :
- `getAllSkills()` : Récupérer tous les skills
- `createSkill()` : Créer un nouveau skill
- `updateSkill()` : Mettre à jour un skill
- `deleteSkill()` : Supprimer un skill
- `getLessonSkills()` : Récupérer les skills d'une leçon
- `updateLessonSkills()` : Mettre à jour les skills d'une leçon

## Fonctionnalités Implémentées

### ✅ Complétées

1. **Structure hiérarchique Phase > Chapter > Video**
   - Organisation en 3 niveaux
   - Dossiers déroulants (expand/collapse)

2. **Gestion des Skills**
   - Modal d'édition des skills
   - Sélection de skills existants
   - Création de nouveaux skills
   - Support multi-skills par vidéo

3. **Validation des fichiers**
   - Format `ph1-ch1-v1.mp4`
   - Messages d'erreur clairs

4. **Affichage des informations**
   - Taille des fichiers vidéo
   - Durée des vidéos
   - Nombre de skills par vidéo

5. **Formulaires d'édition**
   - Phase : title, description (attributs de Chapter entity)
   - Chapter : miniChapter uniquement
   - Video : title, description, referenceUrl, duration, skills

6. **Interface utilisateur**
   - Design moderne et responsive
   - Animations fluides
   - Feedback visuel

### ⚠️ À Implémenter (Backend requis)

1. **Upload des vidéos**
   - Adapter l'endpoint backend pour la nouvelle structure
   - Traiter le format `ph1-ch1-v1`
   - Créer automatiquement phases/chapitres/lessons

2. **API Endpoints requis**
   ```
   POST /admin/courses/:courseId/upload-videos-v2
   - Body: FormData avec files + metadata (phases/chapters/videos)
   
   GET /skills
   - Retourne la liste de tous les skills
   
   POST /skills
   - Crée un nouveau skill
   
   PUT /lessons/:lessonId/skills
   - Met à jour les skills d'une lesson
   ```

3. **Drag & Drop entre phases/chapitres**
   - Fonctionnalité de déplacement des vidéos
   - Fusion de phases
   - Réorganisation

4. **Sauvegarde individuelle**
   - Édition et sauvegarde des phases
   - Édition et sauvegarde des chapitres
   - Édition et sauvegarde des vidéos avec skills

5. **Gestion des suppressions**
   - Suppression de phases
   - Suppression de chapitres
   - Suppression de vidéos

## Structure des Données

### Format d'upload attendu

```typescript
{
  phases: [
    {
      number: 1,
      title: "Phase 1",
      description: "Description de la phase",
      chapters: [
        {
          number: 1,
          miniChapter: "Introduction",
          videos: [
            {
              name: "ph1-ch1-v1.mp4",
              title: "Première vidéo",
              description: "Description de la vidéo",
              skills: [
                { id: "skill-1", name: "JavaScript", level: "BEGINNER" },
                { id: "skill-2", name: "React", level: "INTERMEDIATE" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Backend - Modifications Nécessaires

### 1. Nouveau Controller Endpoint

```java
@PostMapping("/admin/courses/{courseId}/upload-videos-v2")
public ResponseEntity<?> uploadVideosWithPhases(
    @PathVariable UUID courseId,
    @RequestParam("files") MultipartFile[] files,
    @RequestParam("metadata") String metadataJson
) {
    // Parser le metadata JSON
    // Créer/mettre à jour les Chapters (phases)
    // Grouper les Lessons par miniChapter
    // Associer les Skills aux Lessons
    // Uploader les fichiers vers S3/storage
}
```

### 2. Mise à jour du Service

```java
public class ChapterService {
    // Nouveau : Créer phase avec chapitres et vidéos
    public void createPhaseWithContent(
        UUID courseId,
        PhaseDTO phaseDTO
    ) {
        // 1. Créer Chapter (phase)
        // 2. Pour chaque chapitre logique (miniChapter)
        //    créer des Lessons avec miniChapter
        // 3. Associer les Skills
    }
}
```

### 3. DTO pour la structure complète

```java
public class PhaseUploadDTO {
    private Integer number;
    private String title;
    private String description;
    private List<ChapterDTO> chapters;
}

public class ChapterDTO {
    private Integer number;
    private String miniChapter;
    private List<VideoDTO> videos;
}

public class VideoDTO {
    private String name;
    private String title;
    private String description;
    private String referenceUrl;
    private List<SkillDTO> skills;
}
```

## Comment Tester

1. **Accéder au PhaseManager**
   ```
   http://localhost:5173/admin/courses/{courseId}/chapters
   ```

2. **Préparer des fichiers de test**
   ```
   ph1-ch1-v1.mp4
   ph1-ch1-v2.mp4
   ph1-ch2-v1.mp4
   ph2-ch1-v1.mp4
   ```

3. **Tester le drag & drop**
   - Glisser les fichiers dans la zone de drop
   - Vérifier l'organisation automatique par phase/chapitre

4. **Tester l'édition**
   - Cliquer sur "Éditer" pour une phase
   - Modifier title/description
   - Cliquer sur "Éditer" pour une vidéo
   - Le modal de skills devrait s'ouvrir

## Notes Importantes

### Mapping Backend ↔ Frontend

- **Backend `Chapter`** = **Frontend `Phase`**
- **Backend `Lesson.miniChapter`** = **Frontend `Chapter`**
- **Backend `Lesson`** = **Frontend `Video`**

### Flux de Données

1. L'utilisateur upload des fichiers nommés `ph1-ch1-v1.mp4`
2. Le frontend organise automatiquement par phase/chapitre
3. Lors de la sauvegarde, les données sont envoyées au backend
4. Le backend crée les `Chapter` entities (phases frontend)
5. Le backend crée les `Lesson` entities avec `miniChapter` renseigné
6. Les skills sont associés aux lessons

## Prochaines Étapes

1. **Backend Priority 1** : Implémenter l'endpoint d'upload avec la nouvelle structure
2. **Backend Priority 2** : Implémenter les endpoints CRUD pour Skills
3. **Frontend Priority 1** : Connecter le bouton "Enregistrer" à la nouvelle API
4. **Frontend Priority 2** : Implémenter le drag & drop entre phases/chapitres
5. **Frontend Priority 3** : Ajouter la gestion des suppressions avec confirmation

## Support

Pour toute question ou problème, référez-vous à :
- `PhaseManager.tsx` : Composant principal
- `SkillsModal.tsx` : Modal de gestion des skills
- `types/PhaseManager.ts` : Définitions TypeScript
- `services/skill.service.ts` : API calls pour les skills

## Changelog

### Version 2.0.0 (Actuelle)
- ✅ Migration vers structure Phase > Chapter > Video
- ✅ Nouveau format de nommage `ph1-ch1-v1.mp4`
- ✅ Gestion des skills avec modal
- ✅ Affichage de la taille des fichiers
- ✅ Formulaires d'édition adaptés
- ⚠️ Upload backend à implémenter
- ⚠️ Drag & Drop à implémenter

### Version 1.0.0 (Ancienne)
- Structure Chapter > Video
- Format `ch1-v1.mp4`
- Pas de gestion des skills
