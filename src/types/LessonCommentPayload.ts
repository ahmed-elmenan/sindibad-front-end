export interface LessonCommentPayload {
  id?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  content?: string;
  parentId?: string;
  postedAt?: Date;
  updatedAt?: Date;
  replies?: LessonCommentPayload[];
}
