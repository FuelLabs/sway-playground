/**
 * Removes code blocks and common prefixes from AI-generated content
 */
export function removeCodeBlocks(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/Here's the corrected code:?/gi, "")
    .replace(/Here's the fixed code:?/gi, "")
    .replace(/Here's the code:?/gi, "")
    .replace(/Here's the contract:?/gi, "")
    .replace(/Fixed code:?/gi, "")
    .replace(/Corrected code:?/gi, "")
    .replace(/Generated code:?/gi, "")
    .replace(/Contract code:?/gi, "")
    .trim();
}
