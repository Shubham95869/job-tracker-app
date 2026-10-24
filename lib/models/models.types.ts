export interface JobApplication {
  id: string;
  company: string;
  position: string;
  location?: string | null;
  status: string;
  notes?: string | null;
  salary?: string | null;
  jobUrl?: string | null;
  order: number;
  columnId?: string;
  tags?: string[];
  description?: string | null;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  jobApplications: JobApplication[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export type BoardOrNull = Board | null;