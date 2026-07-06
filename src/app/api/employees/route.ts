import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OWNER' && session.role !== 'COORDINATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();

    const { 
        firstName, 
        secondName, 
        fatherName, 
        address, 
        firstContact, 
        secondContact, 
        linkedinId, 
        status, 
        gender,
        emailAddress,
        dateOfBirth,
        latestDegree,
        specialization,
        fromDate, 
        toDate, 
        currentlyWorking 
      } = data;

    const employeeRecord = await prisma.employeeRecord.create({
      data: {
        firstName,
        secondName: secondName || null,
        fatherName: fatherName || null,
        address: address || null,
        firstContact,
        secondContact: secondContact || null,
        linkedinId: linkedinId || null,
        status: status || 'Pending',
        gender: gender || 'Male',
        emailAddress: emailAddress || null,
        dateOfBirth: dateOfBirth || null,
        latestDegree: latestDegree || null,
        specialization: specialization || null,
        fromDate: fromDate || null,
        toDate: currentlyWorking ? 'Currently working here' : (toDate || null),
        currentlyWorking: currentlyWorking || false,
      }
    });

    return NextResponse.json(employeeRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee record:', error);
    return NextResponse.json({ error: 'Failed to create employee record', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OWNER' && session.role !== 'COORDINATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const employees = await prisma.employeeRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching employee records:', error);
    return NextResponse.json({ error: 'Failed to fetch employee records', details: error.message }, { status: 500 });
  }
}
