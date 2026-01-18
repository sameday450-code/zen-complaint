/**
 * ElevenLabs Voice Assistant Integration
 * Handles AI voice calls for complaint submission
 */

import axios from 'axios';
import { ElevenLabsClient, play } from 'elevenlabs';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

/**
 * Generate speech from text using ElevenLabs
 */
export async function textToSpeech(text: string): Promise<Buffer | null> {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ElevenLabs API key not configured');
    return null;
  }

  try {
    const audio = await elevenlabs.generate({
      voice: ELEVENLABS_VOICE_ID,
      text,
      model_id: 'eleven_monolingual_v1',
    });

    // Convert stream to buffer
    const chunks: any[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('❌ ElevenLabs TTS error:', error);
    return null;
  }
}

/**
 * Voice call conversation flow
 */
export const voiceCallScript = {
  greeting: "Hello! Thank you for calling our complaint reporting system. I'm here to help you submit your complaint. This call will be recorded for quality and investigation purposes.",
  
  askStation: "First, please tell me the name or number of the station where the issue occurred.",
  
  askName: "Thank you. May I have your full name please?",
  
  askPhone: "And what is your contact phone number?",
  
  askComplaint: "Please describe your complaint or the issue you experienced. Take your time and be as detailed as possible.",
  
  confirm: "Thank you for providing that information. Your complaint has been recorded and will be reviewed by our team shortly. A reference number will be sent to your phone. Is there anything else you'd like to add?",
  
  closing: "Thank you for contacting us. Your complaint is important to us, and we will investigate this matter promptly. Goodbye.",
};

/**
 * Handle voice call using Twilio (or similar service)
 * This integrates with Twilio's voice API
 */
export async function handleVoiceCall(phoneNumber: string, complaintId: string) {
  // Check if Twilio is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  try {
    // For production, use Twilio SDK to initiate call
    // This is a placeholder for the actual implementation
    const callData = {
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.TWILIO_WEBHOOK_URL}?complaintId=${complaintId}`,
      statusCallback: `${process.env.TWILIO_WEBHOOK_URL}/status`,
      statusCallbackMethod: 'POST',
    };

    // Simulated response - replace with actual Twilio call
    return {
      callSid: `CALL-${Date.now()}`,
      status: 'initiated',
    };
  } catch (error) {
    console.error('❌ Voice call error:', error);
    throw error;
  }
}

/**
 * Process voice complaint transcription and extract structured data
 * Uses AI to parse the transcription and extract complaint details
 */
export async function processVoiceComplaint(transcription: string): Promise<any> {
  // This would typically use OpenAI or similar to extract structured data
  // For now, return basic parsing

  const data: any = {
    transcription,
    customerName: extractName(transcription),
    category: extractCategory(transcription),
    description: transcription,
    stationId: null, // Would need to match station name from transcription
  };

  return data;
}

/**
 * Simple name extraction from transcription
 * In production, use NLP/AI for better extraction
 */
function extractName(text: string): string | null {
  const namePatterns = [
    /my name is ([A-Za-z\s]+)/i,
    /I am ([A-Za-z\s]+)/i,
    /this is ([A-Za-z\s]+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract complaint category from transcription
 */
function extractCategory(text: string): string {
  const categories = {
    'Service Quality': ['service', 'staff', 'employee', 'rude', 'unhelpful'],
    'Cleanliness': ['dirty', 'clean', 'trash', 'smell', 'hygiene'],
    'Safety': ['unsafe', 'danger', 'security', 'theft', 'accident'],
    'Facility': ['broken', 'damaged', 'repair', 'maintenance'],
    'Other': [],
  };

  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }

  return 'General';
}

/**
 * Generate voice response for Twilio TwiML
 */
export function generateTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
  <Gather input="speech" timeout="5" action="/api/voice/gather">
    <Say>Please speak after the tone.</Say>
  </Gather>
</Response>`;
}
