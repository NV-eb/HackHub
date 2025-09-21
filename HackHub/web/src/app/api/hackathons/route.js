import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const mode = searchParams.get("mode"); // online, offline, all
    const status = searchParams.get("status") || "upcoming";
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    let query = `
      SELECT 
        id, name, description, start_date, end_date, registration_deadline,
        registration_url, website_url, mode, location, min_team_size, 
        max_team_size, total_prizes, themes, organizer_name, status,
        created_at, updated_at
      FROM hackathons 
      WHERE approved = true
    `;

    const params = [];
    let paramCount = 0;

    // Filter by status
    if (status && status !== "all") {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Filter by mode
    if (mode && mode !== "all") {
      paramCount++;
      query += ` AND mode = $${paramCount}`;
      params.push(mode);
    }

    // Search functionality
    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(name) LIKE LOWER($${paramCount})
        OR LOWER(description) LIKE LOWER($${paramCount})
        OR EXISTS (
          SELECT 1 FROM unnest(themes) AS theme 
          WHERE LOWER(theme) LIKE LOWER($${paramCount})
        )
      )`;
      params.push(`%${search}%`);
    }

    // Order by start date (upcoming first)
    query += ` ORDER BY start_date ASC`;

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const hackathons = await sql(query, params);

    return Response.json(hackathons);
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    return Response.json(
      { error: "Failed to fetch hackathons" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      start_date,
      end_date,
      registration_deadline,
      registration_url,
      website_url,
      mode,
      location,
      min_team_size,
      max_team_size,
      total_prizes,
      themes,
      organizer_name,
      organizer_email,
    } = body;

    // Validate required fields
    if (!name || !start_date || !end_date || !mode) {
      return Response.json(
        { error: "Missing required fields: name, start_date, end_date, mode" },
        { status: 400 },
      );
    }

    // Validate mode
    if (!["online", "offline"].includes(mode)) {
      return Response.json(
        { error: 'Mode must be either "online" or "offline"' },
        { status: 400 },
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
      return Response.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO hackathons (
        name, description, start_date, end_date, registration_deadline,
        registration_url, website_url, mode, location, min_team_size,
        max_team_size, total_prizes, themes, organizer_name, organizer_email
      ) VALUES (
        ${name}, ${description}, ${start_date}, ${end_date}, ${registration_deadline},
        ${registration_url}, ${website_url}, ${mode}, ${location}, ${min_team_size || 1},
        ${max_team_size || 6}, ${total_prizes || 0}, ${themes || []}, ${organizer_name}, ${organizer_email}
      )
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating hackathon:", error);
    return Response.json(
      { error: "Failed to create hackathon" },
      { status: 500 },
    );
  }
}
