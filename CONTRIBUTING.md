# 기여 가이드 (Contributing Guide)

이 프로젝트에 기여해주셔서 감사합니다! 🎉

## 🚀 시작하기

### 개발 환경 설정
```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/hybrid-budget-app.git
cd hybrid-budget-app

# 2. 의존성 설치 (선택사항)
npm install

# 3. 개발 서버 실행
npm start
# 또는
python -m http.server 8000

# 4. 브라우저에서 확인
# http://localhost:8000
```

### 요구사항
- **브라우저**: Chrome 67+, Firefox 44+, Safari 11+
- **개발도구**: 텍스트 에디터 또는 IDE
- **테스트**: Python 3.x (HTTP 서버용) 또는 Node.js

## 📝 기여 방법

### 1. 이슈 확인
- [Issues](https://github.com/YOUR_USERNAME/hybrid-budget-app/issues)에서 기존 이슈 확인
- 새로운 버그나 기능 요청은 이슈로 등록

### 2. 브랜치 생성
```bash
# 새 기능 개발
git checkout -b feature/새로운-기능

# 버그 수정
git checkout -b bugfix/버그-설명

# 문서 개선
git checkout -b docs/문서-개선
```

### 3. 개발
- **코드 스타일**: 기존 코드와 일관성 유지
- **주석**: 복잡한 로직에는 주석 추가
- **테스트**: 변경사항이 기존 기능에 영향 없는지 확인

### 4. 커밋
```bash
git add .
git commit -m "feat: 새로운 기능 추가"

# 커밋 메시지 규칙
# feat: 새 기능
# fix: 버그 수정  
# docs: 문서 변경
# style: 코드 포맷팅
# refactor: 코드 리팩토링
# test: 테스트 추가
# chore: 빌드/설정 변경
```

### 5. 풀 리퀘스트
- 변경 내용을 명확히 설명
- 관련 이슈 번호 언급 (#123)
- 스크린샷이나 GIF 첨부 (UI 변경시)

## 🐛 버그 리포트

버그를 발견하셨다면 다음 정보를 포함해 주세요:

### 버그 정보
- **브라우저**: Chrome 120.0.0
- **운영체제**: Windows 11
- **앱 버전**: v1.0.0

### 재현 단계
1. 앱 실행
2. 거래 추가 버튼 클릭
3. 오류 발생

### 예상 결과
정상적으로 거래 추가 폼이 나타남

### 실제 결과
오류 메시지 표시됨

### 추가 정보
- 콘솔 에러 메시지
- 스크린샷
- 오류 발생 시점

## 💡 기능 요청

새로운 기능을 제안하실 때는:

### 기능 설명
구체적인 기능 내용과 동작 방식

### 사용 사례
어떤 상황에서 이 기능이 필요한지

### 우선순위
- High: 핵심 기능
- Medium: 편의 기능  
- Low: 부가 기능

### 대안
다른 해결 방법이 있는지

## 📁 프로젝트 구조

```
hybrid-budget-app/
├── index.html              # 메인 페이지
├── sw.js                   # 서비스 워커
├── package.json            # 프로젝트 설정
├── src/
│   ├── app.js             # 메인 앱 로직
│   ├── database.js        # IndexedDB 관리
│   └── styles/            # CSS 파일들
├── public/                # 정적 파일들
└── docs/                  # 문서 (선택사항)
```

## ✅ 코드 스타일

### JavaScript
```javascript
// 함수명: camelCase
function calculateBalance() {
  // 들여쓰기: 4 spaces
  const transactions = getTransactions();
  return transactions.reduce((sum, txn) => sum + txn.amount, 0);
}

// 클래스명: PascalCase
class DatabaseManager {
  constructor() {
    this.dbName = 'BudgetAppDB';
  }
}

// 상수명: UPPER_SNAKE_CASE
const CACHE_NAME = 'budget-app-v1';
```

### CSS
```css
/* 클래스명: kebab-case */
.transaction-item {
  display: flex;
  gap: 1rem;
}

/* BEM 방식 권장 */
.card__header--active {
  background: #2196F3;
}
```

### HTML
```html
<!-- 속성: kebab-case -->
<button data-action="add-transaction" class="btn-primary">
  거래 추가
</button>
```

## 🧪 테스트

### 수동 테스트
- [ ] 모든 페이지에서 오류 없이 동작
- [ ] 모바일/데스크톱 모두 테스트
- [ ] 오프라인 상태에서 테스트
- [ ] 다양한 브라우저에서 테스트

### 기능 테스트
- [ ] 사용자 생성/로그인
- [ ] 거래 CRUD 동작
- [ ] 자산 CRUD 동작
- [ ] 데이터 내보내기/가져오기
- [ ] PWA 설치 및 오프라인 동작

## 📚 참고 자료

- [IndexedDB API](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)
- [PWA 가이드](https://web.dev/progressive-web-apps/)
- [Service Worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)

## 🙋‍♂️ 질문과 토론

- **일반 질문**: [Discussions](https://github.com/YOUR_USERNAME/hybrid-budget-app/discussions)
- **버그 리포트**: [Issues](https://github.com/YOUR_USERNAME/hybrid-budget-app/issues)
- **기능 요청**: [Issues](https://github.com/YOUR_USERNAME/hybrid-budget-app/issues)

## 📄 라이센스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

---

**기여해주셔서 다시 한번 감사드립니다!** 🚀

모든 기여는 소중하며, 함께 더 나은 가계부 앱을 만들어가요!