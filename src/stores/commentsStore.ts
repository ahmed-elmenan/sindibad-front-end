import { create } from 'zustand';
import { toast } from '@/components/ui/sonner';
import { 
  getLessonComments, 
  getLessonCommentReplies,
  deleteComment as deleteCommentAPI
} from "@/services/comment.service";
import type { Comment } from '@/types';

interface CommentsState {
  // Core state
  comments: Comment[];
  isLoading: boolean;
  currentPage: number;
  hasMoreComments: boolean;
  commentsLoaded: boolean;
  totalComments: number;
  expandedReplies: string[];
  expandedComments: string[];
  
  // Cache
  commentsCache: Record<string, Comment[]> & { totalElements?: number };
  repliesCache: Record<string, Comment[]>;
  
  // Actions
  setComments: (comments: Comment[]) => void;
  loadComments: (lessonId: string, page?: number, reset?: boolean) => Promise<void>;
  loadReplies: (lessonId: string, commentId: string) => Promise<void>;
  addComment: (lessonId: string, newComment: Comment) => void;
  addReply: (parentId: string, newReply: Comment) => void;
  updateComment: (updatedComment: Comment) => void;
  deleteComment: (lessonId: string, commentId: string, onDeleteComment?: (commentId: string) => Promise<void>) => Promise<void>;
  expandReplies: (commentId: string) => void;
  collapseReplies: (commentId: string) => void;
  expandComment: (commentId: string) => void;
  collapseComment: (commentId: string) => void;
  initializeComments: (lessonId: string, initialComments: Comment[]) => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  // Core state
  comments: [],
  isLoading: false,
  currentPage: 0,
  hasMoreComments: true,
  commentsLoaded: false,
  totalComments: 0,
  expandedReplies: [],
  expandedComments: [],
  
  // Cache
  commentsCache: {},
  repliesCache: {},
  
  // Actions
  setComments: (comments) => set({ comments }),
  
  loadComments: async (lessonId, page = 0, reset = false) => {
    const { isLoading, comments, commentsCache } = get();
    
    if (isLoading) return;
    
    try {
      set({ isLoading: true });
      
      const cacheKey = `${lessonId}_${page}`;
      if (commentsCache[cacheKey]) {
        const cachedComments = commentsCache[cacheKey];
        let updatedComments;
        
        if (reset) {
          updatedComments = cachedComments;
          set({ 
            comments: updatedComments,
            currentPage: page,
          });
        } else {
          updatedComments = [...comments, ...cachedComments];
          set({ 
            comments: updatedComments,
            currentPage: page,
          });
        }
        
        if (page === 0 || reset) {
          if (typeof commentsCache.totalElements === 'number') {
            set({ totalComments: commentsCache.totalElements });
          }
        }
        
        const totalElementsInCache = commentsCache.totalElements || 0;
        set({
          hasMoreComments: updatedComments.length < totalElementsInCache,
          commentsLoaded: true
        });
        return;
      }
      
      const response = await getLessonComments(lessonId, page);
      
      // Vérifier s'il y a une erreur
      if (response.error) {
        console.error("Error loading comments:", response.error);
        toast.error(`Erreur lors du chargement des commentaires: ${response.error}`);
        
        // Marquer comme chargé même en cas d'erreur pour éviter les boucles infinies
        set({ 
          commentsLoaded: true, 
          comments: [], 
          totalComments: 0,
          hasMoreComments: false
        });
        
        const newCache = { ...commentsCache };
        newCache[cacheKey] = [];
        newCache.totalElements = 0;
        set({ commentsCache: newCache });
        
        return;
      }
      
      const { content, totalElements } = response;
      
      // Update cache
      const newCache = { ...commentsCache };
      newCache[cacheKey] = content;
      newCache.totalElements = totalElements;
      
      let updatedComments;
      if (reset) {
        updatedComments = content;
      } else {
        updatedComments = [...comments, ...content];
      }
      
      set({ 
        comments: updatedComments,
        totalComments: totalElements,
        currentPage: page,
        hasMoreComments: updatedComments.length < totalElements,
        commentsLoaded: true,
        commentsCache: newCache
      });
      
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Erreur lors du chargement des commentaires");
      
      // Marquer comme chargé même en cas d'erreur pour éviter les boucles infinies
      set({ 
        commentsLoaded: true, 
        comments: [], 
        totalComments: 0,
        hasMoreComments: false
      });
      
      const cacheKey = `${lessonId}_${page}`;
      const newCache = { ...get().commentsCache };
      newCache[cacheKey] = [];
      newCache.totalElements = 0;
      set({ commentsCache: newCache });
      
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadReplies: async (lessonId, commentId) => {
    const { repliesCache, comments } = get();
    
    try {
      if (repliesCache[commentId]) {
        // Update comments with cached replies
        set({ 
          comments: updateCommentsWithRepliesHelper(comments, commentId, repliesCache[commentId])
        });
        return;
      }
      
      const result = await getLessonCommentReplies(lessonId, commentId);
      
      // Check for error
      if (result.error) {
        console.error(`Error loading replies for comment ${commentId}:`, result.error);
        toast.error(`Erreur lors du chargement des réponses: ${result.error}`);
        return;
      }
      
      const replies = result.data;
      
      // Update cache
      const newRepliesCache = { ...repliesCache };
      newRepliesCache[commentId] = replies;
      
      set({
        comments: updateCommentsWithRepliesHelper(comments, commentId, replies),
        repliesCache: newRepliesCache
      });
      
    } catch (error) {
      console.error(`Error loading replies for comment ${commentId}:`, error);
      toast.error("Erreur lors du chargement des réponses");
    }
  },
  
  addComment: (lessonId, newComment) => {
    const { comments, commentsCache, totalComments } = get();
    
    // Update local state
    set({
      comments: [newComment, ...comments],
      totalComments: totalComments + 1
    });
    
    // Update cache
    const cacheKey = `${lessonId}_0`;
    const newCache = { ...commentsCache };
    
    if (newCache[cacheKey]) {
      newCache[cacheKey] = [newComment, ...newCache[cacheKey]].slice(0, 5);
    }
    
    if (typeof newCache.totalElements === 'number') {
      newCache.totalElements += 1;
    }
    
    set({ commentsCache: newCache });
  },
  
  addReply: (parentId, newReply) => {
    const { comments, repliesCache, expandedReplies } = get();
    
    // Update comment tree
    set({ 
      comments: updateReplyInCommentTree(comments, parentId, newReply),
    });
    
    // Update cache
    const newRepliesCache = { ...repliesCache };
    if (newRepliesCache[parentId]) {
      newRepliesCache[parentId] = [newReply, ...newRepliesCache[parentId]];
    } else {
      newRepliesCache[parentId] = [newReply];
    }
    
    // Expand replies if not already expanded
    if (!expandedReplies.includes(parentId)) {
      set({ 
        expandedReplies: [...expandedReplies, parentId],
        repliesCache: newRepliesCache
      });
    } else {
      set({ repliesCache: newRepliesCache });
    }
  },
  
  updateComment: (updatedComment) => {
    const { comments, commentsCache, repliesCache } = get();
    
    // Update in main comments array
    set({
      comments: comments.map(comment => {
        if (comment.id === updatedComment.id) {
          return updatedComment;
        } else if (comment.replies) {
          // Check replies as well
          const updatedReplies = comment.replies.map(reply => 
            reply.id === updatedComment.id ? updatedComment : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    });
    
    // Update in comments cache
    const newCommentsCache = { ...commentsCache };
    Object.keys(newCommentsCache).forEach(key => {
      if (Array.isArray(newCommentsCache[key])) {
        newCommentsCache[key] = newCommentsCache[key].map((comment: Comment) => {
          return comment.id === updatedComment.id ? updatedComment : comment;
        });
      }
    });
    
    // Update in replies cache
    const newRepliesCache = { ...repliesCache };
    Object.keys(newRepliesCache).forEach(key => {
      if (Array.isArray(newRepliesCache[key])) {
        newRepliesCache[key] = newRepliesCache[key].map((reply: Comment) => {
          return reply.id === updatedComment.id ? updatedComment : reply;
        });
      }
    });
    
    set({
      commentsCache: newCommentsCache,
      repliesCache: newRepliesCache
    });
  },
  
  deleteComment: async (lessonId, commentId, onDeleteComment) => {
    const { comments, commentsCache, repliesCache, totalComments } = get();
    
    try {
      // 1. First update UI for better UX
      
      // Remove from root comments
      const filteredComments = comments.filter(comment => comment.id !== commentId);
      
      // Handle if comment is a reply
      const updatedComments = filteredComments.map(comment => {
        if (comment.replies) {
          const initialLength = comment.replies.length;
          const updatedReplies = comment.replies.filter(reply => reply.id !== commentId);
          
          // Update reply count if needed
          if (updatedReplies.length !== initialLength) {
            const replyCount = (comment.replyCount || 0) - (initialLength - updatedReplies.length);
            return { 
              ...comment, 
              replies: updatedReplies,
              replyCount: Math.max(0, replyCount)
            };
          }
          
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      
      // Update state
      set({ comments: updatedComments });
      
      // 2. Update caches
      
      // Update comments cache
      const newCommentsCache = { ...commentsCache };
      Object.keys(newCommentsCache).forEach(key => {
        if (Array.isArray(newCommentsCache[key])) {
          newCommentsCache[key] = newCommentsCache[key].filter(
            (comment: Comment) => comment.id !== commentId
          );
        }
      });
      
      // Update total count
      if (typeof newCommentsCache.totalElements === 'number') {
        newCommentsCache.totalElements = Math.max(0, newCommentsCache.totalElements - 1);
      }
      
      // Update replies cache
      const newRepliesCache = { ...repliesCache };
      
      // Remove the comment's replies if it's a parent
      if (newRepliesCache[commentId]) {
        delete newRepliesCache[commentId];
      }
      
      // Remove the comment from other comments' replies
      Object.keys(newRepliesCache).forEach(key => {
        if (Array.isArray(newRepliesCache[key])) {
          newRepliesCache[key] = newRepliesCache[key].filter(
            (reply: Comment) => reply.id !== commentId
          );
        }
      });
      
      set({ 
        commentsCache: newCommentsCache,
        repliesCache: newRepliesCache,
        totalComments: Math.max(0, totalComments - 1)
      });
      
      // 3. Call API
      if (onDeleteComment) {
        await onDeleteComment(commentId);
      } else {
        try {
          await deleteCommentAPI(lessonId, commentId);
        } catch (apiError: any) {
          // Ignore 400/404 errors as comment might have already been deleted
          if (apiError?.response?.status !== 400 && apiError?.response?.status !== 404) {
            console.error("API error deleting comment:", apiError);
            // Don't throw error here - we've already updated the UI
          }
        }
      }
      
      toast.success("Commentaire supprimé avec succès");
    } catch (error) {
      console.error("Error in delete comment flow:", error);
      toast.error("Erreur lors de la suppression");
    }
  },
  
  expandReplies: (commentId) => {
    set(state => ({ 
      expandedReplies: [...state.expandedReplies, commentId]
    }));
  },
  
  collapseReplies: (commentId) => {
    set(state => ({ 
      expandedReplies: state.expandedReplies.filter(id => id !== commentId)
    }));
  },
  
  expandComment: (commentId) => {
    set(state => ({ 
      expandedComments: [...state.expandedComments, commentId]
    }));
  },
  
  collapseComment: (commentId) => {
    set(state => ({ 
      expandedComments: state.expandedComments.filter(id => id !== commentId)
    }));
  },
  
  initializeComments: (lessonId, initialComments) => {
    if (initialComments.length > 0) {
      const cacheKey = `${lessonId}_0`;
      const newCache = { ...get().commentsCache };
      newCache[cacheKey] = initialComments;
      
      const totalElements = initialComments.length === 5 ? 6 : initialComments.length;
      newCache.totalElements = totalElements;
      
      set({ 
        comments: initialComments,
        commentsCache: newCache,
        currentPage: 0,
        totalComments: totalElements,
        hasMoreComments: initialComments.length < totalElements,
        commentsLoaded: true
      });
    }
  }
}));

// Helper functions
function updateCommentsWithRepliesHelper(comments: Comment[], commentId: string, replies: Comment[]): Comment[] {
  return comments.map(comment => {
    // Direct match
    if (comment.id === commentId) {
      return { 
        ...comment, 
        replies, 
        replyCount: replies.length
      };
    }
    
    // Check in replies
    if (comment.replies && comment.replies.length > 0) {
      return { 
        ...comment, 
        replies: updateCommentsWithRepliesHelper(comment.replies, commentId, replies)
      };
    }
    
    return comment;
  });
}

function updateReplyInCommentTree(comments: Comment[], parentId: string, newReply: Comment): Comment[] {
  return comments.map(comment => {
    // Direct match with parent
    if (comment.id === parentId) {
      const updatedReplies = comment.replies 
        ? [newReply, ...comment.replies] 
        : [newReply];
      
      return { 
        ...comment, 
        replies: updatedReplies,
        replyCount: (comment.replyCount || 0) + 1
      };
    }
    
    // Check in replies
    if (comment.replies && comment.replies.length > 0) {
      return { 
        ...comment, 
        replies: updateReplyInCommentTree(comment.replies, parentId, newReply)
      };
    }
    
    return comment;
  });
}
