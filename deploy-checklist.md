# 배포 전 체크리스트

## PWA 필수 요소 확인
- [x] manifest.json 파일 존재
- [x] Service Worker (sw.js) 구현
- [x] 아이콘 파일들 (192x192, 512x512)
- [x] HTTPS 필수 (GitHub Pages, Netlify 등은 자동 제공)

## 성능 최적화
- [ ] 이미지 최적화 (WebP 변환 권장)
- [ ] JavaScript/CSS 압축
- [ ] 불필요한 파일 제거

## 보안 설정
- [ ] CSP (Content Security Policy) 헤더
- [ ] HTTPS 강제 설정
- [ ] 민감한 정보 환경변수 처리

## 테스트
- [ ] 다양한 기기에서 테스트
- [ ] 오프라인 기능 테스트
- [ ] PWA 설치 테스트

## SEO 최적화
- [ ] meta 태그 최적화
- [ ] robots.txt 생성
- [ ] sitemap.xml 생성 (선택사항)

## 모니터링
- [ ] Google Analytics 설정 (선택사항)
- [ ] 에러 모니터링 (Sentry 등, 선택사항)