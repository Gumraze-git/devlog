export type DevlogPost = {
  id: number;
  title: string;
  description: string;
  date: string;
  views: number;
};

export const devlogPosts: DevlogPost[] = [];
