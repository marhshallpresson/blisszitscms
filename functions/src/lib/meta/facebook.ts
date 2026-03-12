const GRAPH = 'https://graph.facebook.com/v22.0';
const AI_DISCLOSURE = '

— Automated reply'; // Required by Meta Platform Policy

export interface FbPostContent {
  message?: string;      // Max 63,206 chars
  link?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'photo' | 'video';
  scheduledTime?: number; // Unix timestamp (must be 10 min – 30 days ahead)
}

export async function publishToFbPage(
  pageId: string,
  pageToken: string,
  content: FbPostContent
): Promise<{ id: string; postUrl: string }> {
  let endpoint = `${GRAPH}/${pageId}`;
  const body: Record<string, string> = { access_token: pageToken };

  if (content.message) body.message = content.message;
  if (content.link) body.link = content.link;
  if (content.scheduledTime) {
    // Scheduled publishing requires published=false
    body.published = 'false';
    body.scheduled_publish_time = String(content.scheduledTime);
  }

  if (content.mediaType === 'photo' && content.imageUrl) {
    endpoint += '/photos';
    body.url = content.imageUrl;
  } else if (content.mediaType === 'video' && content.videoUrl) {
    endpoint += '/videos';
    body.file_url = content.videoUrl;
    body.description = content.message ?? '';
    delete body.message;
  } else {
    endpoint += '/feed';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(`[FB ${data.error.code}] ${data.error.message}`);
  return { id: data.id, postUrl: `https://facebook.com/${data.id}` };
}

export async function replyToFbComment(
  commentId: string,
  message: string,
  pageToken: string,
  isAiGenerated = false
): Promise<void> {
  const text = isAiGenerated ? `${message}${AI_DISCLOSURE}` : message;
  const res = await fetch(`${GRAPH}/${commentId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: pageToken }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[FB comment reply] ${data.error.message}`);
}

export async function sendMessengerMessage(
  recipientId: string,
  message: string,
  pageToken: string,
  isAiGenerated = false
): Promise<void> {
  const text = isAiGenerated ? `${message}

(Automated reply)` : message;
  await fetch(`${GRAPH}/me/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      access_token: pageToken,
    }),
  });
}

export async function getFbPagePosts(pageId: string, pageToken: string) {
  const fields = [
    'id', 'message', 'story', 'created_time', 'permalink_url',
    'attachments', 'likes.summary(true)', 'comments.summary(true)',
    'shares', 'reactions.summary(true)',
  ].join(',');

  const res = await fetch(`${GRAPH}/${pageId}/feed?fields=${fields}&access_token=${pageToken}`);
  return res.json();
}
