export const WORDS_PER_TEST = 25;

export function getRandomWords(count: number): string[] {
  const words = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
    "may", "should", "does", "being", "might", "must", "shall", "could", "would", "can",
    "call", "find", "found", "long", "down", "side", "been", "now", "find", "head",
    "stand", "own", "page", "should", "country", "found", "answer", "school", "grow", "study",
    "still", "learn", "plant", "cover", "food", "sun", "four", "between", "state", "keep",
    "eye", "never", "last", "let", "thought", "city", "tree", "cross", "farm", "hard",
    "start", "might", "story", "saw", "far", "sea", "draw", "left", "late", "run",
    "while", "press", "close", "night", "real", "life", "few", "north", "open", "seem",
    "together", "next", "white", "children", "begin", "got", "walk", "example", "ease", "paper",
    "group", "always", "music", "those", "both", "mark", "often", "letter", "until", "mile"
  ];
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const word = words[Math.floor(Math.random() * words.length)];
    if (word) {
      result.push(word);
    }
  }
  return result;
}

export function calculateWPM(correctChars: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  // Standard WPM calculation: (characters / 5) / minutes
  return Math.round((correctChars / 5) / (timeInSeconds / 60));
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

export function splitIntoWordGroups(text: string, wordsPerGroup: number): string[][] {
  // Normalize whitespace: replace all whitespace (newlines, tabs, multiple spaces) with single spaces
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  // Split by space and filter out empty strings
  const words = normalizedText.split(' ').filter(word => word.length > 0);
  
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += wordsPerGroup) {
    groups.push(words.slice(i, i + wordsPerGroup));
  }
  
  return groups.filter(group => group.length > 0);
}
