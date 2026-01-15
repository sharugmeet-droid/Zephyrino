
export interface HairstyleSuggestion {
  name: string;
  description: string;
  suitability: string;
}

export interface AnalysisResult {
  faceShape: string;
  suggestions: HairstyleSuggestion[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  SUGGESTIONS = 'SUGGESTIONS',
  TRANSFORMING = 'TRANSFORMING',
  RESULT = 'RESULT'
}
