import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/tasks/[id]/comments - Fetch all top-level comments & threaded replies for a task
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid Task ID' }, { status: 400 });
    }

    const comments = await prisma.taskComment.findMany({
      where: {
        taskId,
        parentId: null // Top-level comments only
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: error.message }, { status: 500 });
  }
}

// POST /api/tasks/[id]/comments - Post a new comment or nested reply
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid Task ID' }, { status: 400 });
    }

    const body = await request.json();
    const { content, parentId, author, authorRole } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const commentAuthor = author || `${session.firstName} ${session.lastName}`.trim() || session.username;
    const roleVal = (authorRole || session.role || 'STUDENT') as any;

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        content: content.trim(),
        author: commentAuthor,
        authorRole: roleVal,
        parentId: parentId ? parseInt(parentId, 10) : null
      },
      include: {
        replies: true
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to post comment', details: error.message }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]/comments?commentId=XYZ - Delete a comment or reply
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid Task ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const commentIdStr = searchParams.get('commentId');
    if (!commentIdStr) {
      return NextResponse.json({ error: 'Missing commentId parameter' }, { status: 400 });
    }

    const commentId = parseInt(commentIdStr, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const userFullName = `${session.firstName} ${session.lastName}`.trim();
    const isAuthor = comment.author === userFullName || comment.author === session.username;
    const isStaffOrOwner = ['OWNER', 'COORDINATOR', 'ASSISTANT', 'TEACHER'].includes(session.role);

    if (!isAuthor && !isStaffOrOwner) {
      return NextResponse.json({ error: 'Permission denied to delete this comment' }, { status: 403 });
    }

    await prisma.taskComment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ success: true, deletedId: commentId });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment', details: error.message }, { status: 500 });
  }
}
