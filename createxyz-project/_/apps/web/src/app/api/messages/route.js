import sql from "@/app/api/utils/sql";

// Get all messages
export async function GET() {
  try {
    const messages = await sql`
      SELECT id, content, anonymous_name, created_at 
      FROM messages 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    
    return Response.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Create a new message
export async function POST(request) {
  try {
    const { content, anonymousName } = await request.json();
    
    if (!content || !content.trim()) {
      return Response.json({ error: 'Message content is required' }, { status: 400 });
    }
    
    if (!anonymousName || !anonymousName.trim()) {
      return Response.json({ error: 'Anonymous name is required' }, { status: 400 });
    }
    
    const [message] = await sql`
      INSERT INTO messages (content, anonymous_name)
      VALUES (${content.trim()}, ${anonymousName.trim()})
      RETURNING id, content, anonymous_name, created_at
    `;
    
    return Response.json({ message });
  } catch (error) {
    console.error('Error creating message:', error);
    return Response.json({ error: 'Failed to create message' }, { status: 500 });
  }
}