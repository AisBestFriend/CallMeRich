    async applyFilters() {
        const filters = {
            type: document.getElementById('filter-type')?.value || '',
            category: document.getElementById('filter-category')?.value || '',
            dateFrom: document.getElementById('filter-date-from')?.value || '',
            dateTo: document.getElementById('filter-date-to')?.value || ''
        };

        try {
            const transactions = await this.dbManager.getTransactions(null, filters);
            const transactionsList = document.querySelector('.transactions-list');
            if (transactionsList) {
                transactionsList.innerHTML = this.renderTransactionsList(transactions);
            }
        } catch (error) {
            this.showError('필터 적용 중 오류가 발생했습니다.');
        }
    }

    clearFilters() {
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        this.applyFilters();
    }

    setupPWA() {
        // PWA 설치 버튼 클릭 이벤트
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('#install-btn')) {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('사용자가 PWA 설치를 승인했습니다');
                        }
                        this.deferredPrompt = null;
                        this.hideInstallButton();
                    });
                }
            }
        });

        // 이미 설치된 경우 버튼 숨기기
        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
        });
    }

    showInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 1000;
            animation: toastSlideUp 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideUp 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showToast(message, 'error');
    }
}

// 앱 초기화 및 시작
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 데이터베이스 매니저 로드
        const script = document.createElement('script');
        script.src = './src/database.js';
        document.head.appendChild(script);

        script.onload = async () => {
            const app = new AdvancedBudgetApp();
            await app.init();
            window.budgetApp = app; // 디버깅용
        };
    } catch (error) {
        console.error('앱 시작 실패:', error);
        document.getElementById('app').innerHTML = `
            <div class="error-container">
                <h2>앱을 시작할 수 없습니다</h2>
                <p>브라우저를 새로고침하거나 다시 시도해주세요.</p>
                <button onclick="location.reload()">새로고침</button>
            </div>
        `;
    }
});

// 서비스 워커 업데이트 확인
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}