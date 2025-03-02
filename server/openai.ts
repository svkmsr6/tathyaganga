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

const languageMap = {
  'hi': 'Hindi',
  'bn': 'Bengali',
  'kn': 'Kannada',
  'en': 'English'
};

async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Map the language code to full language name
    const languageName = languageMap[targetLanguage as keyof typeof languageMap] || targetLanguage;

    console.log(`Attempting to translate text to ${languageName}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${languageName} while maintaining the same tone and meaning. Return only the translated text without any additional context or explanation.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const translatedText = response.choices[0].message.content;
    if (!translatedText) {
      console.error("Translation returned empty response");
      throw new Error("service unavailable");
    }

    console.log(`Successfully translated text to ${languageName}`);
    return translatedText;
  } catch (error: any) {
    console.error(`Translation error for language ${targetLanguage}:`, error);
    if (error.code === 'ECONNREFUSED' || error.message?.includes('network') || error.message?.includes('timeout')) {
      throw new Error("network error");
    }
    throw new Error("service unavailable");
  }
}

export async function factCheck(content: string, language: string = 'en'): Promise<FactCheckResult> {
  try {
    console.log(`Starting fact check in language: ${language}`);

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

    const result = JSON.parse(response.choices[0].message.content || '{}');
    if (!result.score || !result.explanation) {
      console.error("Fact check returned invalid response:", result);
      throw new Error("service unavailable");
    }

    const factCheckResult = {
      score: Math.min(100, Math.max(0, result.score)),
      explanation: result.explanation,
      suggestions: result.suggestions || [],
    };

    // If language is not English, translate the response
    if (language !== 'en' && languageMap[language as keyof typeof languageMap]) {
      try {
        console.log(`Starting translation to ${language}`);

        // Translate explanation
        const translatedExplanation = await translateText(factCheckResult.explanation, language);

        // Translate suggestions
        const translatedSuggestions = await Promise.all(
          factCheckResult.suggestions.map(async (suggestion: string) => {
            return await translateText(suggestion, language);
          })
        );

        console.log(`Successfully completed translation to ${language}`);

        return {
          ...factCheckResult,
          explanation: translatedExplanation,
          suggestions: translatedSuggestions,
        };
      } catch (error: any) {
        console.error(`Failed to translate fact check results to ${language}:`, error);
        // Re-throw with appropriate error type
        if (error.message === 'network error') {
          throw new Error("network error");
        }
        throw new Error("service unavailable");
      }
    }

    return factCheckResult;
  } catch (error: any) {
    console.error("Fact check error:", error);
    // Ensure consistent error messages
    if (error.code === 'ECONNREFUSED' || error.message?.includes('network') || error.message?.includes('timeout')) {
      throw new Error("network error");
    }
    throw new Error("service unavailable");
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

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.suggestions || [];
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error("Failed to generate suggestions: " + err.message);
  }
}