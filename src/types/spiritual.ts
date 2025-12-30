export type SpiritualCategory = 'reflection' | 'practice' | 'philosophy';

export interface SpiritualPost {
  slug: string;
  title: string;
  subtitle?: string;
  category: SpiritualCategory;
  date: string;
  readTime: string;
  featured?: boolean;
}

export interface SpiritualManifest {
  posts: SpiritualPost[];
  generatedAt: string;
}
