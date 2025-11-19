export type EducationItem = {
  id: number;
  type: "education" | "certification";
  name: string;
  organization: string;
  period: string;
  details?: string[];
};

export const educationItems: EducationItem[] = [];
