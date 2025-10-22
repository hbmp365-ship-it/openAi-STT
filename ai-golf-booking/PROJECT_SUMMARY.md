# 🏌️ AI 티봇 - 골프장 예약 앱 프로젝트 요약

## 📋 프로젝트 개요

이 프로젝트는 OpenAI의 Whisper API를 활용한 음성 기반 골프장 예약 도우미 애플리케이션입니다.

## ✅ 완료된 작업

### 1. Frontend (React + Vite)
- ✅ 반응형 모바일 UI 구현
- ✅ 애니메이션이 적용된 로봇 캐릭터 디자인
- ✅ 음성 녹음 기능 (Web Audio API)
- ✅ 실시간 음성-텍스트 변환 표시
- ✅ 액션 버튼 (예약 확인, 조회, 추천)
- ✅ 메시지 입력 UI

### 2. Backend (Node.js + Express)
- ✅ OpenAI Whisper API 통합 (STT)
- ✅ OpenAI GPT-4 챗봇 통합
- ✅ OpenAI TTS API 통합
- ✅ 파일 업로드 처리 (Multer)
- ✅ CORS 설정
- ✅ 에러 핸들링

### 3. API 엔드포인트
- ✅ POST /api/transcribe - 음성을 텍스트로 변환
- ✅ POST /api/chat - AI 챗봇 대화
- ✅ POST /api/speak - 텍스트를 음성으로 변환
- ✅ GET /api/health - 서버 상태 확인

### 4. 문서화
- ✅ README.md - 프로젝트 소개 및 기본 사용법
- ✅ SETUP_GUIDE.md - 상세한 설치 및 배포 가이드
- ✅ .env.example - 환경 변수 예시
- ✅ 주석이 포함된 코드

### 5. 개발 환경 설정
- ✅ Vite 개발 서버 설정
- ✅ API 프록시 설정
- ✅ ESLint 설정
- ✅ Git 저장소 초기화

## 🚀 실행 방법

### 빠른 시작
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env 파일에 OpenAI API 키 입력)
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정

# 3. 서버 실행 (터미널 2개 필요)
npm run server  # 터미널 1: Backend
npm run dev     # 터미널 2: Frontend
```

### 접속 URL
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### 현재 실행 중인 서비스
- **Frontend**: https://5173-imru7w86aojr6iw46ruh7-82b888ba.sandbox.novita.ai
- **Backend**: https://3001-imru7w86aojr6iw46ruh7-82b888ba.sandbox.novita.ai

## 📁 프로젝트 구조

```
ai-golf-booking/
├── src/
│   ├── App.jsx              # 메인 React 컴포넌트
│   ├── App.css              # 메인 스타일 및 애니메이션
│   ├── main.jsx             # React 진입점
│   └── index.css            # 전역 스타일
├── server.js                # Express 백엔드 서버
├── vite.config.js           # Vite 설정
├── package.json             # 프로젝트 의존성
├── .env                     # 환경 변수 (API 키)
├── .env.example             # 환경 변수 예시
├── README.md                # 프로젝트 문서
├── SETUP_GUIDE.md           # 설치 가이드
└── PROJECT_SUMMARY.md       # 프로젝트 요약 (이 파일)
```

## 🔧 기술 스택

### Frontend
- React 19.1.1
- Vite 7.1.11
- CSS3 (Animations)
- Web Audio API

### Backend
- Node.js
- Express 5.1.0
- OpenAI SDK 6.6.0
- Multer 2.0.2
- CORS 2.8.5

### AI Services
- OpenAI Whisper (Speech-to-Text)
- OpenAI GPT-4 (Chat)
- OpenAI TTS-1 (Text-to-Speech)

## 🎨 주요 기능

1. **음성 인식**
   - 마이크 버튼으로 녹음 시작/중지
   - WebRTC를 통한 실시간 오디오 캡처
   - OpenAI Whisper API로 한국어 음성 인식
   - 변환된 텍스트 실시간 표시

2. **AI 챗봇**
   - GPT-4를 활용한 골프장 정보 제공
   - 대화 히스토리 관리
   - 자연스러운 한국어 응답

3. **TTS (Text-to-Speech)**
   - 텍스트를 음성으로 변환
   - 다양한 음성 옵션 지원

4. **UI/UX**
   - 귀여운 로봇 캐릭터 애니메이션
   - 반응형 디자인 (모바일/데스크톱)
   - 부드러운 인터랙션 효과
   - 로딩 상태 표시

## ⚙️ 환경 변수

```env
OPENAI_API_KEY=sk-proj-xxxxx  # OpenAI API 키 (필수)
PORT=3001                      # Backend 서버 포트
VITE_API_URL=http://localhost:3001  # API URL
```

## 🔒 보안 고려사항

- ✅ API 키는 환경 변수로 관리
- ✅ .env 파일은 .gitignore에 포함
- ✅ CORS 설정으로 출처 제한
- ✅ 파일 업로드 크기 제한
- ✅ 에러 메시지에서 민감한 정보 제거

## 📱 브라우저 호환성

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚧 향후 개선 사항

- [ ] 실제 골프장 데이터베이스 연동
- [ ] 사용자 인증 및 로그인
- [ ] 예약 히스토리 저장
- [ ] 결제 시스템 통합
- [ ] 푸시 알림 기능
- [ ] 다국어 지원
- [ ] PWA 변환

## 📊 비용 고려사항

### OpenAI API 가격 (2024년 기준)
- Whisper API: $0.006 / 분
- GPT-4: $0.03 / 1K tokens (입력), $0.06 / 1K tokens (출력)
- TTS-1: $0.015 / 1K 문자

### 예상 사용량
- 음성 인식 1회 (30초): ~$0.003
- 챗봇 대화 1회: ~$0.01
- TTS 1회 (100자): ~$0.0015

## 🧪 테스트 방법

1. **기본 음성 인식 테스트**
   ```
   마이크 버튼 클릭 → "내일 서울에서 예약 가능한 골프장 알려줘" 말하기
   ```

2. **API 테스트**
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Transcribe test (오디오 파일 필요)
   curl -X POST http://localhost:3001/api/transcribe \
     -F "audio=@test.webm"
   ```

## 📞 문제 해결

자세한 문제 해결 방법은 `SETUP_GUIDE.md`를 참조하세요.

## 📄 라이선스

MIT License

---

**프로젝트 생성일**: 2025-10-22
**개발자**: GenSpark AI Developer
**버전**: 1.0.0
