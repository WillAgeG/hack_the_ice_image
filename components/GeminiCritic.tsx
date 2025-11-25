import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DoodleButton, DoodleCard } from './DoodleComponents';

interface GeminiCriticProps {
  imageData: string | null;
}

export const GeminiCritic: React.FC<GeminiCriticProps> = ({ imageData }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async () => {
    if (!imageData) return;
    if (!process.env.API_KEY) {
      setError("Ой! Ключ API не найден. (API Key missing)");
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imageData.split(',')[1];

      const prompt = `
        Ты дружелюбный и веселый судья детского конкурса рисунков. 
        Посмотри на этот рисунок маскота для форума "Цифровой Алмаз".
        Опиши, что ты видишь, очень весело и с энтузиазмом. 
        Придумай имя этому персонажу.
        Поставь оценку от 1 до 10 (можно с плюсом!).
        Отвечай на русском языке, используй эмодзи.
        Будь кратким, не больше 3-4 предложений.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: prompt }
          ]
        }
      });

      setFeedback(response.text || 'Хм, я потерял дар речи от такой красоты!');
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setError("Ой! Что-то пошло не так с магией. Попробуй еще раз!");
    } finally {
      setLoading(false);
    }
  };

  if (!imageData) return null;

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <DoodleCard className="bg-purple-50" borderColor="border-purple-600" rotate="-rotate-1">
        <h3 className="text-2xl font-bold text-purple-700 mb-4 hand-font text-center">
          ✨ Мнение Магического Кристалла ✨
        </h3>
        
        {!feedback && !loading && !error && (
          <div className="text-center">
            <p className="mb-4 text-lg">Хочешь узнать, что думает искусственный интеллект о твоем шедевре?</p>
            <DoodleButton onClick={getFeedback} className="bg-purple-400 hover:bg-purple-300 border-purple-900">
              Спросить Кристалл 🔮
            </DoodleButton>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-bounce text-4xl mb-2">🤔</div>
            <p className="text-xl hand-font text-purple-600">Кристалл думает...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 font-bold p-4 bg-red-100 rounded-xl border-2 border-red-300">
            {error}
          </div>
        )}

        {feedback && (
          <div className="prose prose-lg max-w-none font-comic text-gray-800 animate-fade-in">
             <div className="whitespace-pre-wrap">{feedback}</div>
          </div>
        )}
      </DoodleCard>
    </div>
  );
};