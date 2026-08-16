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
// 1. MASTER & CURRICULUM DATA (TTL: 86400s / 24 Hours)
// ==========================================

export const getCachedSchools = unstable_cache(
  async () => {
    return prisma.schoolEntry.findMany({
      orderBy: [{ name: 'asc' }, { branch: 'asc' }],
    });
  },
  ['schools-list'],
  { tags: ['schools'], revalidate: 86400 }
);

export const getCachedSubjects = unstable_cache(
  async () => {
    return prisma.subjectEntry.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  },
  ['subjects-list'],
  { tags: ['subjects'], revalidate: 86400 }
);

export const getCachedClasses = unstable_cache(
  async () => {
    return prisma.classEntry.findMany({
      orderBy: { name: 'asc' },
    });
  },
  ['classes-list'],
  { tags: ['classes'], revalidate: 86400 }
);

export const getCachedBooks = unstable_cache(
  async () => {
    return prisma.bookEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  ['books-list'],
  { tags: ['books'], revalidate: 86400 }
);

export const getCachedChapters = (book?: string, subject?: string) => {
  return unstable_cache(
    async () => {
      const where: any = {};
      if (book) where.book = book;
      if (subject) where.subject = subject;

      return prisma.chapterEntry.findMany({
        where,
        orderBy: { chapterNumber: 'asc' },
      });
    },
    ['chapters-list-v2', book || 'all', subject || 'all'],
    { tags: ['chapters'], revalidate: 86400 }
  )();
};

export const getCachedTopics = (book?: string, chapterNumber?: number) => {
  return unstable_cache(
    async () => {
      const where: any = {};
      if (book) where.book = book;
      if (chapterNumber !== undefined && !isNaN(chapterNumber)) where.chapterNumber = chapterNumber;

      return prisma.topicEntry.findMany({
        where,
        orderBy: { topicNumber: 'asc' },
      });
    },
    ['topics-list-v2', book || 'all', String(chapterNumber ?? 'all')],
    { tags: ['topics'], revalidate: 86400 }
  )();
};

export const getCachedDataEntries = unstable_cache(
  async () => {
    return prisma.dataEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  ['data-entries-list'],
  { tags: ['dataentries'], revalidate: 86400 }
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

export const getCachedBirdViewStudents = (isStudentOnly: boolean, firstName?: string, lastName?: string) => {
  return unstable_cache(
    async () => {
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
    ['bird-view-students-v2', String(isStudentOnly), firstName || '', lastName || ''],
    { tags: ['students', 'task-users', 'bird-view'], revalidate: 120 }
  )();
};

export const getCachedStudentProfile = (firstName: string, lastName: string) => {
  return unstable_cache(
    async () => {
      return prisma.student.findFirst({
        where: {
          firstName,
          secondName: lastName,
        },
        select: {
          id: true,
          userId: true,
          className: true,
          schoolName: true,
          subjects: true,
        },
      });
    },
    ['student-profile-v2', firstName, lastName],
    { tags: ['students', 'users'], revalidate: 120 }
  )();
};

export const getCachedAdminUsers = unstable_cache(
  async () => {
    return prisma.dataentryUser.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },
  ['admin-users-list'],
  { tags: ['users', 'admin-users'], revalidate: 120 }
);

export const getCachedPendingUsers = unstable_cache(
  async () => {
    return prisma.pendingUser.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        contactNumber: true,
        address: true,
        designation: true,
        fatherName: true,
        parentContact1: true,
        parentContact2: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['pending-users-list-v2'],
  { tags: ['pending-users'], revalidate: 60 }
);

// ==========================================
// 3. OPERATIONAL & BIRD VIEW DATA (TTL: 60s)
// ==========================================

export const getCachedBirdViewTasks = (dateStr: string) => {
  return unstable_cache(
    async () => {
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
    ['bird-view-tasks-date-v2', dateStr],
    { tags: ['tasks', 'bird-view'], revalidate: 60 }
  )();
};

export const getCachedBirdViewQueries = (dateStr: string) => {
  return unstable_cache(
    async () => {
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
    ['bird-view-queries-date-v2', dateStr],
    { tags: ['queries', 'bird-view'], revalidate: 60 }
  )();
};

export const getCachedAttendanceByDate = (dateStr: string) => {
  return unstable_cache(
    async () => {
      return prisma.attendance.findMany({
        where: { date: dateStr },
        select: { userId: true, status: true },
      });
    },
    ['bird-view-attendance-date-v2', dateStr],
    { tags: ['attendance', 'bird-view'], revalidate: 60 }
  )();
};

export const getCachedTaskComments = (taskId: number) => {
  return unstable_cache(
    async () => {
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
    ['task-comments-by-id-v2', String(taskId)],
    { tags: ['task-comments', 'tasks', 'bird-view'], revalidate: 60 }
  )();
};

export const getCachedAttendanceGrid = (date: string, role: string) => {
  return unstable_cache(
    async () => {
      let users: any[] = [];

      if (role === 'STUDENT') {
        const students = await prisma.student.findMany({
          where: { userId: { not: null } },
          select: { userId: true, firstName: true, secondName: true, className: true },
        });
        users = students.map((s) => ({
          userId: s.userId,
          name: `${s.firstName} ${s.secondName}`,
          department: s.className || 'N/A',
        }));
      } else if (role === 'TEACHER') {
        const teachers = await prisma.teacher.findMany({
          where: { userId: { not: null } },
          select: { userId: true, firstName: true, secondName: true },
        });
        users = teachers.map((t) => ({
          userId: t.userId,
          name: `${t.firstName} ${t.secondName}`,
          department: 'Teacher',
        }));
      } else if (role === 'COORDINATOR') {
        const admins = await prisma.admin.findMany({
          where: { userId: { not: null } },
          select: { userId: true, firstName: true, secondName: true },
        });
        users = admins.map((a) => ({
          userId: a.userId,
          name: `${a.firstName} ${a.secondName}`,
          department: 'Coordinator',
        }));
      }

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date,
          userId: { in: users.map((u) => u.userId) },
        },
      });

      const enrichedUsers = users.map((user) => {
        const record = attendanceRecords.find((a) => a.userId === user.userId);
        return {
          ...user,
          attendanceId: record?.id || null,
          status: record?.status || 'PRESENT',
          reason: record?.reason || '',
          markedBy: record?.markedBy || null,
          isLocked: record ? record.isLocked : false,
          isConfirmed: record ? record.isConfirmed : false,
        };
      });

      return enrichedUsers;
    },
    ['attendance-grid-date-role-v2', date, role],
    { tags: ['attendance', 'bird-view'], revalidate: 60 }
  )();
};

export const getCachedPendingAttendance = unstable_cache(
  async () => {
    const pendingRecords = await prisma.attendance.findMany({
      where: {
        isLocked: true,
        isConfirmed: false,
      },
      select: {
        date: true,
        userId: true,
      },
    });

    const summary = pendingRecords.reduce((acc: any, record) => {
      if (!acc[record.date]) {
        acc[record.date] = 0;
      }
      acc[record.date]++;
      return acc;
    }, {});

    return Object.keys(summary)
      .map((date) => ({
        date,
        count: summary[date],
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  ['pending-attendance-summary-v2'],
  { tags: ['attendance', 'pending-attendance'], revalidate: 60 }
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

// ==========================================
// 4. USER/ROLE FILTERED QUERIES & TASKS
// ==========================================

export interface TaskFilterParams {
  assignee?: string | null;
  reporter?: string | null;
  subject?: string | null;
  status?: string | null;
  taskType?: string | null;
  createdBy?: string | null;
  className?: string | null;
  dateFilter?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export const getCachedFilteredTasks = (filters: TaskFilterParams, role?: string, userName?: string) => {
  const normalizedKey = JSON.stringify({
    assignee: filters.assignee || '',
    reporter: filters.reporter || '',
    subject: filters.subject || '',
    status: filters.status || '',
    taskType: filters.taskType || '',
    createdBy: filters.createdBy || '',
    className: filters.className || '',
    dateFilter: filters.dateFilter || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    role: role || '',
    userName: userName || '',
  });

  return unstable_cache(
    async () => {
      const whereClause: any = {};

      if (role === 'STUDENT' && userName) {
        whereClause.OR = [{ assignee: userName }, { createdBy: userName }];
      }

      if (filters.assignee) whereClause.assignee = filters.assignee;
      if (filters.reporter) whereClause.reporter = filters.reporter;
      if (filters.subject) whereClause.subject = filters.subject;
      if (filters.status) whereClause.status = filters.status;
      if (filters.taskType) whereClause.taskType = filters.taskType;
      if (filters.createdBy) whereClause.createdBy = filters.createdBy;
      if (filters.className) whereClause.className = filters.className;

      if (filters.startDate || filters.endDate) {
        whereClause.dueDate = {};
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          whereClause.dueDate.gte = start;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          whereClause.dueDate.lte = end;
        }
      } else if (filters.dateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        if (filters.dateFilter === 'today') {
          whereClause.dueDate = { gte: today, lte: endOfToday };
        } else if (filters.dateFilter === 'this_week') {
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          whereClause.dueDate = { gte: lastWeek };
        } else if (filters.dateFilter === 'this_month') {
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          whereClause.dueDate = { gte: lastMonth };
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        whereClause.dueDate = { gte: today, lte: endOfToday };
      }

      const [tasks, statusCounts, typeCounts, studentCounts] = await Promise.all([
        prisma.taskEntry.findMany({
          where: whereClause,
          include: {
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
          orderBy: { dueDate: 'asc' },
        }),
        prisma.taskEntry.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { id: true },
        }),
        prisma.taskEntry.groupBy({
          by: ['taskType'],
          where: whereClause,
          _count: { id: true },
        }),
        prisma.taskEntry.groupBy({
          by: ['assignee'],
          where: whereClause,
          _count: { id: true },
        }),
      ]);

      const analytics = {
        byStatus: statusCounts.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr._count.id }), {}),
        byType: typeCounts.reduce((acc: any, curr) => ({ ...acc, [curr.taskType || 'Unknown']: curr._count.id }), {}),
        byStudent: studentCounts.map((s) => ({
          studentName: s.assignee,
          totalTasks: s._count.id,
        })),
      };

      return { tasks, analytics };
    },
    ['filtered-tasks-v2', normalizedKey],
    {
      tags: ['tasks', `tasks-${role || 'all'}`, ...(userName ? [`tasks-user-${userName}`] : [])],
      revalidate: 60,
    }
  )();
};

export interface QueryFilterParams {
  studentName?: string | null;
  teacherName?: string | null;
  subject?: string | null;
  status?: string | null;
  dateFilter?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
}

export const getCachedFilteredQueries = (filters: QueryFilterParams) => {
  const normalizedKey = JSON.stringify({
    studentName: filters.studentName || '',
    teacherName: filters.teacherName || '',
    subject: filters.subject || '',
    status: filters.status || '',
    dateFilter: filters.dateFilter || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    search: filters.search || '',
  });

  return unstable_cache(
    async () => {
      const whereClause: any = {};

      if (filters.studentName) whereClause.studentName = filters.studentName;
      if (filters.teacherName) whereClause.teacherName = filters.teacherName;
      if (filters.subject) whereClause.subject = filters.subject;
      if (filters.status) whereClause.status = filters.status;
      if (filters.search) {
        whereClause.queryStatement = { contains: filters.search, mode: 'insensitive' };
      }

      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) whereClause.createdAt.lte = new Date(filters.endDate);
      } else if (filters.dateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (filters.dateFilter === 'today') {
          whereClause.createdAt = { gte: today };
        } else if (filters.dateFilter === 'this_week') {
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          whereClause.createdAt = { gte: lastWeek };
        } else if (filters.dateFilter === 'this_month') {
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          whereClause.createdAt = { gte: lastMonth };
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause.createdAt = { gte: today };
      }

      const [queries, statusCounts, subjectCounts] = await Promise.all([
        prisma.queryEntry.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.queryEntry.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { id: true },
        }),
        prisma.queryEntry.groupBy({
          by: ['subject'],
          where: whereClause,
          _count: { id: true },
        }),
      ]);

      const analytics = {
        byStatus: statusCounts.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr._count.id }), {}),
        bySubject: subjectCounts.reduce((acc: any, curr) => ({ ...acc, [curr.subject || 'Unknown']: curr._count.id }), {}),
      };

      return { queries, analytics };
    },
    ['filtered-queries-v2', normalizedKey],
    { tags: ['queries'], revalidate: 60 }
  )();
};
