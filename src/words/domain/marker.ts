const MARKER_RE = /\{\{([^{}]+)\}\}/g;

export interface MarkerParse {
  plain: string;
  highlighted: string;
}

export function parseMarkerSentence(sentence: string): MarkerParse {
  const matches = [...sentence.matchAll(MARKER_RE)];
  if (matches.length !== 1) {
    throw new Error(
      'sentence must contain exactly one {{highlighted}} marker group',
    );
  }
  const highlighted = matches[0][1].trim();
  if (highlighted.length === 0) {
    throw new Error('marker contents cannot be empty');
  }
  const plain = sentence.replace(MARKER_RE, '$1');
  return { plain, highlighted };
}

export function isValidMarkerSentence(sentence: string): boolean {
  try {
    parseMarkerSentence(sentence);
    return true;
  } catch {
    return false;
  }
}
