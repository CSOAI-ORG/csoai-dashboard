import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from './RichTextEditor';
import { ForumModerationTools } from './ForumModerationTools';
import { MentionHighlight } from './MentionHighlight';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  Plus,
  Send,
  Edit2,
  Trash2,
  Search,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface CourseDiscussionProps {
  courseId: number;
  lessonId?: number;
}

export function CourseDiscussion({ courseId, lessonId }: CourseDiscussionProps) {
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [useRichText] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const utils = trpc.useUtils();

  // Fetch threads (either search or regular list)
  const { data: searchResults, isLoading: isSearching } = trpc.forums.searchThreads.useQuery(
    {
      query: searchQuery,
      courseId,
      sortBy: sortBy === 'unanswered' ? 'recent' : sortBy,
    },
    { enabled: showSearch && searchQuery.length > 0 }
  );

  const { data: threads, isLoading } = trpc.forums.getCourseThreads.useQuery(
    {
      courseId,
      lessonId,
      sortBy,
    },
    { enabled: !showSearch || searchQuery.length === 0 }
  );

  const displayThreads = showSearch && searchQuery.length > 0 ? searchResults : threads;

  // Fetch selected thread details
  const { data: threadDetails } = trpc.forums.getThread.useQuery(
    { threadId: selectedThreadId! },
    { enabled: !!selectedThreadId }
  );

  // Mutations
  const createThreadMutation = trpc.forums.createThread.useMutation({
    onSuccess: () => {
      toast.success('Thread created successfully!');
      setShowNewThread(false);
      setNewThreadTitle('');
      setNewThreadContent('');
      utils.forums.getCourseThreads.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create thread: ${error.message}`);
    },
  });

  const createPostMutation = trpc.forums.createPost.useMutation({
    onSuccess: () => {
      toast.success('Reply posted!');
      setReplyContent('');
      utils.forums.getThread.invalidate();
      utils.forums.getCourseThreads.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to post reply: ${error.message}`);
    },
  });

  const toggleLikeMutation = trpc.forums.togglePostLike.useMutation({
    onSuccess: () => {
      utils.forums.getThread.invalidate();
    },
  });

  const markSolutionMutation = trpc.forums.markAsSolution.useMutation({
    onSuccess: () => {
      toast.success('Marked as solution!');
      utils.forums.getThread.invalidate();
    },
  });

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    createThreadMutation.mutate({
      courseId,
      lessonId,
      title: newThreadTitle,
      content: newThreadContent,
    });
  };

  const handleReply = (parentPostId?: number) => {
    if (!replyContent.trim() || !selectedThreadId) return;

    createPostMutation.mutate({
      threadId: selectedThreadId,
      content: replyContent,
      parentPostId,
    });
  };

  const handleLike = (postId: number) => {
    toggleLikeMutation.mutate({ postId });
  };

  const handleMarkSolution = (postId: number) => {
    markSolutionMutation.mutate({ postId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Thread list view
  if (!selectedThreadId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussion Forum
          </h3>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery('');
              }} 
              size="sm" 
              variant="outline"
            >
              {showSearch ? <X className="h-4 w-4 mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              {showSearch ? 'Close Search' : 'Search'}
            </Button>
            <Button onClick={() => setShowNewThread(!showNewThread)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Sort options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            Popular
          </Button>
          <Button
            variant={sortBy === 'unanswered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('unanswered')}
          >
            Unanswered
          </Button>
        </div>

        {/* New thread form */}
        {showNewThread && (
          <Card className="p-4 space-y-3">
            <Input
              placeholder="Thread title..."
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
            />
            {useRichText ? (
              <RichTextEditor
                content={newThreadContent}
                onChange={setNewThreadContent}
                placeholder="What would you like to discuss?"
              />
            ) : (
              <Textarea
                placeholder="What would you like to discuss?"
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                rows={4}
              />
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreateThread} disabled={createThreadMutation.isPending}>
                Create Thread
              </Button>
              <Button variant="outline" onClick={() => setShowNewThread(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Thread list */}
        <div className="space-y-2">
          {(isLoading || isSearching) && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {!isLoading && !isSearching && displayThreads && displayThreads.length > 0 ? (
            displayThreads.map((thread) => (
              <Card
                key={thread.id}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {thread.isPinned && <Pin className="h-4 w-4 text-primary" />}
                      {thread.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      <h4 className="font-medium">{thread.title}</h4>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      <div dangerouslySetInnerHTML={{ __html: thread.content }} />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {thread.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {thread.replyCount} replies
                      </span>
                      <span>
                        by {thread.author?.name || 'Unknown'} •{' '}
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No discussions yet. Be the first to start a conversation!</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Thread detail view
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => setSelectedThreadId(null)} size="sm">
        ← Back to threads
      </Button>

      {threadDetails && (
        <>
          {/* Moderation tools */}
          <ForumModerationTools
            threadId={threadDetails.id}
            isPinned={Boolean(threadDetails.isPinned)}
            isLocked={Boolean(threadDetails.isLocked)}
            onUpdate={() => {
              utils.forums.getThread.invalidate();
              utils.forums.getCourseThreads.invalidate();
            }}
          />

          {/* Thread header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {threadDetails.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  {threadDetails.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <h2 className="text-2xl font-bold">{threadDetails.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{threadDetails.author?.name || 'Unknown'}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(threadDetails.createdAt), { addSuffix: true })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {threadDetails.viewCount} views
                  </span>
                </div>
              </div>
            </div>
            <MentionHighlight content={threadDetails.content} />
          </Card>

          <Separator />

          {/* Posts/Replies */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              {threadDetails.posts?.length || 0} {threadDetails.posts?.length === 1 ? 'Reply' : 'Replies'}
            </h3>

            {threadDetails.posts && threadDetails.posts.length > 0 ? (
              threadDetails.posts.map((post) => (
                <div key={post.id} className="space-y-2">
                  <ForumModerationTools
                    threadId={threadDetails.id}
                    postId={post.id}
                    isPinned={Boolean(threadDetails.isPinned)}
                    isLocked={Boolean(threadDetails.isLocked)}
                    isInstructorPost={Boolean(post.isInstructorPost)}
                    onUpdate={() => {
                      utils.forums.getThread.invalidate();
                      utils.forums.getCourseThreads.invalidate();
                    }}
                  />
                  <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{post.author?.name || 'Unknown'}</span>
                        {post.isInstructorPost && (
                          <Badge variant="secondary" className="text-xs">
                            Instructor
                          </Badge>
                        )}
                        {post.isSolution && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Solution
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                        {post.isEdited && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <MentionHighlight content={post.content} />
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={post.isLikedByUser ? 'text-primary' : ''}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likeCount}
                        </Button>
                        {!post.isSolution && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkSolution(post.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark as solution
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  </Card>
                </div>
              ))
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <p>No replies yet. Be the first to respond!</p>
              </Card>
            )}
          </div>

          {/* Reply form */}
          {!threadDetails.isLocked && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Post a reply</h4>
              {useRichText ? (
                <RichTextEditor
                  content={replyContent}
                  onChange={setReplyContent}
                  placeholder="Share your thoughts..."
                  className="mb-3"
                />
              ) : (
                <Textarea
                  placeholder="Share your thoughts..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="mb-3"
                />
              )}
              <Button
                onClick={() => handleReply()}
                disabled={createPostMutation.isPending || !replyContent.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Reply
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
