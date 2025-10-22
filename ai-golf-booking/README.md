# AI 티봇 - 골프장 예약 앱 🏌️‍♂️🤖

OpenAI Speech-to-Text (Whisper) API를 활용한 음성 기반 골프장 예약 도우미 애플리케이션입니다.

## 주요 기능

- 🎙️ **음성 인식 (STT)**: OpenAI Whisper API를 사용한 한국어 음성-텍스트 변환
- 🤖 **AI 챗봇**: GPT-4를 활용한 대화형 골프장 예약 도우미
- 📱 **반응형 디자인**: 모바일 친화적인 UI/UX
- 🎨 **애니메이션**: 귀여운 로봇 캐릭터와 부드러운 애니메이션 효과

## 기술 스택

### Frontend
- React 19
- Vite
- CSS3 (애니메이션 포함)

### Backend
- Node.js + Express
- OpenAI API (Whisper, GPT-4, TTS)
- Multer (파일 업로드)

## 설치 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 OpenAI API 키를 설정하세요:

```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=3001
VITE_API_URL=http://localhost:3001
```

OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

**두 개의 터미널을 사용하여 각각 실행:**

터미널 1 - Frontend 개발 서버:
```bash
npm run dev
```

터미널 2 - Backend API 서버:
```bash
npm run server
```

또는 **하나의 터미널에서 백그라운드로 실행:**

```bash
# Backend 서버를 백그라운드로 실행
npm run server &

# Frontend 개발 서버 실행
npm run dev
```

### 4. 앱 접속

브라우저에서 다음 주소로 접속:
```
http://localhost:5173
```

## API 엔드포인트

### POST /api/transcribe
음성 파일을 텍스트로 변환합니다.

**요청:**
- Method: POST
- Content-Type: multipart/form-data
- Body: audio file (webm, mp3, wav 등)

**응답:**
```json
{
  "success": true,
  "transcription": "내일 서울에서 예약 가능한 골프장 알려줘."
}
```

### POST /api/chat
AI 챗봇과 대화합니다.

**요청:**
```json
{
  "message": "내일 서울에서 예약 가능한 골프장 알려줘.",
  "conversationHistory": []
}
```

**응답:**
```json
{
  "success": true,
  "reply": "서울 지역의 예약 가능한 골프장을 안내해드리겠습니다..."
}
```

### POST /api/speak
텍스트를 음성으로 변환합니다.

**요청:**
```json
{
  "text": "안녕하세요, AI 티봇입니다."
}
```

**응답:** audio/mpeg 파일 스트림

### GET /api/health
서버 상태를 확인합니다.

**응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T01:23:45.678Z"
}
```

## 사용 방법

1. **마이크 버튼 클릭**: 화면 중앙의 파란색 마이크 버튼을 클릭하여 녹음을 시작합니다.
2. **음성 입력**: "내일 서울에서 예약 가능한 골프장 알려줘"와 같이 말합니다.
3. **녹음 중지**: 다시 버튼을 클릭하여 녹음을 중지합니다.
4. **텍스트 변환**: OpenAI Whisper API가 음성을 텍스트로 자동 변환합니다.
5. **결과 확인**: 변환된 텍스트가 화면에 표시됩니다.

### 추가 기능

- **내 예약 확인**: 기존 예약 내역을 조회합니다.
- **조회하기**: 골프장 정보를 검색합니다.
- **라운드 추천 받기**: AI가 추천하는 골프장을 확인합니다.
- **메시지 입력**: 직접 텍스트를 입력하여 질문할 수 있습니다.

## 프로젝트 구조

```
ai-golf-booking/
├── src/
│   ├── App.jsx          # 메인 React 컴포넌트
│   ├── App.css          # 스타일 및 애니메이션
│   └── main.jsx         # React 앱 진입점
├── server.js            # Express 백엔드 서버
├── package.json         # 프로젝트 의존성
├── .env                 # 환경 변수 (API 키)
├── .env.example         # 환경 변수 예시
└── README.md            # 프로젝트 문서
```

## 브라우저 권한

이 앱은 마이크 접근 권한이 필요합니다. 처음 실행 시 브라우저에서 마이크 권한을 요청하면 허용해주세요.

### 권한 문제 해결

- **Chrome**: 설정 > 개인정보 및 보안 > 사이트 설정 > 마이크
- **Firefox**: 설정 > 개인정보 및 보안 > 권한 > 마이크
- **Safari**: 환경설정 > 웹사이트 > 마이크

## 주의사항

1. **API 키 보안**: `.env` 파일을 절대 Git에 커밋하지 마세요.
2. **비용**: OpenAI API 사용에는 비용이 발생할 수 있습니다.
3. **브라우저 호환성**: 최신 버전의 Chrome, Firefox, Safari, Edge를 사용하세요.
4. **HTTPS**: 프로덕션 환경에서는 HTTPS를 사용해야 마이크 접근이 가능합니다.

## 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 배포

### Frontend 배포
- Vercel, Netlify, GitHub Pages 등에 배포 가능
- 환경 변수에 백엔드 API URL 설정 필요

### Backend 배포
- Heroku, Railway, Render 등에 배포 가능
- 환경 변수에 OPENAI_API_KEY 설정 필요

## 라이선스

MIT License

## 문의

문제가 발생하거나 궁금한 점이 있으면 이슈를 등록해주세요.

---

Made with ❤️ by GenSpark AI Developer
