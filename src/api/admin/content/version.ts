import { cloudflareDb } from '@/lib/cloudflare';
import { getAuth } from '@clerk/clerk-react';

/**
 * Create a new content version
 */
export async function createContentVersion(
  contentId: string,
  version: {
    title: string;
    content: string;
    contentBlocks?: any[];
    metadata?: Record<string, any>;
  },
  accessToken: string
) {
  const { userId } = getAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the latest version number
  const versionsResult = await cloudflareDb.prepare(`
    SELECT version FROM content_revisions 
    WHERE content_id = ? 
    ORDER BY version DESC 
    LIMIT 1
  `).bind(contentId).first();

  const nextVersion = versionsResult?.version ? versionsResult.version + 1 : 1;

  // Create new version
  const result = await cloudflareDb.prepare(`
    INSERT INTO content_revisions (
      content_id, version, title, content, content_blocks, metadata, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    contentId,
    nextVersion,
    version.title,
    version.content,
    JSON.stringify(version.contentBlocks || []),
    JSON.stringify(version.metadata || {}),
    userId
  ).run();

  if (!result.success) {
    throw new Error('Failed to create version');
  }

  return { version: nextVersion };
}

/**
 * Get content version history
 */
export async function getContentVersions(contentId: string) {
  const versionsResult = await cloudflareDb.prepare(`
    SELECT 
      id,
      version,
      title,
      created_by,
      created_at,
      metadata
    FROM content_revisions
    WHERE content_id = ?
    ORDER BY version DESC
  `).bind(contentId).all();

  if (!versionsResult.results) {
    throw new Error('Failed to get versions');
  }

  return versionsResult.results.map((version: any) => ({
    ...version,
    metadata: version.metadata ? JSON.parse(version.metadata) : {}
  }));
}

/**
 * Get specific content version
 */
export async function getContentVersion(contentId: string, version: number) {
  const versionResult = await cloudflareDb.prepare(`
    SELECT * FROM content_revisions 
    WHERE content_id = ? AND version = ?
  `).bind(contentId, version).first();

  if (!versionResult) {
    throw new Error('Failed to get version');
  }

  return {
    ...versionResult,
    content_blocks: versionResult.content_blocks ? JSON.parse(versionResult.content_blocks) : [],
    metadata: versionResult.metadata ? JSON.parse(versionResult.metadata) : {}
  };
}

/**
 * Restore content to specific version
 */
export async function restoreContentVersion(
  contentId: string, 
  version: number,
  accessToken: string
) {
  // Get version data
  const versionData = await getContentVersion(contentId, version);

  // Update content with version data
  const result = await cloudflareDb.prepare(`
    UPDATE content SET
      title = ?,
      content = ?,
      content_blocks = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    versionData.title,
    versionData.content,
    JSON.stringify(versionData.content_blocks || []),
    contentId
  ).run();

  if (!result.success) {
    throw new Error('Failed to restore version');
  }

  // Create new version to track the restore
  await createContentVersion(
    contentId,
    {
      title: versionData.title,
      content: versionData.content,
      contentBlocks: versionData.content_blocks,
      metadata: {
        ...versionData.metadata,
        restoredFromVersion: version
      }
    },
    accessToken
  );
}
