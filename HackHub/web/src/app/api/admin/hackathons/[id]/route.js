import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function DELETE(request, { params }) {
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

    // Delete the hackathon
    const result = await sql`
      DELETE FROM hackathons WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return Response.json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    console.error('Error deleting hackathon:', error);
    return Response.json(
      { error: 'Failed to delete hackathon' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const body = await request.json();
    
    const {
      name, description, start_date, end_date, registration_deadline,
      registration_url, website_url, mode, location, min_team_size,
      max_team_size, total_prizes, themes, organizer_name, organizer_email,
      status
    } = body;

    // Update the hackathon
    const result = await sql`
      UPDATE hackathons SET
        name = ${name},
        description = ${description},
        start_date = ${start_date},
        end_date = ${end_date},
        registration_deadline = ${registration_deadline},
        registration_url = ${registration_url},
        website_url = ${website_url},
        mode = ${mode},
        location = ${location},
        min_team_size = ${min_team_size || 1},
        max_team_size = ${max_team_size || 6},
        total_prizes = ${total_prizes || 0},
        themes = ${themes || []},
        organizer_name = ${organizer_name},
        organizer_email = ${organizer_email},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating hackathon:', error);
    return Response.json(
      { error: 'Failed to update hackathon' },
      { status: 500 }
    );
  }
}