'use client';

import { useState, useEffect } from 'react';

interface Reply {
  id: number;
  taskId: number;
  author: string;
  authorRole: string;
  content: string;
  parentId: number | null;
  createdAt: string;
}

interface CommentItem {
  id: number;
  taskId: number;
  author: string;
  authorRole: string;
  content: string;
  parentId: number | null;
  createdAt: string;
  replies?: Reply[];
}

interface TaskCommentsProps {
  taskId: number;
  initialComments?: CommentItem[];
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    role?: string;
  };
  onCommentsChange?: (updatedComments: CommentItem[]) => void;
}

const getRoleBadgeStyle = (role: string) => {
  switch (role) {
    case 'OWNER':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'COORDINATOR':
    case 'ADMIN':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'TEACHER':
      return 'bg-teal-100 text-teal-700 border-teal-200';
    case 'ASSISTANT':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'STUDENT':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getAvatarColor = (name: string) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function TaskComments({
  taskId,
  initialComments = [],
  currentUser,
  onCommentsChange
}: TaskCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Sync if initialComments changes
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Fetch comments if initialComments not supplied
  useEffect(() => {
    if (initialComments.length === 0 && taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        if (onCommentsChange) onCommentsChange(data);
      }
    } catch (err) {
      console.error('Error fetching comments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (parentId: number | null = null) => {
    const text = parentId ? replyText : newCommentText;
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text.trim(),
          parentId
        })
      });

      if (res.ok) {
        if (parentId) {
          setReplyText('');
          setReplyingToId(null);
        } else {
          setNewCommentText('');
        }
        await fetchComments();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment', err);
      alert('Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments?commentId=${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchComments();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment', err);
    }
  };

  const userFullName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username : '';

  // Count total comments including replies
  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies ? c.replies.length : 0), 0);

  return (
    <div className="w-full text-left pt-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <i className="fa-solid fa-comments text-amber-500"></i>
          <span>Activity & Comments</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
            {totalCount}
          </span>
        </h4>
      </div>

      {loading && comments.length === 0 ? (
        <div className="py-2 text-center text-xs text-gray-400">Loading discussion...</div>
      ) : (
        comments.length > 0 && (
          <div className="space-y-2.5 mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="group/comment flex flex-col space-y-2">
                {/* Main Comment */}
                <div className="flex items-start gap-2.5 bg-gray-50/80 p-2 rounded-md border border-gray-100 transition-colors hover:bg-gray-100/50">
                  <div
                    className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm"
                    style={{ backgroundColor: getAvatarColor(comment.author) }}
                  >
                    {comment.author.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-gray-900 truncate">{comment.author}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${getRoleBadgeStyle(comment.authorRole)}`}>
                        {comment.authorRole}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
                      {comment.content}
                    </p>

                    {/* Actions bar */}
                    <div className="flex items-center gap-3 mt-1.5 pt-1 text-[10px] text-gray-500 font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(replyingToId === comment.id ? null : comment.id);
                          setReplyText('');
                        }}
                        className="hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        <i className="fa-solid fa-reply text-[9px]"></i>
                        <span>Reply</span>
                      </button>

                      {(comment.author === userFullName || ['OWNER', 'COORDINATOR', 'ADMIN'].includes(currentUser?.role || '')) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="hover:text-red-600 transition-colors flex items-center gap-1 ml-auto opacity-0 group-hover/comment:opacity-100"
                        >
                          <i className="fa-solid fa-trash-can text-[9px]"></i>
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Input Box */}
                {replyingToId === comment.id && (
                  <div className="ml-7 pl-2.5 border-l-2 border-blue-400 mt-1 flex flex-col gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author}...`}
                      rows={2}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting || !replyText.trim()}
                        onClick={() => handleAddComment(comment.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Threaded Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 pl-3 border-l-2 border-gray-200 space-y-2 mt-1">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="group/reply flex items-start gap-2 bg-white p-2 rounded border border-gray-100">
                        <div
                          className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 shadow-sm"
                          style={{ backgroundColor: getAvatarColor(reply.author) }}
                        >
                          {reply.author.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-[11px] font-bold text-gray-900 truncate">{reply.author}</span>
                            <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase border ${getRoleBadgeStyle(reply.authorRole)}`}>
                              {reply.authorRole}
                            </span>
                            <span className="text-[9px] text-gray-400 ml-auto whitespace-nowrap">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
                            {reply.content}
                          </p>

                          {(reply.author === userFullName || ['OWNER', 'COORDINATOR', 'ADMIN'].includes(currentUser?.role || '')) && (
                            <div className="flex justify-end mt-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(reply.id)}
                                className="text-[9px] text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 font-semibold"
                              >
                                <i className="fa-solid fa-trash-can text-[8px]"></i>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Main Comment Input Form */}
      <div className="mt-2 flex flex-col gap-2">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleAddComment(null);
            }
          }}
          className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#edab30] focus:border-transparent focus:outline-none resize-none bg-white custom-scrollbar"
        />
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleAddComment(null)}
            className={`px-4 py-1.5 bg-[#254245] hover:bg-[#1a2e31] text-white text-xs font-bold rounded-md shadow-sm transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-[#edab30] focus:outline-none ${isSubmitting || !newCommentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <i className="fa-solid fa-paper-plane text-[10px]"></i>
            <span>{isSubmitting ? 'Posting...' : 'Comment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
