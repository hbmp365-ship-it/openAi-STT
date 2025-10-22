import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('마이크 접근 권한이 필요합니다.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/transcribe`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTranscription(data.transcription)
      } else {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.')
      }
      
      setIsProcessing(false)
      
    } catch (error) {
      console.error('Error processing audio:', error)
      setIsProcessing(false)
      alert('음성 처리 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const handleButtonClick = (action) => {
    console.log('Button clicked:', action)
    // Handle button actions
  }

  return (
    <div className="app">
      <header className="header">
        <button className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="title">AI 티봇</h1>
        <span className="beta-badge">Beta</span>
      </header>

      <main className="main-content">
        <div className="prompt-text">
          <p>내일 서울에서 예약 가능한</p>
          <p>골프장 알려줘."라고 말해보세</p>
          <p>요.</p>
        </div>

        <div className="robot-container">
          <div className="robot">
            <div className="robot-head">
              <div className="antenna left-antenna">
                <div className="antenna-ball"></div>
              </div>
              <div className="antenna right-antenna">
                <div className="antenna-ball"></div>
              </div>
              <div className="screen">
                <div className="eye left-eye"></div>
                <div className="eye right-eye"></div>
                <div className="smile"></div>
              </div>
            </div>
            <div className="robot-body">
              <div className="arm left-arm">
                <div className="hand"></div>
              </div>
              <div className="arm right-arm">
                <div className="hand"></div>
              </div>
            </div>
          </div>
        </div>

        <button 
          className={`mic-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="spinner"></div>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="white"/>
              <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.42 6.16 20.16 10.5 20.92V23H13.5V20.92C17.84 20.16 21 16.42 21 12V10H19Z" fill="white"/>
            </svg>
          )}
        </button>

        {transcription && (
          <div className="transcription">
            <p>{transcription}</p>
          </div>
        )}

        <div className="action-buttons">
          <button className="action-button" onClick={() => handleButtonClick('myBooking')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>내 예약 확인</span>
          </button>

          <button className="action-button" onClick={() => handleButtonClick('search')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 17L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M11 8C11 6.5 12 5.5 13.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>조회하기</span>
          </button>

          <button className="action-button" onClick={() => handleButtonClick('recommendation')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15 9H22L16.5 14L18.5 21L12 16.5L5.5 21L7.5 14L2 9H9L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span>라운드 추천 받기</span>
          </button>
        </div>

        <div className="message-input-container">
          <input 
            type="text" 
            className="message-input" 
            placeholder="메시지를 입력하세요..."
          />
          <button className="send-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
