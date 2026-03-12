const LI_API = 'https://api.linkedin.com/v2';
const LI_MEDIA_API = 'https://api.linkedin.com/media/upload';
const AI_DISCLOSURE = '

[Automated reply]'; // Required disclosure for LinkedIn too

interface LiPostContent {
  text: string;                           // Plain text for the post
  orgUrn?: string;                        // urn:li:organization:12345 (for page posts)
  memberUrn?: string;                     // urn:li:person:ID (for personal posts)
  imageBuffer?: Buffer;                   // Raw binary image data
  imageFilename?: string;
  videoBuffer?: Buffer;
  videoFilename?: string;
  mediaTitle?: string;
  mediaDescription?: string;
}

/**
 * Step 1: Register the upload with LinkedIn to get upload URL + asset URN
 */
async function registerMediaUpload(
  accessToken: string,
  ownerUrn: string,
  mediaType: 'IMAGE' | 'VIDEO'
): Promise<{ uploadUrl: string; assetUrn: string }> {
  const recipe = mediaType === 'IMAGE'
    ? 'urn:li:digitalmediaRecipe:feedshare-image'
    : 'urn:li:digitalmediaRecipe:feedshare-video';

  const res = await fetch(`${LI_API}/assets?action=registerUpload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: [recipe],
        owner: ownerUrn,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  const data = await res.json();
  if (data.status && data.status !== 200) {
    throw new Error(`[LI registerUpload] ${data.message || JSON.stringify(data)}`);
  }

  const uploadUrl = data.value?.uploadMechanism?.[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ]?.uploadUrl;
  const assetUrn = data.value?.asset;

  if (!uploadUrl || !assetUrn) throw new Error('[LI] Failed to get upload URL or asset URN');
  return { uploadUrl, assetUrn };
}

/**
 * Step 2: Upload raw binary data to LinkedIn's temporary upload URL
 * NOTE: This is a raw binary PUT — not JSON
 */
async function uploadBinaryToLinkedIn(
  uploadUrl: string,
  accessToken: string,
  data: Buffer,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,   // Required even on the upload URL
      'Content-Type': contentType,
    },
    body: data,
  });
  if (!res.ok) {
    throw new Error(`[LI upload] HTTP ${res.status}: ${await res.text()}`);
  }
}

/**
 * Step 3: Create the post using the permanent asset URN from Step 1
 */
export async function publishToLinkedIn(
  accessToken: string,
  content: LiPostContent
): Promise<{ postUrn: string; postUrl: string }> {
  const authorUrn = content.orgUrn ?? content.memberUrn!;
  if (!authorUrn) throw new Error('[LI] Must provide orgUrn or memberUrn');

  let shareMedia: any[] = [];

  // Handle image upload (Register → Upload → Reference)
  if (content.imageBuffer) {
    const { uploadUrl, assetUrn } = await registerMediaUpload(accessToken, authorUrn, 'IMAGE');
    await uploadBinaryToLinkedIn(uploadUrl, accessToken, content.imageBuffer, 'image/jpeg');
    shareMedia.push({
      status: 'READY',
      description: { text: content.mediaDescription ?? '' },
      media: assetUrn,
      title: { text: content.mediaTitle ?? '' },
    });
  }

  // Handle video upload
  if (content.videoBuffer) {
    const { uploadUrl, assetUrn } = await registerMediaUpload(accessToken, authorUrn, 'VIDEO');
    await uploadBinaryToLinkedIn(uploadUrl, accessToken, content.videoBuffer, 'video/mp4');
    shareMedia.push({
      status: 'READY',
      media: assetUrn,
      title: { text: content.mediaTitle ?? '' },
    });
  }

  // Build the Unified Posts API payload
  const postBody: Record<string, any> = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content.text },
        shareMediaCategory: shareMedia.length > 0
          ? (content.videoBuffer ? 'VIDEO' : 'IMAGE')
          : 'NONE',
        ...(shareMedia.length > 0 ? { media: shareMedia } : {}),
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch(`${LI_API}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  const postUrn = res.headers.get('x-restli-id');
  if (!postUrn) {
    const errBody = await res.json();
    throw new Error(`[LI post] ${errBody.message || JSON.stringify(errBody)}`);
  }

  const orgId = authorUrn.split(':').pop();
  return {
    postUrn,
    postUrl: `https://www.linkedin.com/company/${orgId}/posts/`,
  };
}

/**
 * Reply to a LinkedIn comment
 * NOTE: LinkedIn AI replies MUST have human approval — enforced in the AI worker
 */
export async function replyToLinkedInComment(
  parentCommentUrn: string,
  accessToken: string,
  text: string,
  actorUrn: string,
  isAiGenerated = false
): Promise<void> {
  if (isAiGenerated) {
    throw new Error(
      'LinkedIn AI replies must go through human approval — use suggestLinkedInReply instead'
    );
  }

  // Encode URN for URL path
  const encodedUrn = encodeURIComponent(parentCommentUrn);

  await fetch(`${LI_API}/socialActions/${encodedUrn}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      actor: actorUrn,
      message: { text },
    }),
  });
}

/**
 * Fetch comments for a LinkedIn post (for inbox display)
 */
export async function getLinkedInComments(
  ugcPostUrn: string,
  accessToken: string
): Promise<any[]> {
  const encoded = encodeURIComponent(ugcPostUrn);
  const res = await fetch(`${LI_API}/socialActions/${encoded}/comments?count=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  const data = await res.json();
  return data.elements ?? [];
}

/**
 * Fetch analytics for a LinkedIn org post
 */
export async function getLinkedInPostAnalytics(
  orgUrn: string,
  accessToken: string
): Promise<any> {
  const encoded = encodeURIComponent(orgUrn);
  const res = await fetch(
    `${LI_API}/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encoded}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );
  return res.json();
}
