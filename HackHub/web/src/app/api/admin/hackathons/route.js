import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await sql`
      SELECT id FROM admins WHERE email = ${session.user.email}
    `;

    if (adminCheck.length === 0) {
      return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Get all hackathons for admin view
    const hackathons = await sql`
      SELECT 
        id, name, description, start_date, end_date, registration_deadline,
        registration_url, website_url, mode, location, min_team_size, 
        max_team_size, total_prizes, themes, organizer_name, organizer_email,
        status, approved, approved_at, approved_by, created_at, updated_at
      FROM hackathons 
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return Response.json(hackathons);
  } catch (error) {
    console.error('Error fetching admin hackathons:', error);
    return Response.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}