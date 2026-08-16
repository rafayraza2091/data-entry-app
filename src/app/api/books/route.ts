import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedBooks, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check for duplicate entry (same title, className, subject, and school)
    const existingBook = await prisma.bookEntry.findFirst({
      where: {
        title: { equals: data.title },
        className: { equals: data.className },
        subject: { equals: data.subject },
        school: { equals: data.school }
      }
    });

    if (existingBook) {
      return NextResponse.json({ error: 'Book already exists for this class, subject, and school' }, { status: 409 });
    }

    const newBook = await prisma.bookEntry.create({
      data: {
        title: data.title,
        className: data.className,
        subject: data.subject,
        edition: data.edition || null,
        publisher: data.publisher || null,
        school: data.school,
      },
    });

    // Invalidate cache immediately
    revalidateCacheTag('books');
    revalidatePath('/book');
    revalidatePath('/view-data');

    return NextResponse.json(newBook, { status: 201 });
  } catch (error: any) {
    console.error('Error creating book entry:', error);
    return NextResponse.json({ error: 'Failed to create book', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const books = await getCachedBooks();
    return NextResponse.json(books, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch books', details: error.message }, { status: 500 });
  }
}
