import { supabase } from '../services/supabaseClient';

/**
 * Tags media assets in Supabase by upserting tags into the media_tags table
 * @param mediaId - The UUID of the media asset
 * @param tags - Array of tag strings to associate with the media
 */
export default async function tagMedia(mediaId: string, tags: string[]): Promise<void> {
  // Do nothing if no tags provided
  if (!tags || tags.length === 0) {
    console.log('No tags provided for media:', mediaId);
    return;
  }

  try {
    // Map tags to the required format for database insertion
    const tagRecords = tags
      .filter(tag => tag.trim().length > 0) // Filter out empty tags
      .map(tag => ({
        media_id: mediaId,
        tag: tag.trim().toLowerCase() // Normalize tags to lowercase
      }));

    if (tagRecords.length === 0) {
      console.log('No valid tags to insert for media:', mediaId);
      return;
    }

    if (!supabase) {
      console.error('Supabase client not available - tags not saved');
      return;
    }

    // Upsert tags into the media_tags table
    const { data, error } = await supabase
      .from('media_tags')
      .upsert(tagRecords, {
        onConflict: 'media_id,tag' // Prevent duplicate tag-media combinations
      });

    if (error) {
      console.error('Error tagging media:', error);
      throw error;
    }

    console.log(`Successfully tagged media ${mediaId} with ${tagRecords.length} tags:`, tags);
  } catch (error) {
    console.error('Failed to tag media:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * // Tag a media asset with multiple tags
 * await tagMedia('my-media-id', ['tango', 'milonga']);
 * 
 * // Tag with event-specific tags
 * await tagMedia('event-photo-id', ['workshop', 'buenos-aires', 'maestros']);
 * 
 * // Handle empty tags gracefully
 * await tagMedia('media-id', []); // Does nothing
 */