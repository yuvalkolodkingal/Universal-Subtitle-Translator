export interface SubtitleBlock {
  index: number;
  timestamp: string;
  textLines: string[];
}

/**
 * Parses raw SRT file contents into structured subtitle blocks.
 * Robust implementation handling DOS/UNIX newlines, stripping BOM.
 */
export function parseSRT(text: string): SubtitleBlock[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks: SubtitleBlock[] = [];
  
  // Strip UTF-8 BOM if present
  const cleanText = normalized.startsWith('\uFEFF') ? normalized.slice(1) : normalized;
  
  const rawParts = cleanText.split('\n\n');
  
  for (const part of rawParts) {
    const lines = part.trim().split('\n');
    if (lines.length < 2) continue;
    
    const indexStr = lines[0].trim();
    const timestamp = lines[1].trim();
    
    if (!/^\d+$/.test(indexStr) || !timestamp.includes('-->')) {
      continue;
    }
    
    const index = parseInt(indexStr, 10);
    const textLines = lines.slice(2);
    
    blocks.push({
      index,
      timestamp,
      textLines
    });
  }
  
  return blocks;
}

/**
 * Serializes subtitle blocks back into high-fidelity compliant SRT string format.
 */
export function stringifySRT(blocks: SubtitleBlock[]): string {
  return blocks.map(block => {
    return `${block.index}\n${block.timestamp}\n${block.textLines.join('\n')}`;
  }).join('\n\n');
}
