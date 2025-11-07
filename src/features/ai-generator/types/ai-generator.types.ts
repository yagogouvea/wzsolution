// Tipos para o AI Generator

export interface ProjectPrompt {
  description: string;
  projectType: 'mobile-app' | 'website' | 'web-app' | 'saas' | 'system' | 'other';
  complexity?: 'low' | 'medium' | 'high';
  budget?: string;
  timeline?: string;
}

export interface ProjectAnalysis {
  title: string;
  description: string;
  features: string[];
  userTypes: string[];
  complexity: 'low' | 'medium' | 'high';
  category: string;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  additional: string[];
}

export interface ProjectEstimate {
  timeWeeks: number;
  timeDays: number;
  cost: {
    min: number;
    max: number;
    currency: string;
  };
  team: string[];
  phases: string[];
}

export interface Wireframe {
  screen: string;
  description: string;
  imageUrl?: string;
  elements: string[];
}

export interface TemplateResult {
  id: string;
  timestamp: string;
  prompt: ProjectPrompt;
  analysis: ProjectAnalysis;
  wireframes: Wireframe[];
  techStack: TechStack;
  estimate: ProjectEstimate;
  additionalNotes?: string[];
}

export interface GenerationStatus {
  step: 'analyzing' | 'generating-wireframes' | 'calculating-estimate' | 'completed' | 'error';
  progress: number;
  message: string;
}

export interface AIGeneratorState {
  isGenerating: boolean;
  status: GenerationStatus;
  result: TemplateResult | null;
  error: string | null;
}








