import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
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

    const { id } = params;
    const { approve } = await request.json();

    let result;
    if (approve) {
      // Approve the hackathon
      result = await sql`
        UPDATE hackathons SET
          approved = true,
          approved_at = CURRENT_TIMESTAMP,
          approved_by = ${session.user.email},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // Unapprove the hackathon
      result = await sql`
        UPDATE hackathons SET
          approved = false,
          approved_at = NULL,
          approved_by = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (result.length === 0) {
      return Response.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return Response.json({
      message: `Hackathon ${approve ? 'approved' : 'unapproved'} successfully`,
      hackathon: result[0]
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    return Response.json(
      { error: 'Failed to update approval status' },
      { status: 500 }
    );
  }
}