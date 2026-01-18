import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateWebsite, deleteWebsite, getWebsiteById } from '@/lib/db/queries';
import { syncUserWithDatabase } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user with database and get database user ID
    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const websiteId = params.id;
    const body = await request.json();
    const { name, domain, timezone, localTracking } = body;

    // Check if website belongs to user
    const existingWebsite = await getWebsiteById(websiteId);
    if (!existingWebsite || existingWebsite.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Website not found or access denied' }, { status: 404 });
    }

    const updatedWebsite = await updateWebsite(websiteId, {
      name,
      domain,
      timezone,
      localTracking,
    });

    return NextResponse.json({ website: updatedWebsite[0] });
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user with database and get database user ID
    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const websiteId = params.id;

    // Check if website belongs to user
    const existingWebsite = await getWebsiteById(websiteId);
    if (!existingWebsite || existingWebsite.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Website not found or access denied' }, { status: 404 });
    }

    await deleteWebsite(websiteId);

    return NextResponse.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}