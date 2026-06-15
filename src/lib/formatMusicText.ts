function capitalizeWord(word: string): string {
  if (!word) return word;
  const lower = word.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}

export function normalizeMusicText(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map(capitalizeWord)
    .join(" ");
}
