import { prisma } from "../config/prisma.js";

export class WordService {
  async getRandomWord(): Promise<string> {
    const count = await prisma.word.count();

    if (count === 0) {
      throw new Error("No words available");
    }

    const randomIndex = Math.floor(Math.random() * count);

    const word = await prisma.word.findFirst({
      skip: randomIndex,
    });

    if (!word) {
      throw new Error("Could not find a random word");
    }

    return word.word;
  }
}