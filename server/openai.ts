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

const languagePrompts = {
  'en': {
    system: "You are a fact-checking expert. Analyze the given content for factual accuracy and provide a score from 0-100, explanation, and suggestions for improvement. Return the results in JSON format with 'score', 'explanation', and 'suggestions' fields.",
    language: "English"
  },
  'hi': {
    system: "आप एक तथ्य-जांच विशेषज्ञ हैं। दिए गए सामग्री की तथ्यात्मक सटीकता का विश्लेषण करें और 0-100 का स्कोर, व्याख्या, और सुधार के सुझाव प्रदान करें। कृपया हिंदी में जवाब दें। परिणाम JSON प्रारूप में 'score', 'explanation', और 'suggestions' फ़ील्ड के साथ वापस करें।",
    language: "Hindi"
  },
  'bn': {
    system: "আপনি একজন তথ্য-যাচাই বিশেষজ্ঞ। প্রদত্ত বিষয়বস্তুর তথ্যগত নির্ভুলতা বিশ্লেষণ করুন এবং 0-100 এর মধ্যে স্কোর, ব্যাখ্যা এবং উন্নতির জন্য পরামর্শ প্রদান করুন। অনুগ্রহ করে বাংলায় উত্তর দিন। ফলাফল JSON ফরম্যাটে 'score', 'explanation', এবং 'suggestions' ফিল্ড সহ প্রদান করুন।",
    language: "Bengali"
  },
  'kn': {
    system: "ನೀವು ಒಬ್ಬ ವಾಸ್ತವ-ಪರಿಶೀಲನಾ ತಜ್ಞರಾಗಿದ್ದೀರಿ। ನೀಡಲಾದ ವಿಷಯದ ವಾಸ್ತವಿಕ ನಿಖರತೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು 0-100 ಅಂಕಗಳನ್ನು, ವಿವರಣೆ ಮತ್ತು ಸುಧಾರಣೆಗಾಗಿ ಸಲಹೆಗಳನ್ನು ನೀಡಿ। ದಯವಿಟ್ಟು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ। ಫಲಿತಾಂಶಗಳನ್ನು JSON ಫಾರ್ಮ್ಯಾಟ್‌ನಲ್ಲಿ 'score', 'explanation', ಮತ್ತು 'suggestions' ಫೀಲ್ಡ್‌ಗಳೊಂದಿಗೆ ಹಿಂತಿರುಗಿಸಿ।",
    language: "Kannada"
  }
};

export async function factCheck(content: string, language: string = 'en'): Promise<FactCheckResult> {
  try {
    console.log(`Starting fact check in language: ${language}`);

    // Use default English if language not supported
    const promptConfig = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;

    console.log(`Using ${promptConfig.language} for fact checking`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: promptConfig.system + ` Please ensure your response is in ${promptConfig.language} language.`
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

    return {
      score: Math.min(100, Math.max(0, result.score)),
      explanation: result.explanation,
      suggestions: result.suggestions || [],
    };
  } catch (error: any) {
    console.error("Fact check error:", error);
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