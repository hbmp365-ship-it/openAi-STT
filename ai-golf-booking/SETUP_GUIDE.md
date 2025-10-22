# AI 티봇 설치 및 설정 가이드 🚀

이 가이드는 AI 티봇 골프장 예약 앱을 로컬 환경 또는 프로덕션 환경에 설치하고 설정하는 방법을 단계별로 안내합니다.

## 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [OpenAI API 키 발급](#openai-api-키-발급)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [문제 해결](#문제-해결)
5. [배포 가이드](#배포-가이드)

---

## 시스템 요구사항

### 필수 소프트웨어

- **Node.js**: 18.0.0 이상 (권장: 20.x LTS)
- **npm**: 9.0.0 이상
- **Git**: 2.x 이상

### 지원 브라우저

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 운영 체제

- macOS 10.15+
- Windows 10+
- Linux (Ubuntu 20.04+, Debian 10+, 등)

---

## OpenAI API 키 발급

### 1. OpenAI 계정 생성

1. [OpenAI 웹사이트](https://platform.openai.com/signup)에 접속
2. 이메일로 가입하거나 Google/Microsoft 계정으로 로그인
3. 전화번호 인증 완료

### 2. API 키 생성

1. [API Keys 페이지](https://platform.openai.com/api-keys)로 이동
2. "Create new secret key" 버튼 클릭
3. 키에 이름을 지정 (예: "AI Golf Booking App")
4. 생성된 API 키를 안전한 곳에 복사 (다시 볼 수 없습니다!)

⚠️ **중요**: API 키는 절대 공개 저장소에 커밋하지 마세요!

### 3. 크레딧 확인

1. [Billing 페이지](https://platform.openai.com/account/billing/overview)에서 크레딧 확인
2. 신규 사용자는 무료 크레딧이 제공될 수 있습니다
3. 필요시 결제 방법 등록

### 4. 사용량 제한 설정 (권장)

1. [Usage limits 페이지](https://platform.openai.com/account/limits)로 이동
2. 월별 사용량 제한 설정 (예: $10)
3. 알림 이메일 설정

---

## 로컬 개발 환경 설정

### 1. 저장소 클론 또는 프로젝트 다운로드

```bash
# 이미 프로젝트가 있다면 해당 디렉토리로 이동
cd ai-golf-booking
```

### 2. 의존성 설치

```bash
npm install
```

설치되는 주요 패키지:
- React 19 (Frontend UI)
- Vite (빌드 도구)
- Express 5 (Backend 서버)
- OpenAI SDK (AI 기능)
- Multer (파일 업로드)
- CORS (Cross-Origin 설정)

### 3. 환경 변수 설정

#### .env 파일 생성

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env
```

#### .env 파일 편집

```env
# OpenAI API 키 (필수)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 백엔드 서버 포트
PORT=3001

# Frontend에서 사용할 API URL
VITE_API_URL=http://localhost:3001
```

**설정 방법:**

1. 텍스트 에디터로 `.env` 파일 열기
2. `OPENAI_API_KEY=` 뒤에 발급받은 API 키 붙여넣기
3. 다른 설정은 기본값 사용 (필요시 수정)
4. 파일 저장

### 4. 개발 서버 실행

#### 방법 1: 두 개의 터미널 사용 (권장)

**터미널 1 - Backend API 서버:**
```bash
npm run server
```

출력 예시:
```
🚀 Server is running on http://localhost:3001
📝 API endpoints:
   - POST /api/transcribe - Audio to text
   - POST /api/speak - Text to speech
   - POST /api/chat - Chat with AI
   - GET  /api/health - Health check
```

**터미널 2 - Frontend 개발 서버:**
```bash
npm run dev
```

출력 예시:
```
VITE v7.1.11  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 방법 2: 백그라운드 실행

```bash
# Backend를 백그라운드로 실행
npm run server &

# Frontend 실행
npm run dev
```

### 5. 앱 접속 및 테스트

1. 브라우저에서 http://localhost:5173 열기
2. 마이크 권한 허용
3. 마이크 버튼 클릭하여 "내일 서울에서 예약 가능한 골프장 알려줘" 말하기
4. 음성이 텍스트로 변환되는지 확인

---

## 문제 해결

### 마이크 권한 문제

**증상**: 마이크 버튼 클릭 시 "마이크 접근 권한이 필요합니다" 메시지

**해결 방법**:
1. 브라우저 주소창 왼쪽의 자물쇠/카메라 아이콘 클릭
2. 마이크 권한을 "허용"으로 변경
3. 페이지 새로고침

### API 키 오류

**증상**: "401 Unauthorized" 또는 "Invalid API key" 오류

**해결 방법**:
1. `.env` 파일의 `OPENAI_API_KEY` 확인
2. API 키가 `sk-proj-` 또는 `sk-`로 시작하는지 확인
3. 공백이나 줄바꿈이 없는지 확인
4. OpenAI 대시보드에서 키가 활성화되어 있는지 확인
5. 서버 재시작: `Ctrl+C`로 종료 후 `npm run server` 재실행

### CORS 오류

**증상**: 콘솔에 "CORS policy" 관련 오류 메시지

**해결 방법**:
1. Backend 서버가 실행 중인지 확인
2. `vite.config.js`의 proxy 설정 확인
3. Frontend와 Backend가 다른 포트에서 실행 중인지 확인

### 포트 충돌

**증상**: "Port 3001 is already in use" 또는 "Port 5173 is already in use"

**해결 방법**:

**macOS/Linux:**
```bash
# 포트 사용 프로세스 확인
lsof -i :3001
lsof -i :5173

# 프로세스 종료
kill -9 <PID>
```

**Windows:**
```cmd
# 포트 사용 프로세스 확인
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 프로세스 종료
taskkill /PID <PID> /F
```

또는 `.env` 파일에서 다른 포트 사용:
```env
PORT=3002  # Backend
```

### 모듈을 찾을 수 없음 오류

**증상**: "Cannot find module" 오류

**해결 방법**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Whisper API 오류

**증상**: "Audio file is too large" 또는 transcription 실패

**해결 방법**:
1. 녹음 시간을 짧게 유지 (권장: 30초 이내)
2. 오디오 품질 설정 확인
3. OpenAI API 할당량 확인

---

## 배포 가이드

### Frontend 배포 (Vercel)

1. **Vercel 계정 생성 및 로그인**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **프로젝트 빌드**
   ```bash
   npm run build
   ```

3. **Vercel에 배포**
   ```bash
   vercel --prod
   ```

4. **환경 변수 설정**
   - Vercel 대시보드에서 프로젝트 설정
   - Environment Variables 섹션으로 이동
   - `VITE_API_URL` 추가 (Backend URL로 설정)

### Backend 배포 (Railway)

1. **Railway 계정 생성**
   - [Railway.app](https://railway.app/) 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택

3. **환경 변수 설정**
   - Variables 탭으로 이동
   - `OPENAI_API_KEY` 추가
   - `PORT` 추가 (Railway가 자동으로 설정하지만 명시 가능)

4. **배포 완료**
   - 자동으로 빌드 및 배포됨
   - 생성된 URL 확인

### Backend 배포 (Heroku)

1. **Heroku CLI 설치 및 로그인**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Heroku 앱 생성**
   ```bash
   cd ai-golf-booking
   heroku create ai-golf-booking-api
   ```

3. **환경 변수 설정**
   ```bash
   heroku config:set OPENAI_API_KEY=your-api-key-here
   ```

4. **배포**
   ```bash
   git push heroku main
   ```

### 환경별 설정

#### 개발 환경
```env
VITE_API_URL=http://localhost:3001
```

#### 스테이징 환경
```env
VITE_API_URL=https://ai-golf-booking-api-staging.railway.app
```

#### 프로덕션 환경
```env
VITE_API_URL=https://ai-golf-booking-api.railway.app
```

---

## 보안 체크리스트

- [ ] API 키를 `.env` 파일에만 저장
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 프로덕션 환경에서 HTTPS 사용
- [ ] CORS 설정이 적절히 구성됨
- [ ] Rate limiting 설정 (프로덕션)
- [ ] 에러 메시지에 민감한 정보 포함되지 않음
- [ ] OpenAI API 사용량 모니터링 설정

---

## 추가 리소스

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Express Documentation](https://expressjs.com)

---

## 지원

문제가 발생하면:
1. 이 가이드의 문제 해결 섹션 확인
2. GitHub Issues에 문제 등록
3. OpenAI Community Forum 참조

---

**즐거운 개발 되세요! 🏌️‍♂️⛳️**
