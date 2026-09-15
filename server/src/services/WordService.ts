import { prisma } from "../config/prisma.js";

const DEFAULT_WORDS = [
  "elephant", "pizza", "computer", "football", "airplane",
  "guitar", "house", "tree", "sun", "apple", "cat", "dog",
  "car", "rainbow", "rocket", "pencil", "star", "flower",
  "snowflake", "burger", "camera", "clock", "laptop", "spider",
  "cake", "cloud", "moon", "bridge", "robot", "castle",
  "dragon", "pirate", "banana", "coffee", "piano", "bicycle",
  "umbrella", "key", "fire", "ice", "book", "glasses",
  "penguin", "pyramid", "telephone", "volcano", "sandwich"
];

export class WordService {
  async getRandomWord(): Promise<string> {
    try {
      const count = await prisma.word.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        const word = await prisma.word.findFirst({
          skip: randomIndex,
        });
        if (word && word.word) {
          return word.word;
        }
      } else {
        // Try auto-seeding if words table is empty
        try {
          await prisma.word.createMany({
            data: DEFAULT_WORDS.map((w) => ({ word: w, category: "general" })),
            skipDuplicates: true,
          });
        } catch (seedErr) {
          console.warn("⚠️ Could not auto-seed words into DB:", seedErr);
        }
      }
    } catch (error) {
      console.warn("⚠️ Database word lookup failed, falling back to default word list:", error);
    }

    // Always fallback to a random default word so game start NEVER fails
    const randomIndex = Math.floor(Math.random() * DEFAULT_WORDS.length);
    return DEFAULT_WORDS[randomIndex];
  }
}