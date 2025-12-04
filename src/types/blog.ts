export type Block = 
  | { type: 'text'; content: string }
  | { type: 'header'; content: string; level: 1 | 2 }
  | { type: 'code'; language: string; code: string; filename?: string }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'diagram'; content: React.ReactNode; caption?: string };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  readTime: string;
  content?: Block[] | string;
}
