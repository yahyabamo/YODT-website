import { VercelRequest, VercelResponse } from '@vercel/node';
import { YoutubeTranscript } from 'youtube-transcript';

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

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return res.status(500).json({ error: 'LOVABLE_API_KEY is not configured on the server' });
    }

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
    
    const systemPrompt = `
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

    // Call AI using Lovable Gateway to match the chat-assistant setup seamlessly
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an educational assistant that strictly outputs JSON format exactly as requested without markdown formatting." },
          { role: "user", content: systemPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return res.status(500).json({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" });
    }

    const aiData = await response.json();
    const text = aiData.choices[0].message.content;

    // Extract JSON array from markdown response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
       throw new Error('Could not parse JSON from AI response');
    }
    
    const questions = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
}
