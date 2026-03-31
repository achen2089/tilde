import fs from "node:fs";
import { encode } from "gpt-tokenizer";

export function countTokens(text: string): number {
  return encode(text).length;
}

export function countTokensFromFile(filePath: string): number {
  const content = fs.readFileSync(filePath, "utf-8");
  return countTokens(content);
}

export function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}
