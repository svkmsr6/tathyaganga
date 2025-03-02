import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface FactCheckResult {
  score: number;
  explanation: string;
  suggestions: string[];
}

async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage} while maintaining the same tone and meaning. Return only the translated text without any additional context or explanation.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text: " + error.message);
  }
}

export async function factCheck(content: string, language: string = 'en'): Promise<FactCheckResult> {
  try {
    // First, get fact check results in English
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fact-checking expert. Analyze the given content for factual accuracy and provide a score from 0-100, explanation, and suggestions for improvement. Return the results in JSON format."
        },
        {
          role: "user",
          content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const factCheckResult = {
      score: Math.min(100, Math.max(0, result.score)),
      explanation: result.explanation,
      suggestions: result.suggestions,
    };

    // If language is not English, translate the explanation and suggestions
    if (language !== 'en') {
      const translatedExplanation = await translateText(factCheckResult.explanation, language);
      const translatedSuggestions = await Promise.all(
        factCheckResult.suggestions.map(suggestion => translateText(suggestion, language))
      );

      return {
        ...factCheckResult,
        explanation: translatedExplanation,
        suggestions: translatedSuggestions,
      };
    }

    return factCheckResult;
  } catch (error) {
    throw new Error("Failed to perform fact check: " + error.message);
  }
}

export async function suggestImprovements(content: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a content improvement expert. Analyze the given content and suggest improvements for clarity, engagement, and impact. Return an array of suggestions in JSON format."
        },
        {
          role: "user",
          content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions;
  } catch (error) {
    throw new Error("Failed to generate suggestions: " + error.message);
  }
}