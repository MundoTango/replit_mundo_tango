import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_API_KEY!,
});

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export interface NotionEntry {
  id: string;
  title: string;
  slug: string;
  type: string;
  body: string;
  tags: string[];
  emotionalTone: string;
  visibility: string;
  summary: string;
  imagePrompt: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to extract plain text from Notion rich text
function extractPlainText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(item => item.plain_text || '').join('');
}

// Helper to extract select value
function extractSelect(selectProperty: any): string {
  return selectProperty?.select?.name || '';
}

// Helper to extract multi-select values
function extractMultiSelect(multiSelectProperty: any): string[] {
  if (!multiSelectProperty?.multi_select) return [];
  return multiSelectProperty.multi_select.map((item: any) => item.name);
}

// Demo data for testing while Notion database connection is being established
const demoEntries: NotionEntry[] = [
  {
    id: "demo-1",
    title: "My First Milonga in Buenos Aires",
    slug: "first-milonga-buenos-aires",
    type: "Memory",
    body: "Walking into La Viruta for the first time was like stepping into a different world. The dim lighting, the wooden floors worn smooth by countless dancers, and the sound of a live orquesta típica filling the air. I remember feeling both excited and terrified as I watched the locals navigate the dance floor with such grace and connection.\n\nThe cabeceo tradition was something I had read about but experiencing it firsthand was magical. The subtle nod, the eye contact across the room, the silent invitation to dance. It took me three songs to work up the courage to make eye contact with someone, and when I finally did, the connection was instant.\n\nThat night changed everything for me. It wasn't just about the steps or the music - it was about becoming part of a community that spans the globe, united by this beautiful dance.",
    tags: ["Buenos Aires", "La Viruta", "First Experience", "Milonga", "Cabeceo"],
    emotionalTone: "Joyful",
    visibility: "Public",
    summary: "A transformative first experience at the famous La Viruta milonga in Buenos Aires, discovering the magic of traditional tango culture.",
    imagePrompt: "A dimly lit traditional Argentine milonga with couples dancing tango, warm golden lighting, wooden floors, and musicians playing in the background",
    createdAt: "2024-03-15T20:30:00Z",
    updatedAt: "2024-03-15T20:30:00Z"
  },
  {
    id: "demo-2",
    title: "Tango Festival in Istanbul - East Meets West",
    slug: "tango-festival-istanbul",
    type: "Event",
    body: "The Istanbul Tango Festival was a revelation - watching Turkish dancers interpret Argentine tango with their own cultural flair was mesmerizing. The event took place at the historic Galata Tower, with the Bosphorus providing a stunning backdrop.\n\nWhat struck me most was how tango serves as a universal language. Despite the cultural differences, when the music started, everyone understood. The same passion, the same connection, the same stories being told through movement.\n\nThe highlight was a performance by local artists who had incorporated traditional Turkish instruments into classic tango arrangements. The fusion was unexpected but beautiful, showing how tango continues to evolve while maintaining its essence.",
    tags: ["Istanbul", "Festival", "Cultural Fusion", "Performance", "International"],
    emotionalTone: "Inspiring",
    visibility: "Public",
    summary: "An inspiring international tango festival showcasing the global reach and cultural adaptability of Argentine tango.",
    imagePrompt: "Tango dancers performing at sunset with the Galata Tower and Bosphorus strait in the background, Istanbul skyline visible",
    createdAt: "2024-04-22T16:45:00Z",
    updatedAt: "2024-04-22T16:45:00Z"
  },
  {
    id: "demo-3",
    title: "The Teacher Who Changed My Dance",
    slug: "teacher-changed-my-dance",
    type: "Reflection",
    body: "After three years of dancing, I thought I knew tango. Then I met Maestro Carlos in a small studio in San Telmo. Within the first five minutes of our lesson, he had completely deconstructed everything I thought I knew about connection and embrace.\n\n'Tango is not about steps,' he said in his weathered voice. 'It's about conversation. And right now, you're doing all the talking.' That simple observation changed everything.\n\nHe taught me to listen - not just to the music, but to my partner, to the floor, to the energy in the room. He showed me that technique without emotion is just choreography, but emotion without technique is chaos. The balance between the two is where tango lives.",
    tags: ["Teaching", "San Telmo", "Maestro", "Connection", "Learning"],
    emotionalTone: "Contemplative",
    visibility: "Public",
    summary: "A profound learning experience with a master teacher that transformed understanding of tango fundamentals.",
    imagePrompt: "An elderly Argentine tango maestro teaching in a rustic studio in San Telmo, Buenos Aires, with vintage posters and worn wooden floors",
    createdAt: "2024-05-10T14:20:00Z",
    updatedAt: "2024-05-10T14:20:00Z"
  },
  {
    id: "demo-4",
    title: "Dancing Through Heartbreak",
    slug: "dancing-through-heartbreak",
    type: "Memory",
    body: "Some nights, tango is pure joy. Other nights, it's therapy. This was one of those therapy nights.\n\nI had just gone through a difficult breakup and found myself at the local milonga, not really wanting to dance but needing to be around the music and the community. The first tanda was rough - I couldn't connect, couldn't feel the music, couldn't escape my own thoughts.\n\nThen 'Libertango' started playing, and something shifted. My partner that tanda was an older woman who had clearly seen her share of life's ups and downs. She didn't say a word, but through her embrace, she communicated understanding, support, and hope.\n\nWe danced through my tears, and somehow, by the end of the song, I felt lighter. Tango had done what tango does best - it had helped me process emotions I couldn't put into words.",
    tags: ["Healing", "Community", "Emotional Journey", "Libertango", "Support"],
    emotionalTone: "Melancholic",
    visibility: "Public",
    summary: "Finding solace and healing through tango during a difficult personal time, discovering the therapeutic power of dance.",
    imagePrompt: "A solitary figure dancing tango in subdued lighting, expressing deep emotion through movement, with soft shadows and warm tones",
    createdAt: "2024-06-03T21:15:00Z",
    updatedAt: "2024-06-03T21:15:00Z"
  },
  {
    id: "demo-5",
    title: "Weekend Workshop Intensive Notes",
    slug: "weekend-workshop-notes",
    type: "Note",
    body: "Key learnings from the weekend intensive with María and Roberto:\n\n**Technique Focus:**\n- Weight transfer must be complete before stepping\n- Embrace is about creating a shared axis, not holding\n- Ochos require spiral movement from the ground up\n- Pauses are as important as movement\n\n**Musical Interpretation:**\n- Listen for the singer's phrasing, not just the beat\n- Different orchestras require different movement qualities\n- Silence in the music is an invitation to connect\n- The melody suggests the emotion of the movement\n\n**Partner Connection:**\n- Lead with intention, not force\n- Follow the lead's energy, not their feet\n- Communication happens through the torso\n- Every dance is a new conversation\n\n**Practice Plan:**\n- Daily technique work: 15 minutes\n- Musical analysis: 3 tangos per week\n- Social dancing: minimum 2 milongas per month",
    tags: ["Workshop", "Technique", "Practice", "Musical Interpretation", "Notes"],
    emotionalTone: "Inspiring",
    visibility: "Public",
    summary: "Comprehensive notes from an intensive tango workshop covering technique, musicality, and practice strategies.",
    imagePrompt: "A tango workshop in progress with couples practicing, mirrors on the walls, and instructors demonstrating technique",
    createdAt: "2024-06-20T18:00:00Z",
    updatedAt: "2024-06-20T18:00:00Z"
  }
];

// Fetch all entries from Notion database
export async function getNotionEntries(filters?: {
  visibility?: string;
  type?: string;
  tags?: string[];
  emotionalTone?: string;
}): Promise<NotionEntry[]> {
  // Using demo data to showcase the dynamic website functionality
  console.log("Serving demo Notion entries with filters:", filters);
  
  let filteredEntries = demoEntries;

  // Apply filters
  if (filters?.visibility) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.visibility.toLowerCase() === filters.visibility!.toLowerCase()
    );
  }

  if (filters?.type) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.type.toLowerCase() === filters.type!.toLowerCase()
    );
  }

  if (filters?.emotionalTone) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.emotionalTone.toLowerCase() === filters.emotionalTone!.toLowerCase()
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    filteredEntries = filteredEntries.filter(entry =>
      filters.tags!.some(tag => 
        entry.tags.some(entryTag => 
          entryTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  return filteredEntries;
}

// Get single entry by slug
export async function getNotionEntryBySlug(slug: string): Promise<NotionEntry | null> {
  // For demo purposes, search through demo data
  const entry = demoEntries.find(entry => entry.slug === slug);
  return entry || null;
}

// Get all unique values for filtering
export async function getNotionFilterOptions(): Promise<{
  types: string[];
  tags: string[];
  emotionalTones: string[];
}> {
  try {
    // For demo purposes, extract filter options from demo data
    const types = Array.from(new Set(demoEntries.map(entry => entry.type).filter(Boolean)));
    const tags = Array.from(new Set(demoEntries.flatMap(entry => entry.tags)));
    const emotionalTones = Array.from(new Set(demoEntries.map(entry => entry.emotionalTone).filter(Boolean)));

    return {
      types: types.sort(),
      tags: tags.sort(),
      emotionalTones: emotionalTones.sort(),
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { types: [], tags: [], emotionalTones: [] };
  }
}