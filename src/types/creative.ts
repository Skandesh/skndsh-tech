export type WorkType = 'generative' | 'photography' | 'writing';

export interface CreativeWork {
  slug: string;
  title: string;
  type: WorkType;
  category: string;
  date: string;
  thumbnail: string;
  featured?: boolean;

  // Generative-specific
  interactive?: boolean;
  componentPath?: string;

  // Photography-specific
  images?: string[];

  // Writing-specific
  readTime?: string;

  // MDX content (loaded dynamically)
  content?: string;
}

export interface CreativeManifest {
  works: CreativeWork[];
  generatedAt: string;
}

// Helper type for filtering
export type WorkFilter = WorkType | 'all';
