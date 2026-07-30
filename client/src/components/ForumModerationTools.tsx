import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from './ui/button';
import { 
  Pin, 
  Lock, 
  Unlock, 
  Shield, 
  Trash2,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ForumModerationToolsProps {
  threadId: number;
  postId?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  isInstructorPost?: boolean;
  onUpdate?: () => void;
}

export function ForumModerationTools({
  threadId,
  postId,
  isPinned = false,
  isLocked = false,
  isInstructorPost = false,
  onUpdate,
}: ForumModerationToolsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'post' | 'thread'>('post');

  const utils = trpc.useUtils();

  // Check if user is instructor
  const { data: instructorStatus } = trpc.forumModeration.checkInstructorStatus.useQuery();
  const isInstructor = instructorStatus?.isInstructor || false;

  // Mutations
  const togglePinMutation = trpc.forumModeration.togglePinThread.useMutation({
    onSuccess: () => {
      toast.success(isPinned ? 'Thread unpinned' : 'Thread pinned');
      utils.forums.getThread.invalidate();
      utils.forums.getCourseThreads.invalidate();
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to ${isPinned ? 'unpin' : 'pin'} thread: ${error.message}`);
    },
  });

  const toggleLockMutation = trpc.forumModeration.toggleLockThread.useMutation({
    onSuccess: () => {
      toast.success(isLocked ? 'Thread unlocked' : 'Thread locked');
      utils.forums.getThread.invalidate();
      utils.forums.getCourseThreads.invalidate();
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to ${isLocked ? 'unlock' : 'lock'} thread: ${error.message}`);
    },
  });

  const markInstructorPostMutation = trpc.forumModeration.markAsInstructorPost.useMutation({
    onSuccess: () => {
      toast.success(isInstructorPost ? 'Unmarked as instructor post' : 'Marked as instructor post');
      utils.forums.getThread.invalidate();
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });

  const deletePostMutation = trpc.forumModeration.moderateDeletePost.useMutation({
    onSuccess: () => {
      toast.success('Post deleted');
      utils.forums.getThread.invalidate();
      utils.forums.getCourseThreads.invalidate();
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });

  const deleteThreadMutation = trpc.forumModeration.moderateDeleteThread.useMutation({
    onSuccess: () => {
      toast.success('Thread deleted');
      utils.forums.getCourseThreads.invalidate();
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete thread: ${error.message}`);
    },
  });

  const handleTogglePin = () => {
    togglePinMutation.mutate({ threadId, isPinned: !isPinned });
  };

  const handleToggleLock = () => {
    toggleLockMutation.mutate({ threadId, isLocked: !isLocked });
  };

  const handleToggleInstructorPost = () => {
    if (!postId) return;
    markInstructorPostMutation.mutate({ postId, isInstructorPost: !isInstructorPost });
  };

  const handleDelete = () => {
    if (deleteType === 'post' && postId) {
      deletePostMutation.mutate({ postId });
    } else if (deleteType === 'thread') {
      deleteThreadMutation.mutate({ threadId });
    }
    setShowDeleteDialog(false);
  };

  const openDeleteDialog = (type: 'post' | 'thread') => {
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  if (!isInstructor) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <Shield className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Instructor Moderation Tools
        </span>
        <div className="flex-1" />
        
        {/* Thread controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePin}
          disabled={togglePinMutation.isPending}
          title={isPinned ? 'Unpin thread' : 'Pin thread'}
        >
          <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLock}
          disabled={toggleLockMutation.isPending}
          title={isLocked ? 'Unlock thread' : 'Lock thread'}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>

        {/* Post controls */}
        {postId && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleInstructorPost}
              disabled={markInstructorPostMutation.isPending}
              title={isInstructorPost ? 'Unmark as instructor post' : 'Mark as instructor post'}
            >
              <Shield className={`h-4 w-4 ${isInstructorPost ? 'fill-current text-blue-600' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteDialog('post')}
              disabled={deletePostMutation.isPending}
              title="Delete post"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </>
        )}

        {/* Thread delete */}
        {!postId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteDialog('thread')}
            disabled={deleteThreadMutation.isPending}
            title="Delete thread"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete {deleteType === 'post' ? 'Post' : 'Thread'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              {deleteType === 'post' ? 'post' : 'thread and all its replies'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
