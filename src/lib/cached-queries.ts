import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export function revalidateCacheTag(tag: string) {
  try {
    (revalidateTag as any)(tag, 'default');
  } catch (e) {
    // ignore outside request context
  }
}

export { revalidatePath };

// ==========================================
// 1. MASTER & CURRICULUM DATA (TTL: 300s)
// ==========================================

export const getCachedSchools = unstable_cache(
  async () => {
    return prisma.schoolEntry.findMany({
      orderBy: [{ name: 'asc' }, { branch: 'asc' }],
    });
  },
  ['schools-list'],
  { tags: ['schools'], revalidate: 300 }
);

export const getCachedSubjects = unstable_cache(
  async () => {
    return prisma.subjectEntry.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  },
  ['subjects-list'],
  { tags: ['subjects'], revalidate: 300 }
);

export const getCachedClasses = unstable_cache(
  async () => {
    return prisma.classEntry.findMany({
      orderBy: { name: 'asc' },
    });
  },
  ['classes-list'],
  { tags: ['classes'], revalidate: 300 }
);

export const getCachedBooks = unstable_cache(
  async () => {
    return prisma.bookEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  ['books-list'],
  { tags: ['books'], revalidate: 300 }
);

export const getCachedChapters = unstable_cache(
  async (book?: string, subject?: string) => {
    const where: any = {};
    if (book) where.book = book;
    if (subject) where.subject = subject;

    return prisma.chapterEntry.findMany({
      where,
      orderBy: { chapterNumber: 'asc' },
    });
  },
  ['chapters-list'],
  { tags: ['chapters'], revalidate: 300 }
);

export const getCachedTopics = unstable_cache(
  async (book?: string, chapterNumber?: number) => {
    const where: any = {};
    if (book) where.book = book;
    if (chapterNumber !== undefined && !isNaN(chapterNumber)) where.chapterNumber = chapterNumber;

    return prisma.topicEntry.findMany({
      where,
      orderBy: { topicNumber: 'asc' },
    });
  },
  ['topics-list'],
  { tags: ['topics'], revalidate: 300 }
);

export const getCachedDataEntries = unstable_cache(
  async () => {
    return prisma.dataEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  ['data-entries-list'],
  { tags: ['dataentries'], revalidate: 180 }
);

// ==========================================
// 2. USER & ACTOR SELECTORS (TTL: 120s)
// ==========================================

export const getCachedTaskUsers = unstable_cache(
  async () => {
    const [allUsers, studentsDb] = await Promise.all([
      prisma.dataentryUser.findMany({
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
        orderBy: { firstName: 'asc' },
      }),
      prisma.student.findMany({
        select: {
          firstName: true,
          secondName: true,
          className: true,
          schoolName: true,
          subjects: true,
        },
      }),
    ]);

    const teachers = allUsers.filter((u) => u.role === 'TEACHER' || u.role === 'COORDINATOR');
    const rawStudents = allUsers.filter((u) => u.role === 'STUDENT');
    const admins = allUsers.filter((u) => u.role === 'OWNER' || u.role === 'ASSISTANT');
    const owners = allUsers.filter((u) => u.role === 'OWNER');

    const students = rawStudents.map((u) => {
      const studentData = studentsDb.find((s) => {
        const uFirst = u.firstName?.trim().toLowerCase() || '';
        const sFirst = s.firstName?.trim().toLowerCase() || '';
        if (uFirst !== sFirst) return false;

        const uLast = (u.lastName || '').trim().toLowerCase();
        const sLast = (s.secondName || '').trim().toLowerCase();

        return uLast === sLast || uLast === '.' || uLast === '';
      });
      return {
        ...u,
        className: studentData?.className || '',
        schoolName: studentData?.schoolName || '',
        subjects: studentData?.subjects || [],
      };
    });

    return { teachers, students, admins, owners };
  },
  ['task-users-list'],
  { tags: ['task-users'], revalidate: 120 }
);

export const getCachedBirdViewStudents = unstable_cache(
  async (isStudentOnly: boolean, firstName?: string, lastName?: string) => {
    if (isStudentOnly && firstName && lastName) {
      return prisma.student.findMany({
        where: {
          status: 'Active',
          firstName,
          secondName: lastName,
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          secondName: true,
          subjects: true,
          className: true,
        },
        orderBy: { firstName: 'asc' },
      });
    }

    return prisma.student.findMany({
      where: { status: 'Active' },
      select: {
        id: true,
        userId: true,
        firstName: true,
        secondName: true,
        subjects: true,
        className: true,
      },
      orderBy: { firstName: 'asc' },
    });
  },
  ['bird-view-students'],
  { tags: ['students', 'task-users', 'bird-view'], revalidate: 120 }
);

// ==========================================
// 3. OPERATIONAL DATA (TTL: 60s)
// ==========================================

export const getCachedBirdViewTasks = unstable_cache(
  async (dateStr: string) => {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.taskEntry.findMany({
      where: {
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        assignee: true,
        subject: true,
        status: true,
        taskType: true,
        book: true,
        chapter: true,
        topic: true,
        exercise: true,
        description: true,
        reporter: true,
        createdBy: true,
        className: true,
        dueDate: true,
        rescheduleCount: true,
        rescheduledFromId: true,
        rescheduledToId: true,
        obtainedMarks: true,
        totalMarks: true,
        images: true,
        comments: {
          where: { parentId: null },
          include: {
            replies: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },
  ['bird-view-tasks-date'],
  { tags: ['tasks', 'bird-view'], revalidate: 60 }
);

export const getCachedBirdViewQueries = unstable_cache(
  async (dateStr: string) => {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.queryEntry.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        studentName: true,
        subject: true,
        status: true,
        images: true,
      },
    });
  },
  ['bird-view-queries-date'],
  { tags: ['queries', 'bird-view'], revalidate: 60 }
);

export const getCachedAttendanceByDate = unstable_cache(
  async (dateStr: string) => {
    return prisma.attendance.findMany({
      where: { date: dateStr },
      select: { userId: true, status: true },
    });
  },
  ['bird-view-attendance-date'],
  { tags: ['attendance', 'bird-view'], revalidate: 60 }
);

export const getCachedTaskComments = unstable_cache(
  async (taskId: number) => {
    return prisma.taskComment.findMany({
      where: { taskId, parentId: null },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
  ['task-comments-by-id'],
  { tags: ['task-comments', 'tasks', 'bird-view'], revalidate: 60 }
);

export const getCachedEmployees = unstable_cache(
  async () => {
    return prisma.employeeRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  ['employees-list'],
  { tags: ['employees'], revalidate: 120 }
);

export const getCachedUsersList = unstable_cache(
  async () => {
    const [students, teachers, admins] = await Promise.all([
      prisma.student.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.admin.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
    return { students, teachers, admins };
  },
  ['users-full-list'],
  { tags: ['users', 'students', 'task-users'], revalidate: 120 }
);
