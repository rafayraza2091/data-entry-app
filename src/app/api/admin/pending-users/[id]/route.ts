import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: Decline pending user (Updates status to DECLINED)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const updated = await prisma.pendingUser.update({ 
      where: { id },
      data: { status: 'DECLINED', resolvedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: 'User declined.', user: updated });
  } catch (error) {
    console.error('Error declining user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update pending user info (Owner editing the user before approval)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await request.json();
    
    // Allow updating various fields
    const updatedUser = await prisma.pendingUser.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        contactNumber: body.contactNumber,
        address: body.address,
        designation: body.designation,
        fatherName: body.fatherName,
        parentContact1: body.parentContact1,
        parentContact2: body.parentContact2,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating pending user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Approve pending user (Create DataentryUser + Profile, update status)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const pendingUser = await prisma.pendingUser.findUnique({ where: { id } });
    if (!pendingUser) return NextResponse.json({ error: 'Pending user not found' }, { status: 404 });
    
    if (pendingUser.status === 'APPROVED') {
        return NextResponse.json({ error: 'User is already approved' }, { status: 400 });
    }

    // Determine Role based on designation
    let role = 'STUDENT';
    if (pendingUser.designation === 'teacher') role = 'TEACHER';
    if (pendingUser.designation === 'admin') role = 'COORDINATOR'; // Admin role

    // Start transaction to ensure everything creates successfully
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create DataentryUser
      const newUser = await tx.dataentryUser.create({
        data: {
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          username: pendingUser.username,
          password: pendingUser.password, // already hashed
          role: role as any,
        },
      });

      const baseProfileData = {
        userId: newUser.id,
        firstName: pendingUser.firstName,
        secondName: pendingUser.lastName,
        address: pendingUser.address,
        mobileNumber: pendingUser.contactNumber,
        email: pendingUser.email,
        fatherName: pendingUser.fatherName,
        parentContact1: pendingUser.parentContact1,
        parentContact2: pendingUser.parentContact2,
      };

      // 2. Create associated profile based on designation
      if (pendingUser.designation === 'student') {
        await tx.student.create({
          data: {
            ...baseProfileData,
            className: "N/A",
            schoolName: "N/A",
          }
        });
      } else if (pendingUser.designation === 'teacher') {
        await tx.teacher.create({ data: baseProfileData });
      } else if (pendingUser.designation === 'admin') {
        await tx.admin.create({ data: baseProfileData });
      }

      // 3. Update the pending user status to APPROVED
      const updatedPending = await tx.pendingUser.update({ 
          where: { id },
          data: { status: 'APPROVED', resolvedAt: new Date() }
      });

      return updatedPending;
    });

    return NextResponse.json({ success: true, message: 'User approved and fully created.', user: result });
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
