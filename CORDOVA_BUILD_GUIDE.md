# Call Me Rich - Cordova 하이브리드 앱 빌드 가이드

## 📱 개요
이 프로젝트는 Cordova를 사용하여 네이티브 모바일 앱으로 변환되었습니다.
- **Android**: APK 파일 생성
- **iOS**: IPA 파일 생성 (Mac 필요)
- **완전 오프라인**: 인터넷 없이 작동

## 🔧 사전 준비사항

### 필수 도구 설치
```bash
# Node.js와 npm 설치 (https://nodejs.org)
node --version
npm --version

# Cordova CLI 전역 설치
npm install -g cordova

# Java Development Kit (JDK) 설치 (Android용)
# Android Studio 설치 (Android SDK 포함)
```

### 환경 변수 설정
```bash
# Android 개발을 위한 환경변수
export JAVA_HOME=/path/to/jdk
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## 🚀 빌드 과정

### 1. 프로젝트 초기화
```bash
# 프로젝트 폴더로 이동
cd CallMeRich

# 의존성 설치
npm install

# Cordova 플랫폼 추가
cordova platform add android
cordova platform add ios  # Mac에서만 가능
```

### 2. 플러그인 설치
```bash
# 필요한 플러그인들 자동 설치
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-file
```

### 3. 앱 빌드

#### Android APK 빌드
```bash
# 디버그 버전 빌드
cordova build android

# 릴리즈 버전 빌드 (서명 필요)
cordova build android --release

# 생성된 APK 위치
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

#### iOS 앱 빌드 (Mac만 가능)
```bash
# Xcode가 설치되어 있어야 함
cordova build ios

# 생성된 앱 위치
# platforms/ios/CallMeRich.xcodeproj
```

### 4. 디바이스에서 실행
```bash
# Android 디바이스에서 실행
cordova run android

# iOS 시뮬레이터에서 실행
cordova run ios
```

## 📦 배포용 APK 생성

### Android 서명 키 생성
```bash
# 키스토어 생성 (한 번만 실행)
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

### 릴리즈 빌드 설정
1. `platforms/android/build.json` 파일 생성:
```json
{
    "android": {
        "release": {
            "keystore": "../../my-release-key.keystore",
            "storePassword": "password",
            "alias": "alias_name",
            "password": "password"
        }
    }
}
```

2. 릴리즈 APK 빌드:
```bash
cordova build android --release
```

## 📱 설치 방법

### Android
1. `app-debug.apk` 파일을 안드로이드 기기로 전송
2. 설정 > 보안 > 알 수 없는 소스 허용
3. APK 파일을 탭하여 설치

### iOS
1. Mac에서 Xcode로 프로젝트 열기
2. Apple Developer 계정으로 서명
3. 디바이스에 직접 설치 또는 App Store Connect 업로드

## 🔧 문제 해결

### 일반적인 오류들
```bash
# 플랫폼 정리 후 다시 빌드
cordova clean
cordova platform rm android
cordova platform add android
cordova build android

# 플러그인 문제 시
cordova plugin rm [plugin-name]
cordova plugin add [plugin-name]
```

### Android 빌드 오류
- Java 버전 확인: JDK 8 또는 11 사용
- Android SDK 경로 확인
- Gradle 버전 충돌 시 `platforms/android/gradle.properties` 확인

### iOS 빌드 오류 (Mac)
- Xcode 최신 버전 사용
- iOS 시뮬레이터 설치 확인
- Apple Developer 계정 설정

## 📂 파일 구조
```
CallMeRich/
├── config.xml          # Cordova 설정
├── package.json         # npm 의존성
├── index.html          # 메인 HTML
├── src/                # 앱 소스코드
├── public/             # 정적 리소스
├── platforms/          # 빌드된 네이티브 코드
├── plugins/            # Cordova 플러그인
└── www/               # 웹 앱 파일들 (자동 생성)
```

## 🎯 주요 변경사항
- PWA → Cordova 하이브리드 앱으로 변환
- 서비스 워커 제거 (불필요)
- 네이티브 앱 권한 및 기능 추가
- 완전 오프라인 작동
- 앱스토어 배포 가능

## 📞 지원
빌드 중 문제가 발생하면:
1. 오류 메시지 전체 복사
2. 사용 중인 OS, Node.js, Cordova 버전 확인
3. GitHub Issues 또는 개발자에게 문의

---
**Call Me Rich Team** © 2025