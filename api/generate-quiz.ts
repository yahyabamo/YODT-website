import { VercelRequest, VercelResponse } from '@vercel/node';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Missing videoUrl parameter' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please add it to your environment variables.' });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Extract video ID
    const patterns = [
        /youtu\.be\/([^?&]+)/,
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtube\.com\/embed\/([^?&]+)/,
    ];
    let videoId = '';
    for (const p of patterns) {
        const m = videoUrl.match(p);
        if (m) {
          videoId = m[1];
          break;
        }
    }

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Fetch Transcript
    let transcriptText = '';
    try {
        const transcriptLines = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = transcriptLines.map(t => t.text).join(' ').substring(0, 15000); // Limit context
    } catch (e: any) {
        console.warn("Could not fetch transcript:", e.message);
        return res.status(400).json({ error: 'Could not fetch transcript for this video. Ensure the video has closed captions enabled.' });
    }
    
    const prompt = `
      Based on the following video transcript, generate a multiple-choice quiz in Arabic.
      Generate 5 questions.
      For each question, provide 4 options and specify the exact correct answer.
      Return the output STRICTLY as a JSON array of objects with the following format:
      [
        {
          "question": "Question text here?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Exact text of the correct option"
        }
      ]

      Transcript:
      ${transcriptText}
    `;

    // Call Gemini Free Tier directly
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,
        }
    });

    const text = result.response.text();

    // Extract JSON array from markdown response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
       console.error("AI Response text was:", text);
       throw new Error('Could not parse JSON from AI response');
    }
    
    const questions = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
}
