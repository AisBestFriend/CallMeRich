# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Call Me Rich는 IndexedDB 기반의 하이브리드 가계부 PWA(Progressive Web App)입니다. 모바일과 데스크톱에서 모두 동작하며, Cordova를 통해 네이티브 앱으로도 빌드할 수 있습니다.

## 개발 환경 설정 및 명령어

### 로컬 서버 실행
```bash
# npm 스크립트 사용 (권장)
npm start          # 또는 npm run serve, npm run dev
npm run serve      # python -m http.server 8000 || npx http-server -p 8000

# 직접 실행
python3 -m http.server 8000
# 또는
npx http-server -p 8000
```

### Cordova 빌드 (모바일 앱)
```bash
# 전체 빌드
npm run build      # cordova build

# 플랫폼별 빌드
npm run build-android    # cordova build android
npm run build-ios        # cordova build ios

# 에뮬레이터에서 실행
npm run run-android      # cordova run android
npm run run-ios          # cordova run ios

# Cordova 서버
npm run cordova-serve    # cordova serve
```

### 기타 명령어
```bash
# 테스트 (미구현)
npm test           # echo 'Tests coming soon...'

# 린트 (미구현)  
npm run lint       # echo 'Linting coming soon...'

# 배포
npm run deploy     # echo 'Ready for deployment - all files are static'
```

## 핵심 아키텍처

### 데이터베이스 구조 (IndexedDB)
- **users**: 사용자 정보 (id, username, email, password, displayName, defaultCurrency, settings)
- **transactions**: 거래내역 (수입/지출, 카테고리, 금액, 통화, 태그 등)
- **assets**: 자산 관리 (부동산, 증권, 현금, 암호화폐, 원자재, 기타)
- **budgets**: 예산 설정
- **accounts**: 계정 정보 (은행계좌, 카드 등)
- **account_users**: 가계부 사용자 관리

### 주요 클래스 구조

#### `DatabaseManager` (src/database.js)
- IndexedDB 연결 및 CRUD 작업 담당
- 사용자별 데이터 격리 
- 백업/복원 기능 제공

#### `AdvancedBudgetApp` (src/app.js) 
- 메인 애플리케이션 로직
- UI 렌더링 및 이벤트 처리
- 거래/자산 카테고리 정의
- 다중 통화 지원 (KRW, USD, EUR, JPY, CNY)

### PWA 기능
- Web App Manifest (public/manifest.json)
- 브라우저에서 앱 설치 지원
- 모바일 홈화면 추가 가능
- Service Worker는 sw.js 파일 존재하나 구현 필요

### 하이브리드 앱 지원
- Cordova 설정 (config.xml)
- Android/iOS 네이티브 빌드 지원
- 디바이스 플러그인 연동

## 데이터 구조

### 거래 객체 구조
```javascript
{
  id: "고유ID",
  userId: "사용자ID", 
  date: "YYYY-MM-DD",
  amount: 숫자,
  currency: "KRW|USD|EUR|JPY|CNY",
  type: "income|expense|transfer",
  category: "카테고리코드",
  subcategory: "세부카테고리",
  description: "설명",
  tags: ["태그1", "태그2"],
  accountId: "계정ID",
  location: "위치",
  notes: "메모"
}
```

### 자산 객체 구조
```javascript
{
  id: "고유ID",
  userId: "사용자ID",
  name: "자산명",
  type: "real_estate|securities|cash|crypto|commodity|other",
  subType: "세부종류",
  currentValue: 숫자,
  purchasePrice: 숫자,
  currency: "통화코드",
  quantity: 숫자,
  unit: "단위",
  location: "위치",
  metadata: {}
}
```

## 주요 기능

### 거래 관리
- 수입/지출/이체 기록
- 10개 카테고리별 분류 (식비, 교통비, 쇼핑 등)
- 다중 통화 지원
- 태그 시스템
- 위치 기반 기록

### 자산 관리
- 6개 자산 유형 (부동산, 증권, 현금, 암호화폐, 원자재, 기타)
- 구매가격 대비 현재가치 추적
- 수익률 계산

### 사용자 관리
- 다중 사용자 지원
- 개별 가계부 관리
- 로그인/로그아웃 시스템

## 파일 구조 주요 포인트

- `index.html`: 단일 페이지 애플리케이션 진입점
- `src/app.js`: 메인 애플리케이션 클래스 및 UI 로직
- `src/database.js`: IndexedDB 매니저 클래스
- `src/styles/`: CSS 스타일시트 (main.css, advanced.css)
- `config.xml`: Cordova 하이브리드 앱 설정
- `sw.js`: PWA 서비스 워커
- `public/`: 정적 리소스 (아이콘, 매니페스트)

## 개발 시 주의사항

- 모든 데이터는 사용자별로 격리되어 저장됩니다
- 통화 변환 기능은 클라이언트에서 수동으로 처리됩니다
- PWA와 하이브리드 앱 양쪽을 고려한 개발이 필요합니다
- IndexedDB의 비동기 특성을 고려하여 Promise 기반으로 작업하세요
- UI는 완전 반응형이며 모바일 우선으로 설계되었습니다