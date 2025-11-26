export interface Project {
  id: number;
  title: string;
  category: string;
  year: string;
  description: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
