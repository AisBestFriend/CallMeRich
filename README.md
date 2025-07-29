# 하이브리드 가계부 Pro 💰🚀

**NoSQL DB 기반 개인 맞춤형 재정 관리 솔루션**

모바일과 데스크톱에서 완벽하게 동작하는 고급 PWA 가계부입니다. IndexedDB를 활용한 로컬 NoSQL 데이터베이스로 빠르고 안전한 데이터 관리를 제공합니다.

## 🌟 주요 특징

### 💾 고급 데이터 관리
- **IndexedDB NoSQL 데이터베이스**: 빠르고 효율적인 로컬 저장
- **다중 사용자 지원**: 기기별 계정 관리
- **고급 CRUD 작업**: 거래내역, 자산, 계정 관리
- **데이터 백업/복원**: JSON 형태로 데이터 내보내기/가져오기

### 💸 거래 관리 시스템
- **상세한 거래 필드**:
  - 날짜, 금액, 통화(KRW/USD/EUR/JPY/CNY)
  - 수입/지출 구분, 카테고리, 세부카테고리
  - 태그 시스템, 위치정보, 메모
  - 연결된 계정, 영수증 첨부
- **스마트 필터링**: 날짜, 카테고리, 통화별 필터
- **실시간 통계**: 수입/지출/잔액 자동 계산

### 🏦 자산 관리 시스템
- **다양한 자산 유형**:
  - 🏠 부동산 (아파트, 주택, 토지, 상업용)
  - 📊 증권 (주식, 채권, 펀드, ETF)
  - 💰 현금성자산 (예금, 당좌, 정기예금)
  - ₿ 암호화폐 (비트코인, 이더리움, 기타)
  - 🥇 원자재 (금, 은, 원유)
  - 📦 기타자산 (예술품, 수집품)
- **가치 추적**: 구매가격 대비 현재가치, 수익률 계산
- **상세 정보**: 수량, 단위, 위치, 메타데이터

### 📱 하이브리드 UI/UX
- **완전 반응형**: 모바일/태블릿/데스크톱 최적화
- **PWA 기능**: 앱 설치, 오프라인 지원
- **다크모드**: 시스템 설정 자동 감지
- **접근성**: 고대비 모드, 리듀스드 모션 지원

## 🔧 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: IndexedDB (NoSQL)
- **PWA**: Service Worker, Web App Manifest
- **UI Framework**: Pure CSS Grid/Flexbox
- **Icons**: Unicode Emoji + Custom SVG

## 📦 설치 및 실행

### 1. 프로젝트 다운로드
```bash
# 프로젝트 폴더로 이동
cd "하이브리드-가계부-앱"
```

### 2. 로컬 서버 실행
```bash
# Python 사용 (권장)
python -m http.server 8000

# Node.js 사용
npx http-server -p 8000

# PHP 사용
php -S localhost:8000
```

### 3. 브라우저 접속
```
http://localhost:8000
```

## 🚀 사용 방법

### 첫 사용자 설정
1. 브라우저에서 앱 접속
2. "회원가입" 탭에서 계정 생성
3. 사용자명, 이메일, 표시명, 기본통화 설정
4. 자동으로 기본 계좌 생성됨

### 거래 추가
1. **"+ 거래추가"** 버튼 클릭
2. **기본 정보**:
   - 날짜 선택
   - 수입/지출 구분
   - 금액 및 통화 입력
   - 거래 설명 작성
3. **분류**:
   - 카테고리 선택 (식비, 교통비, 급여 등)
   - 세부 카테고리 입력
   - 태그 추가 (쉼표로 구분)
4. **추가 정보**:
   - 연결 계정 선택
   - 위치 정보
   - 상세 메모

### 자산 관리
1. **"+ 자산추가"** 버튼 클릭
2. **기본 정보**:
   - 자산명 입력
   - 자산 종류 및 세부 종류 선택
3. **가격 정보**:
   - 현재 가치 입력
   - 구매 가격 및 구매일
   - 통화 선택
4. **수량 정보**:
   - 보유 수량 및 단위
   - 위치 정보 (부동산 등)

### 데이터 관리
- **내보내기**: 거래내역 페이지에서 "내보내기" 버튼
- **필터링**: 날짜, 카테고리, 통화별 필터 적용
- **통계**: 대시보드에서 실시간 수지 현황 확인

## 📊 데이터베이스 구조

### Users (사용자)
```javascript
{
  id: "고유ID",
  username: "사용자명",
  email: "이메일",
  displayName: "표시명",
  defaultCurrency: "기본통화",
  settings: { theme, language, dateFormat }
}
```

### Transactions (거래)
```javascript
{
  id: "고유ID",
  userId: "사용자ID",
  date: "거래일자",
  amount: "금액(숫자)",
  currency: "통화코드(3자리)",
  type: "income|expense|transfer",
  category: "카테고리",
  subcategory: "세부카테고리",
  description: "설명",
  tags: ["태그배열"],
  accountId: "연결계정ID",
  location: "위치",
  notes: "메모"
}
```

### Assets (자산)
```javascript
{
  id: "고유ID",
  userId: "사용자ID", 
  name: "자산명",
  type: "securities|real_estate|cash|crypto|commodity|other",
  subType: "세부종류",
  currentValue: "현재가치",
  purchasePrice: "구매가격",
  currency: "통화",
  quantity: "수량",
  unit: "단위",
  location: "위치",
  metadata: "추가정보객체"
}
```

### Accounts (계정)
```javascript
{
  id: "고유ID",
  userId: "사용자ID",
  name: "계정명",
  type: "bank|credit_card|cash|digital_wallet",
  balance: "잔액",
  currency: "통화",
  isDefault: "기본계정여부"
}
```

## 🎯 고급 기능

### 필터링 시스템
- 복합 필터 지원 (날짜 + 카테고리 + 통화)
- 태그 기반 검색
- 정렬 옵션 (날짜, 금액, 카테고리별)

### 통계 및 리포트
- 기간별 수입/지출 분석
- 카테고리별 지출 비중
- 자산 포트폴리오 현황
- 수익률 계산

### PWA 기능
- **오프라인 지원**: 인터넷 없이도 사용 가능
- **앱 설치**: 홈 화면에 아이콘 추가
- **백그라운드 동기화**: 온라인 복구 시 자동 동기화
- **푸시 알림**: 예산 초과, 정기 알림 등

## 📂 프로젝트 구조

```
hybrid-budget-app/
├── 📄 index.html              # 메인 HTML 파일
├── 🔧 sw.js                   # 서비스 워커 (PWA)
├── 📋 package.json            # 프로젝트 설정
├── 📖 README.md              # 프로젝트 문서
├── 🚫 .gitignore             # Git 무시 파일
├── 📁 public/                # 정적 자원
│   ├── 📱 manifest.json      # PWA 매니페스트
│   ├── 🖼️ icon-192x192.svg   # 앱 아이콘 (192px)
│   └── 🖼️ icon-512x512.svg   # 앱 아이콘 (512px)
└── 📁 src/                   # 소스 코드
    ├── 🗄️ database.js        # IndexedDB 매니저
    ├── ⚡ app.js             # 메인 앱 로직
    ├── 📁 styles/            # 스타일시트
    │   ├── 🎨 main.css       # 기본 스타일
    │   └── ✨ advanced.css   # 고급 스타일
    └── 📁 components/        # 컴포넌트 (향후 확장)
```

## 🔄 업데이트 계획

### v1.1 (예정)
- [ ] 📊 차트 및 그래프 시각화
- [ ] 📅 예산 설정 및 관리
- [ ] 🔔 스마트 알림 시스템
- [ ] 📱 더 나은 모바일 UX

### v1.2 (예정)
- [ ] ☁️ 클라우드 동기화 (Google Drive, Dropbox)
- [ ] 💱 실시간 환율 정보
- [ ] 📈 주식/암호화폐 시세 연동
- [ ] 🏷️ 영수증 OCR 인식

### v2.0 (계획)
- [ ] 👥 가족 공유 가계부
- [ ] 🤖 AI 기반 지출 패턴 분석
- [ ] 🌐 다국어 지원
- [ ] 🔒 생체 인증 보안

## 🛠️ 커스터마이징

### 카테고리 추가/수정
`src/app.js`의 `transactionCategories` 객체를 수정:

```javascript
transactionCategories: {
  expense: {
    'new_category': { name: '새 카테고리', icon: '🆕' }
  }
}
```

### 자산 유형 추가
`src/app.js`의 `assetTypes` 객체를 수정:

```javascript
assetTypes: {
  'new_asset': { 
    name: '새 자산', 
    icon: '🆕', 
    subTypes: {
      'sub1': '세부타입1'
    }
  }
}
```

### 통화 추가
`src/app.js`의 `currencies` 객체를 수정:

```javascript
currencies: {
  'NEW': { symbol: '🆕', name: '새통화' }
}
```

### 테마 변경
`src/styles/advanced.css`에서 CSS 변수 수정:

```css
:root {
  --primary-color: #2196F3;
  --secondary-color: #21CBF3;
  /* 다른 색상 변수들... */
}
```

## 🔧 개발자 도구

### 디버깅
브라우저 개발자 도구 → Console에서:

```javascript
// 현재 사용자 정보
console.log(window.budgetApp.currentUser);

// 데이터베이스 상태
console.log(window.dbManager);

// 모든 거래 조회
window.dbManager.getTransactions().then(console.log);

// 모든 자산 조회  
window.dbManager.getAssets().then(console.log);
```

### 데이터 백업
```javascript
// 전체 데이터 내보내기
window.dbManager.exportUserData().then(data => {
  console.log('백업 데이터:', data);
});
```

### 캐시 관리
```javascript
// 서비스 워커 캐시 확인
caches.keys().then(console.log);

// 특정 캐시 내용 확인
caches.open('budget-app-pro-v2').then(cache => {
  return cache.keys();
}).then(console.log);
```

## 🚨 문제 해결

### 앱이 설치되지 않는 경우
- ✅ HTTPS 환경에서 테스트 (localhost는 HTTP 허용)
- ✅ 최신 브라우저 사용 (Chrome 67+, Firefox 44+)
- ✅ manifest.json 파일 경로 확인

### 데이터가 사라지는 경우  
- ⚠️ 브라우저 시크릿/프라이빗 모드에서는 데이터 저장 안됨
- ⚠️ 브라우저 캐시/쿠키 삭제 시 데이터 손실
- 💡 정기적인 데이터 내보내기 권장

### 성능이 느린 경우
- 🔧 브라우저 개발자 도구 → Performance 탭 확인
- 📱 모바일에서는 많은 거래 데이터 시 느릴 수 있음
- 💾 정기적인 오래된 데이터 정리 권장

### IndexedDB 오류
```javascript
// IndexedDB 지원 확인
if (!window.indexedDB) {
  console.error('브라우저가 IndexedDB를 지원하지 않습니다');
}

// 데이터베이스 재초기화
window.dbManager.init().then(() => {
  console.log('데이터베이스 재초기화 완료');
});
```

## 📞 지원 및 기여

### 버그 리포트
발견된 버그는 다음 정보와 함께 보고해주세요:
- 브라우저 종류 및 버전
- 운영체제
- 재현 단계
- 예상 결과 vs 실제 결과

### 기능 요청
새로운 기능 제안은 다음을 포함해주세요:
- 기능 설명
- 사용 사례
- 우선순위

### 기여 방법
1. 프로젝트 포크
2. 새 브랜치 생성 (`feature/새기능`)
3. 변경사항 커밋
4. 풀 리퀘스트 생성

## 📄 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 👨‍💻 개발팀

**형님의 프로젝트** ⚡  
- 기획/개발: 형님
- 기술지원: Claude (Anthropic)

---

### 🎉 마지막으로...

이 가계부 앱이 형님의 재정 관리에 도움이 되기를 바랍니다! 

**"돈 관리는 인생 관리"** - 체계적인 가계부로 더 나은 미래를 준비하세요! 💪

---

**📱 지금 바로 시작하세요:**
1. `python -m http.server 8000` 실행
2. `http://localhost:8000` 접속  
3. 회원가입 후 첫 거래 추가!

**🚀 PWA로 설치하여 앱처럼 사용하세요!**