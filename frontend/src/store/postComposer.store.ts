import { create } from 'zustand';
import type {
  GeneratePostResult,
  Tone,
  PostFormat,
  ScoredRecommendation,
  FileRecord,
  DraftRecord,
} from '@/types';

export type ComposerStep = 'compose' | 'review' | 'done';

export interface ComposerState {
  // Form inputs
  topic: string;
  tone: Tone;
  format: PostFormat;

  // Generation result
  result: GeneratePostResult | null;
  selectedVariationLabel: string | null;
  editedContent: string | null;
  isEditing: boolean;

  // Draft
  currentDraft: DraftRecord | null;

  // Media
  attachedFiles: FileRecord[];
  recommendations: ScoredRecommendation[];
  showAssetPicker: boolean;
  recomNoResultReason: string | null;

  // Loading / error
  generating: boolean;
  regenerating: boolean;
  accepting: boolean;
  saving: boolean;
  error: string | null;

  // Actions
  setTopic: (topic: string) => void;
  setTone: (tone: Tone) => void;
  setFormat: (format: PostFormat) => void;
  setResult: (result: GeneratePostResult | null) => void;
  setSelectedVariation: (label: string | null) => void;
  setEditing: (editing: boolean) => void;
  setEditedContent: (content: string | null) => void;
  setCurrentDraft: (draft: DraftRecord | null) => void;
  setAttachedFiles: (files: FileRecord[]) => void;
  addAttachedFile: (file: FileRecord) => void;
  removeAttachedFile: (fileId: string) => void;
  setRecommendations: (recs: ScoredRecommendation[], noResultReason?: string | null) => void;
  setShowAssetPicker: (show: boolean) => void;
  setGenerating: (v: boolean) => void;
  setRegenerating: (v: boolean) => void;
  setAccepting: (v: boolean) => void;
  setSaving: (v: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const initial: Pick<
  ComposerState,
  | 'topic' | 'tone' | 'format'
  | 'result' | 'selectedVariationLabel' | 'editedContent' | 'isEditing'
  | 'currentDraft'
  | 'attachedFiles' | 'recommendations' | 'showAssetPicker' | 'recomNoResultReason'
  | 'generating' | 'regenerating' | 'accepting' | 'saving' | 'error'
> = {
  topic: '',
  tone: 'professional',
  format: 'short',
  result: null,
  selectedVariationLabel: null,
  editedContent: null,
  isEditing: false,
  currentDraft: null,
  attachedFiles: [],
  recommendations: [],
  showAssetPicker: false,
  recomNoResultReason: null,
  generating: false,
  regenerating: false,
  accepting: false,
  saving: false,
  error: null,
};

export const useComposerStore = create<ComposerState>((set) => ({
  ...initial,

  setTopic: (topic) => set({ topic }),
  setTone: (tone) => set({ tone }),
  setFormat: (format) => set({ format }),
  setResult: (result) =>
    set({
      result,
      selectedVariationLabel: null,
      editedContent: null,
      isEditing: false,
      error: null,
    }),
  setSelectedVariation: (label) => set({ selectedVariationLabel: label }),
  setEditing: (editing) => set({ isEditing: editing }),
  setEditedContent: (content) => set({ editedContent: content }),
  setCurrentDraft: (draft) => set({ currentDraft: draft }),
  setAttachedFiles: (files) => set({ attachedFiles: files }),
  addAttachedFile: (file) =>
    set((s) => ({
      attachedFiles: s.attachedFiles.some((f) => f.id === file.id)
        ? s.attachedFiles
        : [...s.attachedFiles, file],
    })),
  removeAttachedFile: (fileId) =>
    set((s) => ({
      attachedFiles: s.attachedFiles.filter((f) => f.id !== fileId),
    })),
  setRecommendations: (recs, noResultReason = null) =>
    set({ recommendations: recs, recomNoResultReason: noResultReason }),
  setShowAssetPicker: (show) => set({ showAssetPicker: show }),
  setGenerating: (v) => set({ generating: v }),
  setRegenerating: (v) => set({ regenerating: v }),
  setAccepting: (v) => set({ accepting: v }),
  setSaving: (v) => set({ saving: v }),
  setError: (err) => set({ error: err }),

  reset: () => set({ ...initial }),
}));
