const CACHE_NAME = 'budget-app-pro-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/styles/advanced.css',
  '/src/database.js',
  '/src/app.js',
  '/public/manifest.json'
];

// 설치 이벤트 - 캐시 설정
self.addEventListener('install', event => {
  console.log('서비스 워커 설치중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시가 열렸습니다');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('모든 파일이 캐시되었습니다');
        return self.skipWaiting(); // 즉시 활성화
      })
  );
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', event => {
  console.log('서비스 워커 활성화중...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시를 삭제합니다:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('서비스 워커가 준비되었습니다');
      return self.clients.claim(); // 즉시 제어권 획득
    })
  );
});

// 페치 이벤트 - 네트워크 요청 처리
self.addEventListener('fetch', event => {
  // 외부 리소스는 캐시하지 않음
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }

        // 네트워크에서 가져오기
        return fetch(event.request).then(
          response => {
            // 유효하지 않은 응답이면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복사해서 캐시에 저장
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // 오프라인일 때 기본 페이지 반환
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        // API 요청 실패시 기본 응답
        if (event.request.url.includes('/api/')) {
          return new Response(JSON.stringify({
            error: '오프라인 상태입니다',
            offline: true
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'budget-data-sync') {
    event.waitUntil(syncBudgetData());
  }
});

// 푸시 알림
self.addEventListener('push', event => {
  console.log('푸시 메시지 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/public/icon-192x192.png',
    badge: '/public/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/public/icon-192x192.png'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('가계부 Pro', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('알림 클릭:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 아무것도 하지 않음
  } else {
    // 기본 동작: 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 메시지 처리 (앱과의 통신)
self.addEventListener('message', event => {
  console.log('메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

// 백그라운드 동기화 함수
async function doBackgroundSync() {
  console.log('백그라운드 동기화 실행');
  
  try {
    // 저장된 오프라인 데이터 확인
    const cache = await caches.open(CACHE_NAME);
    const offlineData = await cache.match('/offline-data');
    
    if (offlineData) {
      const data = await offlineData.json();
      console.log('오프라인 데이터 발견:', data);
      
      // 서버로 데이터 전송 (실제 구현 시 추가)
      // await syncToServer(data);
      
      // 동기화 완료 후 오프라인 데이터 제거
      await cache.delete('/offline-data');
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('백그라운드 동기화 실패:', error);
    return Promise.reject(error);
  }
}

// 가계부 데이터 동기화
async function syncBudgetData() {
  console.log('가계부 데이터 동기화 시작');
  
  try {
    // IndexedDB에서 변경된 데이터 확인
    // 실제 구현에서는 데이터베이스 매니저와 연동
    
    // 예시: 마지막 동기화 이후 변경된 데이터 가져오기
    const lastSync = await getLastSyncTime();
    const changedData = await getChangedDataSince(lastSync);
    
    if (changedData.length > 0) {
      console.log(`${changedData.length}개의 변경사항 발견`);
      
      // 클라우드 서비스와 동기화 (구현 예정)
      // await syncWithCloud(changedData);
      
      // 동기화 시간 업데이트
      await updateLastSyncTime();
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('가계부 데이터 동기화 실패:', error);
    return Promise.reject(error);
  }
}

// 유틸리티 함수들
async function getLastSyncTime() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/last-sync-time');
    if (response) {
      const data = await response.text();
      return new Date(data);
    }
    return new Date(0); // 처음 동기화
  } catch (error) {
    return new Date(0);
  }
}

async function updateLastSyncTime() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(new Date().toISOString());
    await cache.put('/last-sync-time', response);
  } catch (error) {
    console.error('동기화 시간 업데이트 실패:', error);
  }
}

async function getChangedDataSince(date) {
  // 실제 구현에서는 IndexedDB와 연동
  // 임시로 빈 배열 반환
  return [];
}

// 주기적 백그라운드 작업 (실험적 기능)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'budget-backup') {
    event.waitUntil(performPeriodicBackup());
  }
});

async function performPeriodicBackup() {
  console.log('주기적 백업 실행');
  
  try {
    // 사용자 데이터 백업 로직
    // 실제 구현에서는 데이터베이스 매니저와 연동
    
    // 로컬 스토리지에 백업 정보 저장
    const backupInfo = {
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(backupInfo));
    await cache.put('/backup-info', response);
    
    console.log('주기적 백업 완료');
  } catch (error) {
    console.error('주기적 백업 실패:', error);
  }
}