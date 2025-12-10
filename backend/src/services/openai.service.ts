import OpenAI from 'openai';
import logger from '../utils/logger';

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const streamMessageSuggestion = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: any) => void
) => {
    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or gpt-4 depending on preference/availability
            messages: [
                { role: 'system', content: 'You are a helpful assistant assisting with drafting a message.' },
                { role: 'user', content: prompt }
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                onChunk(content);
            }
        }
        onComplete();
    } catch (error) {
        logger.error(`OpenAI Error: ${error}`);
        onError(error);
    }
};
