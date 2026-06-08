export interface CleanMindloomJsonResult {
  cleaned: string;
  changed: boolean;
  notes: string[];
}

function noteChange(notes: string[], note: string): void {
  if (!notes.includes(note)) notes.push(note);
}

export function cleanMindloomJsonInput(input: string): CleanMindloomJsonResult {
  const notes: string[] = [];
  let cleaned = input;

  if (cleaned.charCodeAt(0) === 0xfeff) {
    cleaned = cleaned.slice(1);
    noteChange(notes, 'Removed BOM');
  }

  const trimmed = cleaned.trim();
  if (trimmed !== cleaned) {
    cleaned = trimmed;
    noteChange(notes, 'Trimmed whitespace');
  }

  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
    noteChange(notes, 'Removed markdown code fence');
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace <= lastBrace) {
    if (firstBrace > 0 || lastBrace < cleaned.length - 1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1).trim();
      noteChange(notes, 'Extracted JSON object from surrounding text');
    }
  }

  return {
    cleaned,
    changed: cleaned !== input,
    notes,
  };
}
