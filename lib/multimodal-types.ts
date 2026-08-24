/**
 * Types for multimodal communication analysis
 * Combines text, voice/tone, and contextual information
 */

export interface VoiceMetadata {
  audioUrl?: string;
  transcription: string;
  detectedTone?: 'sarcastic' | 'angry' | 'excited' | 'sad' | 'neutral' | 'confused' | 'happy';
  pace?: 'slow' | 'normal' | 'fast';
  volume?: 'quiet' | 'normal' | 'loud';
}

export interface SocialContext {
  relationship: 'friend' | 'family' | 'teacher' | 'coworker' | 'boss' | 'stranger' | 'group';
  setting: 'school' | 'work' | 'home' | 'public' | 'online' | 'other';
  conversationHistory?: string[];
  emotionalCues?: string[]; // e.g., "smiling", "avoiding eye contact", "looking away"
  recentEvents?: string; // any relevant context about recent events
}

export interface MultimodalInput {
  text: string;
  voice?: VoiceMetadata;
  context?: SocialContext;
  userObservations?: string; // What the user noticed that confused them
}

export interface MultimodalAnalysis {
  literalMeaning: string;
  probableIntention: string;
  toneAndEmotionalContext: string;
  whyItsMayBeConfusing: string;
  suggestedResponses?: string[];
  hiddenSocialRules?: string[];
  potentialMisunderstandings?: string[];
}
