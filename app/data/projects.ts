export type Project = {
  id: number;
  title: string;
  summary: string;
  period: string;
  members: string;
  stack: string[];
  highlights: string[];
};

export const projects: Project[] = [];
