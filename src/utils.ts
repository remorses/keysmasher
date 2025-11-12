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
  // Remove emojis and other non-ASCII characters (except basic punctuation)
  // This regex removes emojis, symbols, and other special Unicode characters
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F200}-\u{1F251}]|[\u{00A9}\u{00AE}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}-\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267E}-\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26A7}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;
  
  let cleanedText = text.replace(emojiRegex, '');
  
  // Normalize whitespace: replace all whitespace (newlines, tabs, multiple spaces) with single spaces
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  // Split by space and filter out empty strings
  const words = cleanedText.split(' ').filter(word => word.length > 0);
  
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += wordsPerGroup) {
    groups.push(words.slice(i, i + wordsPerGroup));
  }
  
  return groups.filter(group => group.length > 0);
}
