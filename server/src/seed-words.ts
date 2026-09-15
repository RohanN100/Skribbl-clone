import { prisma } from "./config/prisma.js";

const words = [
  { word: "elephant", category: "animal" },
  { word: "pizza", category: "food" },
  { word: "computer", category: "technology" },
  { word: "football", category: "sport" },
  { word: "airplane", category: "vehicle" },
  { word: "guitar", category: "music" },
  { word: "house", category: "object" },
  { word: "tree", category: "nature" },
  { word: "sun", category: "nature" },
  { word: "apple", category: "food" },
];

async function seedWords() {
  try {
    await prisma.word.createMany({
      data: words,
    });

    console.log("✅ Words inserted successfully!");
  } catch (error) {
    console.error("❌ Failed to insert words:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedWords();