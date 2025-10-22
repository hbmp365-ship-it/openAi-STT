import express from 'express'
import multer from 'multer'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const upload = multer({ dest: 'uploads/' })

// CORS 설정
app.use(cors())
app.use(express.json())

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
})

// 업로드 디렉토리 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// STT (Speech-to-Text) 엔드포인트
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '오디오 파일이 필요합니다.' })
    }

    console.log('Processing audio file:', req.file.filename)

    // OpenAI Whisper API를 사용하여 음성을 텍스트로 변환
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'ko', // 한국어 설정
      response_format: 'json'
    })

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path)

    console.log('Transcription result:', transcription.text)

    res.json({
      success: true,
      transcription: transcription.text
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    // 임시 파일이 있다면 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      error: '음성 처리 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

// TTS (Text-to-Speech) 엔드포인트 (선택사항)
app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: '텍스트가 필요합니다.' })
    }

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    })
    
    res.send(buffer)

  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({
      success: false,
      error: 'TTS 처리 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

// GPT 챗봇 엔드포인트
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다.' })
    }

    const messages = [
      {
        role: 'system',
        content: '당신은 골프장 예약을 도와주는 친절한 AI 어시스턴트입니다. 사용자의 요청을 이해하고 적절한 골프장 정보를 제공해주세요.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    })

    const reply = completion.choices[0].message.content

    res.json({
      success: true,
      reply: reply,
      usage: completion.usage
    })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      success: false,
      error: '챗봇 처리 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

// 건강 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📝 API endpoints:`)
  console.log(`   - POST /api/transcribe - Audio to text`)
  console.log(`   - POST /api/speak - Text to speech`)
  console.log(`   - POST /api/chat - Chat with AI`)
  console.log(`   - GET  /api/health - Health check`)
})
