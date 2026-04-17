// ─── Stop Words ───
const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are",
  "aren't","as","at","be","because","been","before","being","below","between","both",
  "but","by","can","can't","cannot","could","couldn't","did","didn't","do","does",
  "doesn't","doing","don't","down","during","each","few","for","from","further","get",
  "got","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll",
  "he's","her","here","here's","hers","herself","him","himself","his","how","how's",
  "i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its",
  "itself","just","let's","me","more","most","mustn't","my","myself","no","nor","not",
  "of","off","on","once","only","or","other","ought","our","ours","ourselves","out",
  "over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't",
  "so","some","such","than","that","that's","the","their","theirs","them","themselves",
  "then","there","there's","these","they","they'd","they'll","they're","they've",
  "this","those","through","to","too","under","until","up","us","very","was","wasn't",
  "we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's",
  "where","where's","which","while","who","who's","whom","why","why's","will","with",
  "won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours",
  "yourself","yourselves","also","however","therefore","although","thus","hence",
  "moreover","furthermore","nevertheless","nonetheless","whereas","whereby","wherein",
  "one","two","three","four","five","six","seven","eight","nine","ten","many","much",
  "may","might","shall","will","would","could","should","must","need","used","like",
  "well","back","even","still","way","take","since","another","know","help","make",
  "first","new","now","look","come","find","give","day","made","use","say","said",
  "see","go","going","thing","things","really","every","using","called","based",
  "often","different","important","example","include","including","includes","within",
  "without","already","following","follows","rather","among","along","around","part",
  "given","specific","refers","refer","due","able","usually","always","never","sometimes",
]);

// ─── Tokenization ───
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// ─── N-gram extraction (bigrams) ───
function extractBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

// ─── Term frequency ───
function termFrequency(terms: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const term of terms) {
    freq.set(term, (freq.get(term) || 0) + 1);
  }
  return freq;
}

// ─── Sentence splitting ───
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

// ─── Key Topic Extraction ───
export interface KeyTopic {
  topic: string;
  frequency: number;
  relevance: number; // 0-100
}

export function extractKeyTopics(text: string): KeyTopic[] {
  const tokens = tokenize(text);
  const totalTokens = tokens.length;
  if (totalTokens === 0) return [];

  // Single word frequencies
  const wordFreq = termFrequency(tokens);

  // Bigram frequencies
  const bigrams = extractBigrams(tokens);
  const bigramFreq = termFrequency(bigrams);

  // Combine: prefer bigrams that appear 2+ times, plus top single words
  const topics: KeyTopic[] = [];

  // Add meaningful bigrams
  for (const [bigram, count] of bigramFreq) {
    if (count >= 2) {
      topics.push({
        topic: bigram,
        frequency: count,
        relevance: Math.min(100, Math.round((count / totalTokens) * 1000)),
      });
    }
  }

  // Add top single words
  for (const [word, count] of wordFreq) {
    if (count >= 2) {
      // Don't add if it's already part of a selected bigram
      const partOfBigram = topics.some((t) => t.topic.includes(word));
      if (!partOfBigram) {
        topics.push({
          topic: word,
          frequency: count,
          relevance: Math.min(100, Math.round((count / totalTokens) * 1000)),
        });
      }
    }
  }

  // Sort by relevance descending, take top 15
  return topics
    .sort((a, b) => b.relevance - a.relevance || b.frequency - a.frequency)
    .slice(0, 15);
}

// ─── Summary Generation (extractive) ───
export function generateSummary(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "No meaningful content found to summarize.";
  if (sentences.length <= 3) return sentences.join(" ");

  const tokens = tokenize(text);
  const wordFreq = termFrequency(tokens);

  // Score each sentence by the sum of its word frequencies
  const scored = sentences.map((sentence, index) => {
    const sTokens = tokenize(sentence);
    const score = sTokens.reduce((sum, t) => sum + (wordFreq.get(t) || 0), 0);
    // Slight boost for earlier sentences (intro often has key info)
    const positionBoost = index < 3 ? 1.2 : 1;
    return { sentence, score: score * positionBoost, index };
  });

  // Pick top sentences (up to 5), maintain original order
  const topCount = Math.min(5, Math.ceil(sentences.length * 0.3));
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topCount)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  return topSentences.join(" ");
}

// ─── Exam Focus Suggestions ───
export interface ExamFocus {
  area: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
}

export function suggestExamFocus(text: string): ExamFocus[] {
  const topics = extractKeyTopics(text);
  const sentences = splitSentences(text);
  const lowerText = text.toLowerCase();

  // Patterns that signal exam-worthy content
  const definitionPatterns = /\b(is defined as|refers to|is known as|means that|is called|is the process of|can be described as)\b/gi;
  const comparisonPatterns = /\b(difference between|compared to|versus|vs\.?|in contrast|on the other hand|unlike|similarities|whereas)\b/gi;
  const listPatterns = /\b(types of|kinds of|categories|steps|stages|phases|principles|characteristics|features|advantages|disadvantages|pros and cons|methods)\b/gi;
  const emphasisPatterns = /\b(important|key|crucial|essential|significant|critical|fundamental|notable|remember|note that|keep in mind)\b/gi;

  const focuses: ExamFocus[] = [];

  // Check for definitions
  const defMatches = lowerText.match(definitionPatterns);
  if (defMatches && defMatches.length > 0) {
    focuses.push({
      area: "Definitions & Terminology",
      reason: `Found ${defMatches.length} definition(s) — common in short-answer and MCQ questions.`,
      priority: "High",
    });
  }

  // Check for comparisons
  const compMatches = lowerText.match(comparisonPatterns);
  if (compMatches && compMatches.length > 0) {
    focuses.push({
      area: "Comparisons & Contrasts",
      reason: `Found ${compMatches.length} comparison(s) — often tested in essay and table-format questions.`,
      priority: "High",
    });
  }

  // Check for lists/enumerations
  const listMatches = lowerText.match(listPatterns);
  if (listMatches && listMatches.length > 0) {
    focuses.push({
      area: "Lists & Classifications",
      reason: `Found ${listMatches.length} enumeration(s) — frequently tested as "list and explain" questions.`,
      priority: "Medium",
    });
  }

  // Check for emphasized content
  const emphMatches = lowerText.match(emphasisPatterns);
  if (emphMatches && emphMatches.length > 0) {
    focuses.push({
      area: "Emphasized Concepts",
      reason: `Found ${emphMatches.length} emphasis marker(s) — authors highlight what they consider most testable.`,
      priority: "High",
    });
  }

  // Top recurring topics as focus areas
  const topTopics = topics.slice(0, 5);
  for (const topic of topTopics) {
    focuses.push({
      area: `Topic: "${topic.topic}"`,
      reason: `Appears ${topic.frequency} time(s) — high-frequency topics are likely exam material.`,
      priority: topic.relevance > 30 ? "High" : topic.relevance > 15 ? "Medium" : "Low",
    });
  }

  // Content length insight
  if (sentences.length > 20) {
    focuses.push({
      area: "Long-form Content Review",
      reason: `${sentences.length} sentences detected — review section headings and opening sentences of each paragraph for quick recall.`,
      priority: "Medium",
    });
  }

  return focuses.sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ─── Full Analysis ───
export interface AnalysisResult {
  keyTopics: KeyTopic[];
  summary: string;
  examFocus: ExamFocus[];
  wordCount: number;
  sentenceCount: number;
}

export function analyzeText(text: string): AnalysisResult {
  const sentences = splitSentences(text);
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  return {
    keyTopics: extractKeyTopics(text),
    summary: generateSummary(text),
    examFocus: suggestExamFocus(text),
    wordCount: words.length,
    sentenceCount: sentences.length,
  };
}
