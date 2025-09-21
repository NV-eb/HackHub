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

    // Get stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE approved = false) as pending,
        COUNT(*) FILTER (WHERE approved = true) as approved,
        COUNT(*) FILTER (WHERE status = 'ongoing') as ongoing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM hackathons
    `;

    return Response.json({
      total: parseInt(stats[0].total),
      pending: parseInt(stats[0].pending),
      approved: parseInt(stats[0].approved),
      ongoing: parseInt(stats[0].ongoing),
      completed: parseInt(stats[0].completed)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return Response.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}