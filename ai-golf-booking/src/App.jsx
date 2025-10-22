import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)
  const hasSentMessageRef = useRef(false) // 중복 전송 방지용 플래그

  // Web Speech API 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'ko-KR'
      recognition.maxAlternatives = 1
      
      recognition.onstart = () => {
        console.log('음성 인식 시작')
        setIsListening(true)
        hasSentMessageRef.current = false // 전송 플래그 초기화
      }
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        console.log('onresult 이벤트 발생, 결과 개수:', event.results.length)
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          console.log(`결과 ${i}: "${transcript}" (isFinal: ${event.results[i].isFinal})`)
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        console.log('최종 텍스트:', finalTranscript)
        console.log('임시 텍스트:', interimTranscript)
        
        // 실시간으로 메시지 입력창에 표시
        if (finalTranscript) {
          setMessageInput(prev => {
            // 기존 임시 텍스트 제거 후 최종 텍스트 추가
            const cleanText = prev.replace(/[가-힣\s]+$/, '')
            const newText = cleanText + finalTranscript
            console.log('최종 텍스트 추가:', prev, '->', newText)
            return newText
          })
        } else if (interimTranscript) {
          setMessageInput(prev => {
            // 임시 텍스트만 업데이트 (기존 임시 텍스트 제거 후 새 임시 텍스트 추가)
            const newText = prev.replace(/[가-힣\s]+$/, '') + interimTranscript
            console.log('임시 텍스트 업데이트:', prev, '->', newText)
            return newText
          })
        }
      }
      
      recognition.onerror = (event) => {
        console.error('음성 인식 오류:', event.error)
        setIsListening(false)
        
        // 오류 발생 시 임시 텍스트 정리
        setMessageInput(prev => prev.replace(/[가-힣\s]+$/, ''))
      }
      
      recognition.onend = () => {
        console.log('음성 인식 종료')
        setIsListening(false)
        
        // 중복 전송 방지
        if (hasSentMessageRef.current) {
          console.log('이미 메시지를 전송했으므로 중복 전송을 건너뜁니다.')
          return
        }
        
        // 음성 인식 종료 시 현재 messageInput에 있는 텍스트를 자동 전송
        setTimeout(() => {
          setMessageInput(currentInput => {
            console.log('onend - 현재 messageInput:', currentInput)
            
            if (currentInput && currentInput.trim() && !hasSentMessageRef.current) {
              console.log('음성 인식 종료 시 자동 전송:', currentInput.trim())
              hasSentMessageRef.current = true // 전송 플래그 설정
              sendMessageToAI(currentInput.trim())
              return '' // 입력창 초기화
            }
            return currentInput
          })
        }, 100) // 약간의 지연을 두어 상태 업데이트가 완료되도록 함
      }
      
      recognitionRef.current = recognition
    } else {
      console.log('이 브라우저는 음성 인식을 지원하지 않습니다.')
    }
  }, [])

  // 실시간 음성 인식 시작/중지
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }
    
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

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
      console.log('API URL:', apiUrl)
      console.log('Audio blob size:', audioBlob.size)
      
      // 서버 연결 테스트
      try {
        const healthResponse = await fetch(`${apiUrl}/api/health`)
        if (!healthResponse.ok) {
          throw new Error(`서버가 응답하지 않습니다. 상태: ${healthResponse.status}`)
        }
        console.log('서버 연결 확인됨')
      } catch (healthError) {
        console.error('서버 연결 실패:', healthError)
        throw new Error(`서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${apiUrl})`)
      }
      
      const response = await fetch(`${apiUrl}/api/transcribe`, {
        method: 'POST',
        body: formData
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error response:', errorText)
        throw new Error(`서버 오류: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        setTranscription(data.transcription)
      } else {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.')
      }
      
      setIsProcessing(false)
      
    } catch (error) {
      console.error('Error processing audio:', error)
      setIsProcessing(false)
      
      let errorMessage = '음성 처리 중 오류가 발생했습니다: '
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += '네트워크 연결 오류. 서버가 실행 중인지 확인해주세요.'
      } else if (error.message.includes('서버에 연결할 수 없습니다')) {
        errorMessage += error.message
      } else {
        errorMessage += error.message
      }
      
      alert(errorMessage)
    }
  }

  // AI 챗봇에 메시지 전송
  const sendMessageToAI = async (message) => {
    console.log('=== sendMessageToAI 호출됨 ===')
    console.log('호출 스택:', new Error().stack)
    console.log('원본 메시지:', message)
    
    // 메시지 검증 및 정리 (한국어 텍스트는 그대로 유지)
    const cleanMessage = message.trim()
    console.log('정리된 메시지:', cleanMessage)
    
    if (!cleanMessage) {
      console.log('빈 메시지는 전송하지 않습니다.')
      return
    }
    
    // 중복 전송 방지
    if (isAiProcessing) {
      console.log('이미 AI 처리 중이므로 전송을 건너뜁니다.')
      return
    }
    
    console.log('AI로 전송할 메시지:', cleanMessage)
    console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001')
    setIsAiProcessing(true)
    
    // 사용자 메시지를 채팅에 추가
    const userMessage = { type: 'user', content: cleanMessage, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      console.log('서버로 요청 전송 시작:', `${apiUrl}/api/chat`)
      
      const requestBody = {
        message: cleanMessage,
        conversationHistory: chatMessages.slice(-10) // 최근 10개 메시지만 전송
      }
      console.log('요청 본문:', requestBody)
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('서버 응답 상태:', response.status)
      console.log('서버 응답 헤더:', response.headers)
      
      if (!response.ok) {
        throw new Error(`AI 서버 오류: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('서버 응답 데이터:', data)
      
      if (data.success) {
        console.log('AI 응답 성공:', data.reply)
        // AI 응답을 채팅에 추가
        const aiMessage = { type: 'ai', content: data.reply, timestamp: new Date() }
        setChatMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'AI 응답 처리 중 오류가 발생했습니다.')
      }
      
    } catch (error) {
      console.error('AI 챗봇 오류:', error)
      const errorMessage = { type: 'error', content: `오류: ${error.message}`, timestamp: new Date() }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAiProcessing(false)
      // AI 처리 완료 후 플래그 리셋 (음성 인식이 아닌 경우에만)
      if (!isListening) {
        hasSentMessageRef.current = false
      }
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
          className={`mic-button ${isListening ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={toggleSpeechRecognition}
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

        {isListening && (
          <div className="transcription">
            <p>🎤 음성 인식 중... 말씀해주세요</p>
            {messageInput && (
              <p className="interim-text">임시 텍스트: {messageInput}</p>
            )}
          </div>
        )}
        
        {transcription && (
          <div className="transcription">
            <p>{transcription}</p>
          </div>
        )}

        {/* 채팅 메시지 표시 */}
        {chatMessages.length > 0 && (
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                <div className="message-content">
                  {msg.type === 'user' && <span className="user-label">👤 사용자:</span>}
                  {msg.type === 'ai' && <span className="ai-label">🤖 AI:</span>}
                  {msg.type === 'error' && <span className="error-label">❌ 오류:</span>}
                  <p>{msg.content}</p>
                </div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isAiProcessing && (
              <div className="chat-message ai">
                <div className="message-content">
                  <span className="ai-label">🤖 AI:</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
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
            placeholder={isListening ? "음성 인식 중..." : "메시지를 입력하세요..."}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isAiProcessing) {
                const cleanInput = messageInput.trim()
                if (cleanInput) {
                  sendMessageToAI(cleanInput)
                  setMessageInput('')
                }
              }
            }}
          />
          <button className="send-button" onClick={() => {
            const cleanInput = messageInput.trim()
            if (cleanInput) {
              sendMessageToAI(cleanInput)
              setMessageInput('')
            } else {
              console.log('전송할 메시지가 없습니다.')
            }
          }} disabled={isAiProcessing}>
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
