import express from 'express'
import multer from 'multer'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import ffmpeg from 'fluent-ffmpeg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const upload = multer({ dest: 'uploads/' })

// CORS 설정
app.use(cors())
app.use(express.json())

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// 업로드 디렉토리 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// 오디오 파일 변환 함수 (webm -> wav)
const convertAudioToWav = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => {
        console.log('오디오 변환 완료:', outputPath)
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('오디오 변환 오류:', err)
        reject(err)
      })
      .save(outputPath)
  })
}

// STT (Speech-to-Text) 엔드포인트
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  console.log('=== STT 요청 받음 ===')
  console.log('Headers:', req.headers)
  console.log('Body keys:', Object.keys(req.body || {}))
  console.log('File info:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file')
  
  try {
    if (!req.file) {
      console.log('오류: 오디오 파일이 없음')
      return res.status(400).json({ error: '오디오 파일이 필요합니다.' })
    }

    console.log('Processing audio file:', req.file.filename)
    console.log('File size:', req.file.size, 'bytes')
    console.log('File type:', req.file.mimetype)

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.error('OpenAI API 키가 설정되지 않았습니다.')
      return res.status(500).json({
        success: false,
        error: 'OpenAI API 키가 설정되지 않았습니다.',
        details: '환경 변수 OPENAI_API_KEY를 설정해주세요.'
      })
    }
    
    console.log('OpenAI API 키 확인됨:', apiKey.substring(0, 20) + '...')

    console.log('OpenAI API 호출 시작...')
    
    // webm 파일을 wav로 변환
    const wavPath = req.file.path.replace(/\.[^/.]+$/, '.wav')
    console.log('오디오 변환 시작:', req.file.path, '->', wavPath)
    
    try {
      await convertAudioToWav(req.file.path, wavPath)
      
      // 원본 파일 삭제
      fs.unlinkSync(req.file.path)
      console.log('원본 파일 삭제됨:', req.file.path)
      
      // OpenAI Whisper API를 사용하여 음성을 텍스트로 변환
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(wavPath),
        model: 'whisper-1',
        language: 'ko', // 한국어 설정
        response_format: 'json'
      })
      
      // 변환된 파일 삭제
      fs.unlinkSync(wavPath)
      console.log('변환된 파일 삭제됨:', wavPath)

      console.log('OpenAI API 응답 받음')
      console.log('Transcription result:', transcription.text)

      res.json({
        success: true,
        transcription: transcription.text
      })

    } catch (conversionError) {
      console.error('오디오 변환 오류:', conversionError)
      
      // 원본 파일이 있다면 삭제
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
        console.log('원본 파일 삭제됨 (오류)')
      }
      
      // 변환된 파일이 있다면 삭제
      const wavPath = req.file.path.replace(/\.[^/.]+$/, '.wav')
      if (fs.existsSync(wavPath)) {
        fs.unlinkSync(wavPath)
        console.log('변환된 파일 삭제됨 (오류)')
      }
      
      throw conversionError
    }

  } catch (error) {
    console.error('Transcription error:', error)
    console.error('Error stack:', error.stack)
    
    // 임시 파일이 있다면 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
      console.log('오류 발생으로 인한 임시 파일 삭제')
    }
    
    // 변환된 파일이 있다면 삭제
    if (req.file) {
      const wavPath = req.file.path.replace(/\.[^/.]+$/, '.wav')
      if (fs.existsSync(wavPath)) {
        fs.unlinkSync(wavPath)
        console.log('변환된 파일 삭제됨 (오류)')
      }
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
    console.log('Chat request received:', message)
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
