export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  postedAt: string
  updatedAt: string
  replies?: Comment[]
  parentId?: string
  userRole: string
  replyCount?: number // Nouveau champ pour stocker le nombre de réponses
  canManage?: boolean // Indique si l'utilisateur peut gérer ce commentaire
}