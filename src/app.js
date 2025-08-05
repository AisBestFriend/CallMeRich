// 고급 가계부 앱 클래스
class AdvancedBudgetApp {
    constructor() {
        this.dbManager = null;
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.selectedAccountUserId = 'all'; // 현재 선택된 가계부 사용자 ID ('all'은 전체 보기)
        this.deferredPrompt = null;
        this.pendingMonthFilter = null; // 월별 필터 정보 저장
        
        // 거래 카테고리 정의
        this.transactionCategories = {
            income: {
                'salary': { name: '급여', icon: '💰' },
                'business': { name: '사업소득', icon: '🏢' },
                'investment': { name: '투자수익', icon: '📈' },
                'bonus': { name: '보너스', icon: '🎁' },
                'freelance': { name: '프리랜스', icon: '💻' },
                'rental': { name: '임대수입', icon: '🏠' },
                'other': { name: '기타수입', icon: '➕' }
            },
            expense: {
                'food': { name: '식비', icon: '🍽️' },
                'transportation': { name: '교통비', icon: '🚗' },
                'shopping': { name: '쇼핑', icon: '🛍️' },
                'utility': { name: '공과금', icon: '💡' },
                'healthcare': { name: '의료비', icon: '🏥' },
                'education': { name: '교육비', icon: '📚' },
                'entertainment': { name: '오락', icon: '🎮' },
                'housing': { name: '주거비', icon: '🏠' },
                'insurance': { name: '보험료', icon: '🛡️' },
                'other': { name: '기타지출', icon: '➖' }
            }
        };
        
        // 자산 유형 정의
        this.assetTypes = {
            'real_estate': {
                name: '부동산',
                icon: '🏠',
                subTypes: {
                    'apartment': '아파트',
                    'house': '주택',
                    'land': '토지',
                    'commercial': '상업용'
                }
            },
            'securities': {
                name: '증권',
                icon: '📊',
                subTypes: {
                    'stocks': '주식',
                    'bonds': '채권',
                    'funds': '펀드',
                    'etf': 'ETF'
                }
            },
            'cash': {
                name: '현금성자산',
                icon: '💰',
                subTypes: {
                    'savings': '예금',
                    'checking': '당좌',
                    'deposit': '정기예금',
                    'cash': '현금'
                }
            },
            'crypto': {
                name: '암호화폐',
                icon: '₿',
                subTypes: {
                    'bitcoin': '비트코인',
                    'ethereum': '이더리움',
                    'other': '기타코인'
                }
            },
            'commodity': {
                name: '원자재',
                icon: '🥇',
                subTypes: {
                    'gold': '금',
                    'silver': '은',
                    'oil': '원유'
                }
            },
            'other': {
                name: '기타자산',
                icon: '📦',
                subTypes: {
                    'art': '예술품',
                    'collectible': '수집품',
                    'other': '기타'
                }
            }
        };
        
        // 통화 정의
        this.currencies = {
            'KRW': { symbol: '₩', name: '원' },
            'USD': { symbol: '$', name: '달러' },
            'EUR': { symbol: '€', name: '유로' },
            'JPY': { symbol: '¥', name: '엔' },
            'CNY': { symbol: '¥', name: '위안' }
        };
    }

    // 앱 초기화
    async init() {
        try {
            //console.log('1. 데이터베이스 초기화 시작');
            // 데이터베이스 초기화
            this.dbManager = new DatabaseManager();
            await this.dbManager.init();
            //console.log('2. 데이터베이스 초기화 완료');
            
            // 앱 암호 확인
            const savedPassword = localStorage.getItem('app-password');
            if (!savedPassword) {
                // 첫 실행 - 암호 설정
                this.showPasswordSetup();
            } else {
                // 암호 확인
                this.showPasswordInput();
            }
            
            //console.log('6. Cordova 앱으로 실행 중');
            
            //console.log('7. 이벤트 리스너 설정 시작');
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            //console.log('8. 앱 초기화 모든 단계 완료');
            
        } catch (error) {
            console.error('앱 초기화 실패:', error);
            console.error('스택 트레이스:', error.stack);
            
            // 에러 발생 시 직접 에러 화면 표시
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="error-container">
                        <h2>앱 초기화 실패</h2>
                        <p>앱을 시작할 수 없습니다. 브라우저를 새로고침해주세요.</p>
                        <p style="color: #666; font-size: 0.8em;">오류: ${error.message}</p>
                        <button onclick="location.reload()" class="btn-primary">새로고침</button>
                    </div>
                `;
            }
            
            throw error; // 상위로 에러 전파
        }
    }

    // 첫 실행 시 암호 설정
    showPasswordSetup() {
        const app = document.getElementById('app');
        if (!app) {
            console.error('app 엘리먼트를 찾을 수 없습니다!');
            return;
        }
        
        app.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1>💰 Call Me Rich</h1>
                        <p>개인 가계부 앱 첫 실행 설정</p>
                    </div>
                    
                    <form id="password-setup-form" class="auth-form">
                        <div class="form-group">
                            <label>앱 접근 암호 설정 (4-6자리)</label>
                            <input type="password" id="setup-password" required minlength="4" maxlength="6" placeholder="0000" value="0000">
                            <small class="help-text">숫자 4-6자리로 설정하세요 (기본값: 0000)</small>
                        </div>
                        <div class="form-group">
                            <label>암호 확인</label>
                            <input type="password" id="setup-password-confirm" required minlength="4" maxlength="6" placeholder="0000">
                        </div>
                        <button type="submit" class="btn-primary">앱 시작하기</button>
                    </form>
                </div>
            </div>
        `;
        
        // 암호 설정 폼 이벤트 리스너
        document.getElementById('password-setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordSetup(e.target);
        });
    }

    // 암호 입력 (재실행 시)
    showPasswordInput() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1>💰 Call Me Rich</h1>
                        <p>암호를 입력하여 앱에 접근하세요</p>
                    </div>
                    
                    <form id="password-input-form" class="auth-form">
                        <div class="form-group">
                            <label>앱 접근 암호</label>
                            <input type="password" id="input-password" required minlength="4" maxlength="6" placeholder="암호 입력" autofocus>
                        </div>
                        <button type="submit" class="btn-primary">앱 열기</button>
                    </form>
                </div>
            </div>
        `;
        
        // 암호 입력 폼 이벤트 리스너
        document.getElementById('password-input-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordInput(e.target);
        });
    }

    // 암호 설정 처리
    async handlePasswordSetup(form) {
        const password = form.querySelector('#setup-password').value;
        const passwordConfirm = form.querySelector('#setup-password-confirm').value;

        if (password !== passwordConfirm) {
            this.showError('암호가 일치하지 않습니다.');
            return;
        }

        if (!/^\d{4,6}$/.test(password)) {
            this.showError('암호는 4-6자리 숫자여야 합니다.');
            return;
        }

        try {
            // 암호 저장
            localStorage.setItem('app-password', password);
            
            // 기본 사용자 생성 (개인 앱이므로 하나만)
            this.currentUser = {
                id: 'main-user',
                name: '나',
                displayName: '나',
                defaultCurrency: 'KRW'
            };

            this.showToast('앱 설정이 완료되었습니다!');
            await this.showMainApp();
            
        } catch (error) {
            console.error('암호 설정 실패:', error);
            this.showError('설정 중 오류가 발생했습니다.');
        }
    }

    // 암호 입력 처리
    async handlePasswordInput(form) {
        const inputPassword = form.querySelector('#input-password').value;
        const savedPassword = localStorage.getItem('app-password');

        if (inputPassword !== savedPassword) {
            this.showError('잘못된 암호입니다.');
            form.querySelector('#input-password').value = '';
            form.querySelector('#input-password').focus();
            return;
        }

        try {
            // 기본 사용자 설정
            this.currentUser = {
                id: 'main-user',
                name: '나',
                displayName: '나',
                defaultCurrency: 'KRW'
            };

            await this.showMainApp();
            
        } catch (error) {
            console.error('앱 로드 실패:', error);
            this.showError('앱을 열 수 없습니다.');
        }
        
        //console.log('인증 폼 HTML 렌더링 완료');
        //console.log('현재 app.innerHTML 길이:', app.innerHTML.length);
    }

    // 메인 앱 표시
    async showMainApp() {
        //console.log('메인 앱 표시 시작');
        
        // 앱 영역 초기화 - 네비게이션과 메인 컨텐츠가 포함된 전체 구조로 변경
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- 앱 네비게이션 -->
            <nav id="app-nav" class="app-navigation">
                <div class="nav-container">
                    <div class="nav-brand">
                        <span class="nav-logo">💰</span>
                        <span class="nav-title">가계부 Pro</span>
                    </div>
                    
                    <div class="nav-menu">
                        <button data-nav="dashboard" class="nav-item active">
                            <span class="nav-icon">🏠</span>
                            <span class="nav-label">대시보드</span>
                        </button>
                        
                        <button data-nav="transactions" class="nav-item">
                            <span class="nav-icon">💳</span>
                            <span class="nav-label">거래내역</span>
                        </button>
                        
                        <button data-nav="assets" class="nav-item">
                            <span class="nav-icon">🏦</span>
                            <span class="nav-label">자산관리</span>
                        </button>
                        
                        <button data-nav="reports" class="nav-item">
                            <span class="nav-icon">📊</span>
                            <span class="nav-label">리포트</span>
                        </button>
                        
                        <button data-nav="settings" class="nav-item">
                            <span class="nav-icon">⚙️</span>
                            <span class="nav-label">설정</span>
                        </button>
                    </div>
                    
                    <div class="nav-actions">
                        <!-- Cordova 앱에서는 설치 버튼 불필요 -->
                    </div>
                </div>
            </nav>

            <!-- 메인 컨텐츠 영역 -->
            <main id="main-content" class="main-content">
                <!-- 동적 컨텐츠가 여기에 로드됩니다 -->
            </main>
        `;
        
        //console.log('메인 앱 HTML 구조 생성 완료');
        
        // 기존 데이터 마이그레이션 (개인 앱 전환)
        await this.migrateExistingData();
        
        // 대시보드로 이동
        this.navigateTo('dashboard');
        
        //console.log('메인 앱 표시 완료');
    }

    // 기존 데이터 마이그레이션 (개인 앱 전환)
    async migrateExistingData() {
        try {
            // 마이그레이션이 이미 완료되었는지 확인
            const migrationCompleted = localStorage.getItem('data-migration-completed');
            if (migrationCompleted === 'true') {
                return;
            }

            console.log('기존 데이터 마이그레이션 시작...');

            // 기존 account_users 확인 또는 생성
            let accountUsers = await this.dbManager.getAllAccountUsers();
            if (accountUsers.length === 0) {
                // 기본 사용자 생성
                const defaultUser = await this.dbManager.addAccountUser({
                    name: '나',
                    relationship: '본인'
                });
                accountUsers = [defaultUser];
                console.log('기본 사용자를 생성했습니다.');
            }
            
            const defaultUserId = accountUsers[0].id;
            console.log('기본 사용자 ID:', defaultUserId);

            // 기존 거래내역 데이터 마이그레이션
            const transactions = await this.dbManager.getAllTransactions();
            if (transactions.length > 0) {
                console.log(`${transactions.length}개의 거래내역을 마이그레이션합니다.`);
                for (const transaction of transactions) {
                    const updateData = { ...transaction };
                    // userId 필드 제거
                    delete updateData.userId;
                    // accountUserId가 없으면 기본 사용자로 설정
                    if (!updateData.accountUserId) {
                        updateData.accountUserId = defaultUserId;
                    }
                    await this.dbManager.updateTransactionForMigration(transaction.id, updateData);
                }
            }

            // 기존 자산 데이터 마이그레이션
            const assets = await this.dbManager.getAllAssets();
            if (assets.length > 0) {
                console.log(`${assets.length}개의 자산을 마이그레이션합니다.`);
                for (const asset of assets) {
                    const updateData = { ...asset };
                    // userId 필드 제거
                    delete updateData.userId;
                    // accountUserId가 없으면 기본 사용자로 설정
                    if (!updateData.accountUserId) {
                        updateData.accountUserId = defaultUserId;
                    }
                    await this.dbManager.updateAssetForMigration(asset.id, updateData);
                }
            }

            // 기존 계정 데이터 마이그레이션
            const accounts = await this.dbManager.getAllAccounts();
            if (accounts.length > 0) {
                console.log(`${accounts.length}개의 계정을 마이그레이션합니다.`);
                for (const account of accounts) {
                    const updateData = { ...account };
                    // userId 필드 제거 (계정은 공통으로 사용)
                    delete updateData.userId;
                    await this.dbManager.updateAccountForMigration(account.id, updateData);
                }
            }

            // 기존 예산 데이터 마이그레이션
            const budgets = await this.dbManager.getAllBudgets();
            if (budgets.length > 0) {
                console.log(`${budgets.length}개의 예산을 마이그레이션합니다.`);
                for (const budget of budgets) {
                    const updateData = { ...budget };
                    // userId 필드 제거 (예산은 공통으로 사용)
                    delete updateData.userId;
                    await this.dbManager.updateBudgetForMigration(budget.id, updateData);
                }
            }

            // 마이그레이션 완료 표시
            localStorage.setItem('data-migration-completed', 'true');
            console.log('데이터 마이그레이션 완료');

            // 사용자에게 알림
            if (transactions.length > 0 || assets.length > 0 || accounts.length > 0 || budgets.length > 0) {
                this.showToast('기존 데이터를 개인 앱으로 성공적으로 변환했습니다.');
            }

        } catch (error) {
            console.error('데이터 마이그레이션 실패:', error);
            this.showError('기존 데이터 변환 중 오류가 발생했습니다.');
        }
    }

    // 네비게이션 처리
    async navigateTo(view) {
        this.currentView = view;
        
        // 네비게이션 활성 상태 업데이트
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.nav === view) {
                item.classList.add('active');
            }
        });
        
        // 뷰 렌더링
        const mainContent = document.getElementById('main-content');
        switch (view) {
            case 'dashboard':
                mainContent.innerHTML = await this.renderDashboard();
                break;
            case 'transactions':
                mainContent.innerHTML = await this.renderTransactions();
                break;
            case 'assets':
                mainContent.innerHTML = await this.renderAssets();
                break;
            case 'reports':
                mainContent.innerHTML = await this.renderReports();
                break;
            case 'settings':
                mainContent.innerHTML = this.renderSettings();
                break;
        }
    }

    // 대시보드 렌더링
    async renderDashboard() {
        const html = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>재정 현황 대시보드</h1>
                    <p>전체 가계 재정 상황을 한눈에 확인하세요</p>
                </div>
                
                <div class="dashboard-actions">
                    <button class="action-btn" onclick="budgetApp.showAddTransactionModal()">
                        <span class="btn-icon">💳</span>
                        거래 추가
                    </button>
                    <button class="action-btn" onclick="budgetApp.showAddAssetModal()">
                        <span class="btn-icon">🏦</span>
                        자산 추가
                    </button>
                </div>
                
                <div class="user-summaries" id="user-summaries">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>사용자별 요약 로딩 중...</p>
                    </div>
                </div>
            </div>
        `;
        
        // 렌더링 후 데이터 로드
        setTimeout(() => this.loadUserSummaries(), 100);
        
        return html;
    }

    // 사용자별 요약 데이터 로드
    async loadUserSummaries() {
        try {
            const users = await this.dbManager.getAllAccountUsers();
            const summaryContainer = document.getElementById('user-summaries');
            
            if (!summaryContainer) return;
            
            // 전체 사용자 합계 데이터 생성
            const overallSummary = await this.generateOverallSummary();
            
            // 개별 사용자 요약 생성
            const userSummaries = await Promise.all(
                users.map(user => this.generateUserSummary(user))
            );
            
            // 전체 요약을 맨 위에, 그 다음 개별 사용자 요약 표시
            summaryContainer.innerHTML = overallSummary + userSummaries.join('');
            
        } catch (error) {
            console.error('사용자 요약 로드 실패:', error);
            const summaryContainer = document.getElementById('user-summaries');
            if (summaryContainer) {
                summaryContainer.innerHTML = '<p class="error-message">데이터를 불러올 수 없습니다.</p>';
            }
        }
    }

    // 전체 사용자 합계 요약 생성
    async generateOverallSummary() {
        try {
            // 모든 거래 및 자산 데이터 가져오기 (필터 없이)
            const allTransactions = await this.dbManager.getTransactions();
            const allAssets = await this.dbManager.getAssets();
            
            // 전체 자산 합계
            const totalAssets = allAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
            
            // 전체 거래 데이터 합계
            const totalIncome = allTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const totalExpense = allTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const totalBalance = totalIncome - totalExpense;
            
            // 올해 월별 데이터 계산
            const now = new Date();
            const currentYear = now.getFullYear();
            const monthlyData = [];
            
            for (let month = 1; month <= 12; month++) {
                const monthStr = `${currentYear}-${String(month).padStart(2, '0')}`;
                const monthTransactions = allTransactions.filter(t => 
                    t.date.startsWith(monthStr)
                );
                
                const monthIncome = monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                    
                const monthExpense = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                monthlyData.push({
                    month: month,
                    monthName: `${month}월`,
                    income: monthIncome,
                    expense: monthExpense,
                    balance: monthIncome - monthExpense,
                    transactionCount: monthTransactions.length
                });
            }
            
            // 이번 달 거래 데이터  
            const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            const thisMonthTransactions = allTransactions.filter(t => 
                t.date.startsWith(currentMonth)
            );
            
            const monthlyIncome = thisMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const monthlyExpense = thisMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const monthlyBalance = monthlyIncome - monthlyExpense;
            
            // 지난 달과 비교를 위한 데이터
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
            
            const lastMonthTransactions = allTransactions.filter(t => 
                t.date.startsWith(lastMonthStr)
            );
            
            const lastMonthExpense = lastMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const expenseChange = lastMonthExpense > 0 ? 
                ((monthlyExpense - lastMonthExpense) / lastMonthExpense * 100) : 0;
            
            return `
                <div class="user-summary-card overall-summary">
                    <div class="monthly-chart-section">
                        <div class="monthly-header">
                            <h4>📊 전체 데이터 요약</h4>
                            <div class="view-toggle">
                                <button class="toggle-btn active" data-view="table" onclick="budgetApp.toggleMonthlyView('overall', 'table')">
                                    📊 표
                                </button>
                                <button class="toggle-btn" data-view="chart" onclick="budgetApp.toggleMonthlyView('overall', 'chart')">
                                    📈 그래프
                                </button>
                            </div>
                        </div>
                        <div class="monthly-content" id="monthly-content-overall">
                            ${this.generateMonthlyTable(monthlyData, {name: '전체'})}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('전체 요약 생성 실패:', error);
            return '<div class="user-summary-card error"><p>전체 요약 데이터를 불러올 수 없습니다.</p></div>';
        }
    }

    // 개별 사용자 요약 생성
    async generateUserSummary(user) {
        try {
            // 사용자별 데이터 필터 (정확한 필드명 사용)
            const transactionFilters = { accountUserId: user.id };
            const assetFilters = { accountUserId: user.id };
            
            // 자산 데이터
            const assets = await this.dbManager.getAssets(null, assetFilters);
            const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
            
            // 거래 데이터
            const transactions = await this.dbManager.getTransactions(null, transactionFilters);
            
            // 전체 거래 데이터 합계
            const totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const totalExpense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const totalBalance = totalIncome - totalExpense;
            
            // 올해 월별 데이터 계산
            const now = new Date();
            const currentYear = now.getFullYear();
            const monthlyData = [];
            
            for (let month = 1; month <= 12; month++) {
                const monthStr = `${currentYear}-${String(month).padStart(2, '0')}`;
                const monthTransactions = transactions.filter(t => 
                    t.date.startsWith(monthStr)
                );
                
                const monthIncome = monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                    
                const monthExpense = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                monthlyData.push({
                    month: month,
                    monthName: `${month}월`,
                    income: monthIncome,
                    expense: monthExpense,
                    balance: monthIncome - monthExpense,
                    transactionCount: monthTransactions.length
                });
            }
            
            // 이번 달 거래 데이터  
            const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            const thisMonthTransactions = transactions.filter(t => 
                t.date.startsWith(currentMonth)
            );
            
            const monthlyIncome = thisMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const monthlyExpense = thisMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const monthlyBalance = monthlyIncome - monthlyExpense;
            
            // 지난 달과 비교를 위한 데이터
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
            
            const lastMonthTransactions = transactions.filter(t => 
                t.date.startsWith(lastMonthStr)
            );
            
            const lastMonthIncome = lastMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const lastMonthExpense = lastMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            // 증감률 계산
            const incomeChange = lastMonthIncome > 0 ? 
                ((monthlyIncome - lastMonthIncome) / lastMonthIncome * 100) : 0;
            const expenseChange = lastMonthExpense > 0 ? 
                ((monthlyExpense - lastMonthExpense) / lastMonthExpense * 100) : 0;
            
            return `
                <div class="user-summary-card">
                    <div class="user-header">
                        <div class="user-info">
                            <h3>${user.name}</h3>
                            <p class="user-relationship">${user.relationship || '가족 구성원'}</p>
                        </div>
                        <div class="user-status ${monthlyBalance >= 0 ? 'positive' : 'negative'}">
                            ${monthlyBalance >= 0 ? '📈' : '📉'}
                        </div>
                    </div>
                    
                    <div class="financial-overview">
                        <div class="overview-item assets">
                            <div class="overview-icon">💰</div>
                            <div class="overview-data">
                                <h4>총 자산</h4>
                                <p class="amount">${this.formatCurrency(totalAssets, this.currentUser.defaultCurrency)}</p>
                                <span class="asset-count">${assets.length}개 자산</span>
                            </div>
                        </div>
                        
                        <div class="overview-item transactions">
                            <div class="overview-icon">💸</div>
                            <div class="overview-data">
                                <h4>전체 수지</h4>
                                <div class="transaction-summary">
                                    <div class="income-expense-row">
                                        <span class="income-part">
                                            📈 ${this.formatCurrency(totalIncome, this.currentUser.defaultCurrency)}
                                        </span>
                                        <span class="divider">-</span>
                                        <span class="expense-part">
                                            📉 ${this.formatCurrency(totalExpense, this.currentUser.defaultCurrency)}
                                        </span>
                                    </div>
                                    <div class="balance-result ${totalBalance >= 0 ? 'profit' : 'loss'}">
                                        ${totalBalance >= 0 ? '💚' : '❤️'} ${totalBalance >= 0 ? '+' : ''}${this.formatCurrency(totalBalance, this.currentUser.defaultCurrency)}
                                        <span class="balance-status">(${totalBalance >= 0 ? '흑자' : '적자'})</span>
                                    </div>
                                    <div class="transactions-count">총 ${transactions.length}건의 거래</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="monthly-chart-section">
                            <div class="monthly-header">
                                <h4>📈 ${currentYear}년 월별 수입/지출 현황</h4>
                                <div class="view-toggle">
                                    <button class="toggle-btn active" data-view="table" onclick="budgetApp.toggleMonthlyView('${user.id}', 'table')">
                                        📊 표
                                    </button>
                                    <button class="toggle-btn" data-view="chart" onclick="budgetApp.toggleMonthlyView('${user.id}', 'chart')">
                                        📈 그래프
                                    </button>
                                </div>
                            </div>
                            <div class="monthly-content" id="monthly-content-${user.id}">
                                ${this.generateMonthlyTable(monthlyData, user)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`사용자 ${user.name} 요약 생성 실패:`, error);
            return `
                <div class="user-summary-card error">
                    <div class="user-header">
                        <h3>${user.name}</h3>
                        <p class="error-message">데이터 로드 실패</p>
                    </div>
                </div>
            `;
        }
    }

    // 월별 표 생성
    generateMonthlyTable(monthlyData, user) {
        if (monthlyData.every(m => m.transactionCount === 0)) {
            return '<div class="no-data">이번 년도 거래 데이터가 없습니다.</div>';
        }
        
        return `
            <div class="monthly-table">
                <table class="monthly-data-table">
                    <thead>
                        <tr>
                            <th>월</th>
                            <th>수입</th>
                            <th>지출</th>
                            <th>순손익</th>
                            <th>거래건수</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monthlyData.map(data => `
                            <tr class="month-row ${data.transactionCount === 0 ? 'empty-month' : ''}" 
                                ${data.transactionCount > 0 ? `onclick="budgetApp.navigateToMonthTransactions(${data.month}, ${user.id === undefined ? 'null' : `'${user.id}'`})" style="cursor: pointer;"` : ''}>
                                <td class="month-cell clickable-month">${data.monthName}</td>
                                <td class="income-cell">
                                    ${data.income > 0 ? 
                                        `<span class="amount income">+${this.formatCurrency(data.income, this.currentUser.defaultCurrency)}</span>` : 
                                        '<span class="amount-zero">-</span>'
                                    }
                                </td>
                                <td class="expense-cell">
                                    ${data.expense > 0 ? 
                                        `<span class="amount expense">-${this.formatCurrency(data.expense, this.currentUser.defaultCurrency)}</span>` : 
                                        '<span class="amount-zero">-</span>'
                                    }
                                </td>
                                <td class="balance-cell">
                                    ${data.transactionCount > 0 ? 
                                        `<span class="amount balance ${data.balance >= 0 ? 'positive' : 'negative'}">
                                            ${data.balance >= 0 ? '+' : ''}${this.formatCurrency(data.balance, this.currentUser.defaultCurrency)}
                                        </span>` : 
                                        '<span class="amount-zero">-</span>'
                                    }
                                </td>
                                <td class="count-cell">
                                    <span class="transaction-count-badge">${data.transactionCount}건</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td><strong>합계</strong></td>
                            <td class="income-cell">
                                <span class="amount income total">
                                    +${this.formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0), this.currentUser.defaultCurrency)}
                                </span>
                            </td>
                            <td class="expense-cell">
                                <span class="amount expense total">
                                    -${this.formatCurrency(monthlyData.reduce((sum, m) => sum + m.expense, 0), this.currentUser.defaultCurrency)}
                                </span>
                            </td>
                            <td class="balance-cell">
                                <span class="amount balance total ${monthlyData.reduce((sum, m) => sum + m.balance, 0) >= 0 ? 'positive' : 'negative'}">
                                    ${monthlyData.reduce((sum, m) => sum + m.balance, 0) >= 0 ? '+' : ''}${this.formatCurrency(monthlyData.reduce((sum, m) => sum + m.balance, 0), this.currentUser.defaultCurrency)}
                                </span>
                            </td>
                            <td class="count-cell">
                                <span class="transaction-count-badge total">
                                    ${monthlyData.reduce((sum, m) => sum + m.transactionCount, 0)}건
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    // 월별 차트 생성
    generateMonthlyChart(monthlyData, user) {
        // 최대값 계산 (차트 스케일링용)
        const maxAmount = Math.max(
            ...monthlyData.map(m => Math.max(m.income, m.expense))
        );
        
        if (maxAmount === 0) {
            return '<div class="no-data">이번 년도 거래 데이터가 없습니다.</div>';
        }
        
        return `
            <div class="monthly-chart horizontal">
                <div class="chart-legend">
                    <span class="legend-item income">📈 수입</span>
                    <span class="legend-item expense">📉 지출</span>
                    <span class="legend-item balance">💰 순손익</span>
                </div>
                <div class="chart-rows">
                    ${monthlyData.map(data => `
                        <div class="month-row ${data.transactionCount > 0 ? 'clickable-month-row' : ''}" 
                             ${data.transactionCount > 0 ? `onclick="budgetApp.navigateToMonthTransactions(${data.month}, ${user.id === undefined ? 'null' : `'${user.id}'`})" style="cursor: pointer;"` : ''}>
                            <div class="month-label">${data.monthName}</div>
                            <div class="bars-container">
                                <div class="income-bar" style="width: ${data.income > 0 ? (data.income / maxAmount * 100) : 0}%" 
                                     title="수입: ${this.formatCurrency(data.income, this.currentUser.defaultCurrency)}">
                                    <span class="bar-text">${data.income > 0 ? this.formatCurrency(data.income, this.currentUser.defaultCurrency, true) : ''}</span>
                                </div>
                                <div class="expense-bar" style="width: ${data.expense > 0 ? (data.expense / maxAmount * 100) : 0}%" 
                                     title="지출: ${this.formatCurrency(data.expense, this.currentUser.defaultCurrency)}">
                                    <span class="bar-text">${data.expense > 0 ? this.formatCurrency(data.expense, this.currentUser.defaultCurrency, true) : ''}</span>
                                </div>
                            </div>
                            <div class="month-summary">
                                <div class="balance-indicator ${data.balance >= 0 ? 'positive' : 'negative'}">
                                    ${data.balance >= 0 ? '+' : ''}${this.formatCurrency(data.balance, this.currentUser.defaultCurrency, true)}
                                </div>
                                <div class="transaction-count">${data.transactionCount}건</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 월별 뷰 토글 (표/그래프)
    async toggleMonthlyView(userId, viewType) {
        try {
            let transactions, user, contentContainer;
            
            if (userId === 'overall') {
                // 전체 데이터의 경우
                transactions = await this.dbManager.getTransactions();
                user = {name: '전체'};
                contentContainer = document.getElementById('monthly-content-overall');
            } else {
                // 개별 사용자의 경우
                const transactionFilters = { accountUserId: userId };
                transactions = await this.dbManager.getTransactions(null, transactionFilters);
                const users = await this.dbManager.getAllAccountUsers();
                user = users.find(u => u.id === userId);
                contentContainer = document.getElementById(`monthly-content-${userId}`);
            }
            
            // 올해 월별 데이터 계산
            const now = new Date();
            const currentYear = now.getFullYear();
            const monthlyData = [];
            
            for (let month = 1; month <= 12; month++) {
                const monthStr = `${currentYear}-${String(month).padStart(2, '0')}`;
                const monthTransactions = transactions.filter(t => 
                    t.date.startsWith(monthStr)
                );
                
                const monthIncome = monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                    
                const monthExpense = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                monthlyData.push({
                    month: month,
                    monthName: `${month}월`,
                    income: monthIncome,
                    expense: monthExpense,
                    balance: monthIncome - monthExpense,
                    transactionCount: monthTransactions.length
                });
            }
            
            // 컨텐츠 업데이트
            if (contentContainer && user) {
                if (viewType === 'table') {
                    contentContainer.innerHTML = this.generateMonthlyTable(monthlyData, user);
                } else {
                    contentContainer.innerHTML = this.generateMonthlyChart(monthlyData, user);
                }
            }
            
            // 토글 버튼 상태 업데이트
            const toggleContainer = userId === 'overall' ? 
                document.querySelector('.overall-summary .view-toggle') :
                document.querySelector(`#monthly-content-${userId}`).closest('.monthly-chart-section').querySelector('.view-toggle');
                
            if (toggleContainer) {
                const toggleButtons = toggleContainer.querySelectorAll('.toggle-btn');
                toggleButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.view === viewType) {
                        btn.classList.add('active');
                    }
                });
            }
            
        } catch (error) {
            console.error('월별 뷰 전환 실패:', error);
            this.showError('뷰 전환 중 오류가 발생했습니다.');
        }
    }

    // 월별 거래내역으로 이동
    navigateToMonthTransactions(month, userId = null) {
        // 현재 연도와 선택된 월로 날짜 범위 설정
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-${String(month).padStart(2, '0')}-01`;
        
        // 해당 월의 마지막 날 계산
        const lastDay = new Date(currentYear, month, 0).getDate();
        const endDate = `${currentYear}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        
        // 사용자 ID 처리 - 전체 요약에서는 전체 데이터 조회
        let filterUserId = null;
        if (userId && userId !== 'overall') {
            filterUserId = userId;
        } else if (!userId) {
            filterUserId = this.selectedAccountUserId === 'all' ? null : this.selectedAccountUserId;
        }
        
        // 월별 필터 정보 저장
        this.pendingMonthFilter = {
            startDate: startDate,
            endDate: endDate,
            month: month,
            userId: filterUserId
        };
        
        // 거래내역 페이지로 이동
        this.navigateTo('transactions');
    }

    // 월별 필터 설정
    setMonthFilter(startDate, endDate, month) {
        try {
            // 날짜 필터 설정
            const dateFromElement = document.getElementById('filter-date-from');
            const dateToElement = document.getElementById('filter-date-to');
            
            if (dateFromElement && dateToElement) {
                dateFromElement.value = startDate;
                dateToElement.value = endDate;
                
                // 필터 적용
                this.applyFilters();
                
                // 사용자에게 알림
                this.showToast(`${month}월 거래내역을 조회합니다.`, 'info');
            }
        } catch (error) {
            console.error('월별 필터 설정 실패:', error);
            this.showError('필터 설정 중 오류가 발생했습니다.');
        }
    }

    // 대기 중인 월별 필터 적용
    applyPendingMonthFilter() {
        try {
            if (!this.pendingMonthFilter) return;
            
            const { startDate, endDate, month, userId } = this.pendingMonthFilter;
            
            // 사용자 필터 설정
            if (userId) {
                this.selectedAccountUserId = userId;
            } else {
                // 전체 데이터 조회 시 'all' 설정
                this.selectedAccountUserId = 'all';
            }
            
            // 사용자 선택 드롭다운 업데이트
            const userSelectElement = document.getElementById('account-user-select');
            if (userSelectElement) {
                userSelectElement.value = this.selectedAccountUserId;
            }
            
            // 날짜 필터 설정
            const dateFromElement = document.getElementById('filter-date-from');
            const dateToElement = document.getElementById('filter-date-to');
            
            if (dateFromElement && dateToElement) {
                dateFromElement.value = startDate;
                dateToElement.value = endDate;
                
                // 필터 적용하여 거래내역 로드
                this.applyFilters();
                
                // 사용자 이름 가져오기 및 알림 표시
                if (userId && userId !== 'all') {
                    // 사용자 정보 찾기
                    this.dbManager.getAllAccountUsers().then(users => {
                        const user = users.find(u => u.id === userId);
                        const userDisplayName = user ? user.name : '선택된 사용자';
                        this.showToast(`${userDisplayName}의 ${month}월 거래내역을 조회합니다.`, 'info');
                    });
                } else {
                    this.showToast(`${month}월 전체 거래내역을 조회합니다.`, 'info');
                }
                
                // 필터 정보 초기화
                this.pendingMonthFilter = null;
            }
        } catch (error) {
            console.error('월별 필터 적용 실패:', error);
            this.showError('필터 적용 중 오류가 발생했습니다.');
            // 오류 시 기본 로드 수행
            this.setDefaultDateFilters();
            this.loadTransactions();
        }
    }

    // 필터링 알림 표시
    showFilterNotification(filteredCounts) {
        const existingNotification = document.querySelector('.filter-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        if (filteredCounts.includedTransactions !== filteredCounts.totalTransactions ||
            filteredCounts.includedAssets !== filteredCounts.totalAssets) {
            
            const notification = document.createElement('div');
            notification.className = 'filter-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">ℹ️</span>
                    <div class="notification-text">
                        <strong>필터링된 데이터 표시 중</strong><br>
                        거래: ${filteredCounts.includedTransactions}/${filteredCounts.totalTransactions}개, 
                        자산: ${filteredCounts.includedAssets}/${filteredCounts.totalAssets}개가 포함됨
                        <a href="#" onclick="budgetApp.navigateTo('settings')" class="settings-link">설정에서 변경</a>
                    </div>
                    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
                </div>
            `;

            const dashboardContainer = document.querySelector('.dashboard-container');
            if (dashboardContainer) {
                dashboardContainer.insertBefore(notification, dashboardContainer.firstChild);
            }
        }
    }

    // 거래내역 렌더링
    async renderTransactions() {
        // 카테고리 옵션 생성
        const categoryOptions = this.generateCategoryOptions();
        
        // 사용자 선택기 생성
        const userSelector = await this.generateUserSelector();
        
        const html = `
            <div class="transactions-container">
                <div class="section-header">
                    <h1>거래내역</h1>
                    <button class="btn-primary" onclick="budgetApp.showAddTransactionModal()">
                        + 거래추가
                    </button>
                </div>
                
                ${userSelector}
                
                <div class="filters-container">
                    <div class="filter-group">
                        <select id="filter-type">
                            <option value="">모든 유형</option>
                            <option value="income">수입</option>
                            <option value="expense">지출</option>
                        </select>
                        
                        <select id="filter-category">
                            <option value="">모든 카테고리</option>
                            ${categoryOptions}
                        </select>
                        
                        <input type="date" id="filter-date-from" placeholder="시작일">
                        <input type="date" id="filter-date-to" placeholder="종료일">
                        
                        <button class="btn-primary" onclick="budgetApp.applyFilters()">필터 적용</button>
                        <button class="btn-secondary" onclick="budgetApp.clearFilters()">초기화</button>
                        
                        <select id="sort-option" onchange="budgetApp.applySorting()">
                            <option value="date-desc">거래일자 ↓ (최신순)</option>
                            <option value="date-asc">거래일자 ↑ (과거순)</option>
                            <option value="amount-desc">금액 ↓ (높은순)</option>
                            <option value="amount-asc">금액 ↑ (낮은순)</option>
                        </select>
                    </div>
                </div>
                
                <div class="transactions-list">
                    로딩 중...
                </div>
            </div>
        `;
        
        // 렌더링 후 데이터 로드 및 필터 설정
        setTimeout(() => {
            // 월별 필터가 있으면 적용, 없으면 기본 필터 설정
            if (this.pendingMonthFilter) {
                this.applyPendingMonthFilter();
            } else {
                this.setDefaultDateFilters();
                this.loadTransactions();
            }
        }, 100);
        
        return html;
    }

    // 날짜 필터 기본값 설정 (전체 조회를 위해 빈 값으로 설정)
    setDefaultDateFilters() {
        // 날짜 필터를 빈 값으로 설정하여 전체 조회
        const dateFromElement = document.getElementById('filter-date-from');
        const dateToElement = document.getElementById('filter-date-to');
        
        if (dateFromElement) dateFromElement.value = '';
        if (dateToElement) dateToElement.value = '';
    }

    // 카테고리 옵션 생성
    generateCategoryOptions() {
        let options = '';
        
        // 수입 카테고리
        Object.entries(this.transactionCategories.income).forEach(([key, value]) => {
            options += `<option value="${key}">${value.icon} ${value.name} (수입)</option>`;
        });
        
        // 지출 카테고리
        Object.entries(this.transactionCategories.expense).forEach(([key, value]) => {
            options += `<option value="${key}">${value.icon} ${value.name} (지출)</option>`;
        });
        
        return options;
    }

    // 거래 내역 로드
    async loadTransactions() {
        try {
            const filters = {};
            
            // 사용자 필터
            if (this.selectedAccountUserId && this.selectedAccountUserId !== 'all') {
                filters.accountUserId = this.selectedAccountUserId;
            }
            
            // 날짜 필터 (필터 요소가 존재하는 경우)
            const dateFromElement = document.getElementById('filter-date-from');
            const dateToElement = document.getElementById('filter-date-to');
            
            if (dateFromElement && dateFromElement.value) {
                filters.dateFrom = dateFromElement.value;
            }
            if (dateToElement && dateToElement.value) {
                filters.dateTo = dateToElement.value;
            }
            
            const transactions = await this.dbManager.getTransactions(null, filters);
            
            // 현재 정렬 옵션 적용
            const sortOption = document.getElementById('sort-option')?.value || 'date-desc';
            const sortedTransactions = this.sortTransactions(transactions, sortOption);
            
            const transactionsList = document.querySelector('.transactions-list');
            if (transactionsList) {
                transactionsList.innerHTML = await this.renderTransactionsList(sortedTransactions);
            }
        } catch (error) {
            console.error('거래 내역 로드 실패:', error);
            const transactionsList = document.querySelector('.transactions-list');
            if (transactionsList) {
                transactionsList.innerHTML = '<p class="no-data">거래 내역을 불러올 수 없습니다.</p>';
            }
        }
    }

    // 거래 내역 목록 렌더링
    async renderTransactionsList(transactions) {
        if (!transactions || transactions.length === 0) {
            return '<div class="no-data">거래 내역이 없습니다.</div>';
        }

        // account_users 테이블에서 실제 사용자 정보 가져오기
        const accountUsers = await this.dbManager.getAllAccountUsers();
        const userMap = {};
        accountUsers.forEach(user => {
            userMap[user.id] = user;
        });

        return transactions.map(transaction => {
            const category = this.transactionCategories[transaction.type]?.[transaction.category];
            const categoryIcon = category?.icon || '💰';
            const categoryName = category?.name || transaction.category;
            
            const amount = transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount);
            const amountClass = transaction.type === 'income' ? 'income' : 'expense';
            const formattedAmount = this.formatCurrency(amount, transaction.currency);
            
            const createdDate = new Date(transaction.createdAt || transaction.date).toLocaleDateString('ko-KR');
            const createdTime = new Date(transaction.createdAt || transaction.date).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
            
            // accountUserId를 사용하여 실제 사용자 정보 매핑
            const user = userMap[transaction.accountUserId];
            const userInfo = user ? `${user.name}${user.relationship ? ` (${user.relationship})` : ''}` : '미지정';
            
            return `
                <div class="transaction-item" style="cursor: pointer;">
                    <div class="transaction-icon">${categoryIcon}</div>
                    <div class="transaction-info">
                        <h4>${transaction.description}</h4>
                        <p>${categoryName} • ${transaction.date}</p>
                        <p class="transaction-user">👤 ${userInfo}</p>
                        <p class="transaction-created">입력일: ${createdDate} ${createdTime}</p>
                        ${transaction.notes ? `<p class="transaction-notes">${transaction.notes}</p>` : ''}
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${formattedAmount}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); budgetApp.showEditTransactionModal('${transaction.id}')" title="수정">✏️</button>
                        <button class="btn-icon btn-danger" onclick="event.stopPropagation(); budgetApp.deleteTransaction('${transaction.id}')" title="삭제">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 자산관리 렌더링
    async renderAssets() {
        // 사용자 선택기 생성
        const userSelector = await this.generateUserSelector();
        
        const html = `
            <div class="assets-container">
                <div class="section-header">
                    <h1>자산관리</h1>
                    <button class="btn-primary" onclick="budgetApp.showAddAssetModal()">
                        + 자산추가
                    </button>
                </div>
                
                ${userSelector}
                
                <div class="assets-overview">
                    <div class="asset-summary">
                        <h2>자산 포트폴리오</h2>
                        <div class="portfolio-stats" id="portfolio-stats">
                            계산 중...
                        </div>
                    </div>
                </div>
                
                <div class="assets-list" id="assets-list">
                    로딩 중...
                </div>
            </div>
        `;
        
        // 렌더링 후 데이터 로드
        setTimeout(() => this.loadAssets(), 100);
        
        return html;
    }

    // 자산 목록 로드
    async loadAssets() {
        try {
            //console.log('자산 목록 로딩 시작');
            
            const filters = {};
            if (this.selectedAccountUserId && this.selectedAccountUserId !== 'all') {
                filters.accountUserId = this.selectedAccountUserId;
            }
            
            const assets = await this.dbManager.getAssets(null, filters);
            //console.log('로드된 자산:', assets);
            
            const assetsList = document.getElementById('assets-list');
            const portfolioStats = document.getElementById('portfolio-stats');
            
            if (assetsList) {
                assetsList.innerHTML = this.renderAssetsList(assets);
            }
            
            if (portfolioStats) {
                portfolioStats.innerHTML = this.renderPortfolioStats(assets);
            }
            
        } catch (error) {
            console.error('자산 목록 로드 실패:', error);
            const assetsList = document.getElementById('assets-list');
            if (assetsList) {
                assetsList.innerHTML = '<p class="no-data">자산 목록을 불러올 수 없습니다.</p>';
            }
        }
    }

    // 자산 목록 렌더링
    renderAssetsList(assets) {
        if (!assets || assets.length === 0) {
            return `
                <div class="no-data">
                    <h3>등록된 자산이 없습니다</h3>
                    <p>자산을 추가하여 포트폴리오를 관리해보세요.</p>
                    <button class="btn-primary" onclick="budgetApp.showAddAssetModal()">
                        첫 자산 추가하기
                    </button>
                </div>
            `;
        }

        return assets.map(asset => {
            const assetType = this.assetTypes[asset.type];
            const profitLoss = asset.currentValue - (asset.purchasePrice || asset.currentValue);
            const profitLossPercent = asset.purchasePrice ? 
                ((profitLoss / asset.purchasePrice) * 100).toFixed(2) : 0;
            
            return `
                <div class="asset-item">
                    <div class="asset-icon">
                        ${assetType ? assetType.icon : '💰'}
                    </div>
                    <div class="asset-info">
                        <h4>${asset.name}</h4>
                        <p>${assetType ? assetType.name : '기타'} ${asset.subType ? `• ${asset.subType}` : ''}</p>
                        <p class="asset-details">
                            ${asset.quantity} ${asset.unit || '개'} 
                            ${asset.location ? `• ${asset.location}` : ''}
                        </p>
                    </div>
                    <div class="asset-values">
                        <div class="asset-value">
                            ${this.formatCurrency(asset.currentValue, asset.currency)}
                        </div>
                        <div class="asset-profit-loss ${profitLoss >= 0 ? 'profit' : 'loss'}">
                            ${profitLoss >= 0 ? '+' : ''}${this.formatCurrency(profitLoss, asset.currency)}
                            (${profitLossPercent}%)
                        </div>
                    </div>
                    <div class="asset-actions">
                        <button class="btn-icon" onclick="budgetApp.showEditAssetModal('${asset.id}')" title="수정">
                            ✏️
                        </button>
                        <button class="btn-icon btn-danger" onclick="budgetApp.deleteAsset('${asset.id}')" title="삭제">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 포트폴리오 통계 렌더링
    renderPortfolioStats(assets) {
        if (!assets || assets.length === 0) {
            return '<p>자산을 추가하면 포트폴리오 통계가 표시됩니다.</p>';
        }

        const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
        const totalCost = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);
        const totalProfit = totalValue - totalCost;
        const totalProfitPercent = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : 0;

        // 자산 유형별 분포
        const typeDistribution = {};
        assets.forEach(asset => {
            const typeName = this.assetTypes[asset.type]?.name || '기타';
            typeDistribution[typeName] = (typeDistribution[typeName] || 0) + asset.currentValue;
        });

        return `
            <div class="portfolio-overview">
                <div class="portfolio-total">
                    <h3>총 자산 가치</h3>
                    <div class="total-value">${this.formatCurrency(totalValue, this.currentUser.defaultCurrency)}</div>
                    <div class="total-profit ${totalProfit >= 0 ? 'profit' : 'loss'}">
                        ${totalProfit >= 0 ? '+' : ''}${this.formatCurrency(totalProfit, this.currentUser.defaultCurrency)}
                        (${totalProfitPercent}%)
                    </div>
                </div>
                
                <div class="portfolio-distribution">
                    <h4>자산 분포</h4>
                    ${Object.entries(typeDistribution).map(([type, value]) => {
                        const percentage = ((value / totalValue) * 100).toFixed(1);
                        return `
                            <div class="distribution-item">
                                <span>${type}</span>
                                <span>${this.formatCurrency(value, this.currentUser.defaultCurrency)} (${percentage}%)</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // 리포트 렌더링
    async renderReports() {
        // 사용자 목록 가져오기
        const users = await this.dbManager.getAllAccountUsers();
        const userOptions = users.map(user => 
            `<option value="${user.id}" ${user.id === this.currentUser.id ? 'selected' : ''}>
                ${user.name}${user.relationship ? ` (${user.relationship})` : ''}
            </option>`
        ).join('');

        const html = `
            <div class="reports-container">
                <div class="section-header">
                    <h1>리포트</h1>
                </div>
                
                <div class="report-filters">
                    <div class="filter-group">
                        <label>👤 사용자별 보기:</label>
                        <select id="report-user-filter" onchange="budgetApp.updateReportUser()">
                            <option value="all">전체 사용자</option>
                            ${userOptions}
                        </select>
                    </div>
                </div>
                
                <div class="report-navigation">
                    <button class="report-tab active" data-report="monthly" onclick="budgetApp.showReport('monthly')">
                        📊 월별 수지 분석
                    </button>
                    <button class="report-tab" data-report="category" onclick="budgetApp.showReport('category')">
                        🍽️ 카테고리별 지출
                    </button>
                    <button class="report-tab" data-report="assets" onclick="budgetApp.showReport('assets')">
                        📈 자산 수익률
                    </button>
                </div>
                
                <div id="report-content" class="report-content">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>리포트 로딩 중...</p>
                    </div>
                </div>
            </div>
        `;
        
        // 렌더링 후 기본 월별 수지 분석 리포트 로드
        setTimeout(() => this.showReport('monthly'), 100);
        
        return html;
    }

    // 리포트 표시
    async showReport(reportType) {
        // 탭 활성 상태 업데이트
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.report === reportType) {
                tab.classList.add('active');
            }
        });

        const reportContent = document.getElementById('report-content');
        if (!reportContent) return;

        // 로딩 표시
        reportContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>리포트 로딩 중...</p>
            </div>
        `;

        try {
            let html;
            switch (reportType) {
                case 'monthly':
                    html = await this.renderMonthlyReport();
                    break;
                case 'category':
                    html = this.renderCategoryReport();
                    break;
                case 'assets':
                    html = this.renderAssetsReport();
                    break;
                default:
                    html = '<p class="no-data">리포트를 선택해주세요.</p>';
            }
            
            reportContent.innerHTML = html;
            
            // 월별 리포트인 경우 차트 생성
            if (reportType === 'monthly') {
                setTimeout(() => this.createMonthlyChart(), 100);
            }
            
        } catch (error) {
            console.error('리포트 로드 실패:', error);
            reportContent.innerHTML = '<p class="error-message">리포트를 불러올 수 없습니다.</p>';
        }
    }

    // 월별 리포트 렌더링
    async renderMonthlyReport() {
        const selectedUserId = document.getElementById('report-user-filter')?.value;
        let filters = {};
        
        if (selectedUserId && selectedUserId !== 'all') {
            filters.userId = selectedUserId;
        }
        
        const transactions = await this.dbManager.getTransactions(null, filters);
        const monthlyData = this.processMonthlyData(transactions);
        
        return `
            <div class="monthly-report">
                <div class="report-header">
                    <h2>📊 월별 수지 분석</h2>
                    <p>최근 12개월간의 수입과 지출 추이를 분석합니다</p>
                </div>
                
                <div class="chart-controls">
                    <div class="period-selector">
                        <label>기간 선택:</label>
                        <select id="chart-period" onchange="budgetApp.updateChartPeriod()">
                            <option value="12">최근 12개월</option>
                            <option value="6">최근 6개월</option>
                            <option value="3">최근 3개월</option>
                        </select>
                    </div>
                    <div class="chart-type-selector">
                        <label>차트 유형:</label>
                        <select id="chart-type" onchange="budgetApp.updateChartType()">
                            <option value="bar">막대 그래프</option>
                            <option value="line">선 그래프</option>
                            <option value="mixed">혼합형</option>
                        </select>
                    </div>
                    <div class="growth-rate-toggle">
                        <label>
                            <input type="checkbox" id="show-growth-rates" checked onchange="budgetApp.toggleGrowthRates()">
                            증감률 표시
                        </label>
                    </div>
                </div>
                
                <div class="chart-container">
                    <canvas id="monthly-chart" width="400" height="200"></canvas>
                </div>
                
                <div class="monthly-summary">
                    <div class="summary-cards">
                        <div class="summary-card">
                            <div class="summary-icon">💰</div>
                            <div class="summary-info">
                                <h4>평균 월 수입</h4>
                                <p class="summary-value income">${this.formatCurrency(monthlyData.avgIncome, this.currentUser.defaultCurrency)}</p>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-icon">💸</div>
                            <div class="summary-info">
                                <h4>평균 월 지출</h4>
                                <p class="summary-value expense">${this.formatCurrency(monthlyData.avgExpense, this.currentUser.defaultCurrency)}</p>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-icon">📈</div>
                            <div class="summary-info">
                                <h4>평균 월 수지</h4>
                                <p class="summary-value ${monthlyData.avgBalance >= 0 ? 'profit' : 'loss'}">
                                    ${this.formatCurrency(monthlyData.avgBalance, this.currentUser.defaultCurrency)}
                                </p>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-icon">🎯</div>
                            <div class="summary-info">
                                <h4>최고 수지 월</h4>
                                <p class="summary-value">${monthlyData.bestMonth}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="monthly-details">
                    <h3>월별 상세 내역</h3>
                    <div class="monthly-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>연월</th>
                                    <th>수입</th>
                                    <th>지출</th>
                                    <th>수지</th>
                                    <th>변화율</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${monthlyData.monthlyDetails.map(month => `
                                    <tr>
                                        <td><strong>${month.yearMonth}</strong></td>
                                        <td class="amount income">+${this.formatCurrency(month.income, this.currentUser.defaultCurrency)}</td>
                                        <td class="amount expense">-${this.formatCurrency(month.expense, this.currentUser.defaultCurrency)}</td>
                                        <td class="amount ${month.balance >= 0 ? 'profit' : 'loss'}">
                                            ${month.balance >= 0 ? '+' : ''}${this.formatCurrency(month.balance, this.currentUser.defaultCurrency)}
                                        </td>
                                        <td class="change ${month.changeRate >= 0 ? 'positive' : 'negative'}">
                                            ${month.changeRate !== null ? `${month.changeRate >= 0 ? '+' : ''}${month.changeRate.toFixed(1)}%` : '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // 카테고리 리포트 (placeholder)
    renderCategoryReport() {
        return `
            <div class="category-report">
                <div class="report-header">
                    <h2>🍽️ 카테고리별 지출 분석</h2>
                    <p>개발 예정입니다</p>
                </div>
            </div>
        `;
    }

    // 자산 리포트 (placeholder)
    renderAssetsReport() {
        return `
            <div class="assets-report">
                <div class="report-header">
                    <h2>📈 자산 수익률 분석</h2>
                    <p>개발 예정입니다</p>
                </div>
            </div>
        `;
    }

    // 월별 데이터 처리
    processMonthlyData(transactions, months = 12) {
        const now = new Date();
        const monthlyStats = {};
        
        // 최근 N개월 데이터 초기화
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyStats[yearMonth] = {
                yearMonth: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
                income: 0,
                expense: 0,
                balance: 0,
                changeRate: null,
                incomeGrowthRate: null,
                expenseGrowthRate: null
            };
        }

        // 거래 데이터 집계
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const yearMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyStats[yearMonth]) {
                if (transaction.type === 'income') {
                    monthlyStats[yearMonth].income += Math.abs(transaction.amount);
                } else if (transaction.type === 'expense') {
                    monthlyStats[yearMonth].expense += Math.abs(transaction.amount);
                }
            }
        });

        // 수지 계산 및 증감률 계산
        const monthlyDetails = Object.values(monthlyStats);
        let previousBalance = null;
        let previousIncome = null;
        let previousExpense = null;

        monthlyDetails.forEach(month => {
            month.balance = month.income - month.expense;
            
            // 수입-지출 증감률 계산 (순수익 증감률)
            if (previousBalance !== null && previousBalance !== 0) {
                month.netIncomeGrowthRate = ((month.balance - previousBalance) / Math.abs(previousBalance)) * 100;
                // 기존 변화율도 동일하게 설정 (하위 호환성)
                month.changeRate = month.netIncomeGrowthRate;
            }
            
            previousBalance = month.balance;
            previousIncome = month.income;
            previousExpense = month.expense;
        });

        // 평균값 계산
        const totalIncome = monthlyDetails.reduce((sum, month) => sum + month.income, 0);
        const totalExpense = monthlyDetails.reduce((sum, month) => sum + month.expense, 0);
        const totalBalance = monthlyDetails.reduce((sum, month) => sum + month.balance, 0);
        
        const avgIncome = totalIncome / months;
        const avgExpense = totalExpense / months;
        const avgBalance = totalBalance / months;

        // 최고 수지 월 찾기
        const bestMonth = monthlyDetails.reduce((best, month) => 
            month.balance > best.balance ? month : best
        ).yearMonth;

        return {
            monthlyDetails,
            avgIncome,
            avgExpense,
            avgBalance,
            bestMonth,
            chartData: this.prepareChartData(monthlyDetails)
        };
    }

    // 차트 데이터 준비
    prepareChartData(monthlyDetails) {
        return {
            labels: monthlyDetails.map(month => month.yearMonth.replace('년 ', '/').replace('월', '')),
            income: monthlyDetails.map(month => month.income),
            expense: monthlyDetails.map(month => month.expense),
            balance: monthlyDetails.map(month => month.balance),
            netIncomeGrowthRate: monthlyDetails.map(month => month.netIncomeGrowthRate || 0)
        };
    }

    // 월별 차트 생성
    createMonthlyChart() {
        const canvas = document.getElementById('monthly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 기존 차트 제거
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }

        // 차트 데이터 가져오기
        const chartType = document.getElementById('chart-type')?.value || 'mixed';
        const period = parseInt(document.getElementById('chart-period')?.value) || 12;
        const showGrowthRates = document.getElementById('show-growth-rates')?.checked !== false;
        
        const selectedUserId = document.getElementById('report-user-filter')?.value;
        let filters = {};
        
        if (selectedUserId && selectedUserId !== 'all') {
            filters.userId = selectedUserId;
        }
        
        this.dbManager.getTransactions(null, filters).then(transactions => {
            const monthlyData = this.processMonthlyData(transactions, period);
            const chartData = monthlyData.chartData;

            let datasets = [];
            
            if (chartType === 'bar') {
                datasets = [
                    {
                        label: '수입',
                        data: chartData.income,
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2,
                        type: 'bar',
                        yAxisID: 'y'
                    },
                    {
                        label: '지출',
                        data: chartData.expense,
                        backgroundColor: 'rgba(244, 67, 54, 0.7)',
                        borderColor: 'rgba(244, 67, 54, 1)',
                        borderWidth: 2,
                        type: 'bar',
                        yAxisID: 'y'
                    }
                ];
                
                // 증감률 표시 옵션이 활성화된 경우 추가
                if (showGrowthRates) {
                    datasets.push(
                        {
                            label: '수입-지출 증감률 (%)',
                            data: chartData.netIncomeGrowthRate,
                            borderColor: 'rgba(156, 39, 176, 1)',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            borderWidth: 3,
                            type: 'line',
                            fill: false,
                            tension: 0.4,
                            yAxisID: 'y1',
                            borderDash: [8, 4]
                        }
                    );
                }
            } else if (chartType === 'line') {
                datasets = [
                    {
                        label: '수지',
                        data: chartData.balance,
                        borderColor: 'rgba(33, 150, 243, 1)',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ];
            } else { // mixed
                datasets = [
                    {
                        label: '수입',
                        data: chartData.income,
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2,
                        type: 'bar',
                        yAxisID: 'y'
                    },
                    {
                        label: '지출',
                        data: chartData.expense,
                        backgroundColor: 'rgba(244, 67, 54, 0.7)',
                        borderColor: 'rgba(244, 67, 54, 1)',
                        borderWidth: 2,
                        type: 'bar',
                        yAxisID: 'y'
                    },
                    {
                        label: '수지',
                        data: chartData.balance,
                        borderColor: 'rgba(33, 150, 243, 1)',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        type: 'line',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    }
                ];
                
                // 증감률 표시 옵션이 활성화된 경우 추가
                if (showGrowthRates) {
                    datasets.push(
                        {
                            label: '수입-지출 증감률 (%)',
                            data: chartData.netIncomeGrowthRate,
                            borderColor: 'rgba(156, 39, 176, 1)',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            borderWidth: 2,
                            type: 'line',
                            fill: false,
                            tension: 0.4,
                            yAxisID: 'y1',
                            borderDash: [8, 4]
                        }
                    );
                }
            }

            const config = {
                type: chartType === 'line' ? 'line' : 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `월별 수지 분석 (최근 ${period}개월)`,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const value = context.parsed.y;
                                    const datasetLabel = context.dataset.label;
                                    
                                    // 증감률 데이터인 경우
                                    if (datasetLabel.includes('증감률')) {
                                        return `${datasetLabel}: ${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
                                    }
                                    
                                    // 금액 데이터인 경우
                                    const formattedValue = this.formatCurrency(Math.abs(value), this.currentUser.defaultCurrency);
                                    return `${datasetLabel}: ${value >= 0 ? '+' : '-'}${formattedValue}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '월'
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: '금액'
                            },
                            ticks: {
                                callback: (value) => {
                                    return this.formatCurrency(Math.abs(value), this.currentUser.defaultCurrency);
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: '증감률 (%)'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                callback: (value) => {
                                    return value.toFixed(1) + '%';
                                }
                            }
                        }
                    }
                }
            };

            // 증감률이 표시되지 않거나 Line 차트인 경우 Y1 축 숨기기
            if (chartType === 'line' || !showGrowthRates) {
                config.options.scales.y1.display = false;
            }

            this.monthlyChart = new Chart(ctx, config);
        });
    }

    // 차트 기간 업데이트
    updateChartPeriod() {
        this.createMonthlyChart();
    }

    // 차트 유형 업데이트
    updateChartType() {
        this.createMonthlyChart();
    }

    // 증감률 표시 토글
    toggleGrowthRates() {
        this.createMonthlyChart();
    }

    // 리포트 사용자 필터 업데이트
    updateReportUser() {
        // 현재 활성화된 리포트 탭 찾기
        const activeTab = document.querySelector('.report-tab.active');
        if (activeTab) {
            const reportType = activeTab.dataset.report;
            this.showReport(reportType);
        }
    }

    // 설정 렌더링
    renderSettings() {
        const html = `
            <div class="settings-container">
                <div class="section-header">
                    <h1>설정</h1>
                </div>
                
                <div class="settings-sections">
                    <div class="settings-section">
                        <h2>🔐 보안 설정</h2>
                        <div class="setting-item">
                            <label>앱 접근 암호:</label>
                            <button class="btn-secondary" onclick="budgetApp.showChangePasswordModal()">암호 변경</button>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h2>👤 앱 정보</h2>
                        <div class="setting-item">
                            <label>기본 통화:</label>
                            <span>${this.currencies[this.currentUser.defaultCurrency]?.name || 'KRW'}</span>
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="collapsible-header" onclick="budgetApp.toggleStatisticsSettings()">
                            <h2>📊 통계 포함 설정</h2>
                            <span class="expand-icon" id="statistics-expand-icon">▼</span>
                        </div>
                        <div id="statistics-settings-content" class="collapsible-content" style="display: none;">
                            <p class="setting-description">대시보드 통계에 포함할 항목을 선택하세요.</p>
                            
                            <div class="inclusion-settings-compact">
                                <div class="inclusion-group">
                                    <h3>💰 자산 유형</h3>
                                    <div id="asset-inclusion-settings" class="toggle-grid">
                                        로딩 중...
                                    </div>
                                </div>
                                
                                <div class="inclusion-group">
                                    <h3>📈 수입 카테고리</h3>
                                    <div id="income-inclusion-settings" class="toggle-grid">
                                        로딩 중...
                                    </div>
                                </div>
                                
                                <div class="inclusion-group">
                                    <h3>📉 지출 카테고리</h3>
                                    <div id="expense-inclusion-settings" class="toggle-grid">
                                        로딩 중...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h2>👥 가계부 사용자</h2>
                        <p class="setting-description">가계부를 함께 사용할 사용자를 관리합니다.</p>
                        
                        <div class="user-management">
                            <div class="user-list" id="user-list">
                                로딩 중...
                            </div>
                            <button class="btn-primary" onclick="budgetApp.showAddUserModal()">
                                + 사용자 추가
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h2>데이터 관리</h2>
                        <button class="btn-secondary" onclick="budgetApp.exportData()">
                            데이터 내보내기
                        </button>
                        <button class="btn-secondary" onclick="budgetApp.importData()">
                            데이터 가져오기
                        </button>
                    </div>
                    
                    <div class="settings-section">
                        <h2>계정</h2>
                        <button class="btn-danger" onclick="budgetApp.completeReset()">
                            완전 초기화
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 렌더링 후 설정 데이터 로드
        setTimeout(() => {
            this.loadInclusionSettings();
            this.loadUserList();
        }, 100);
        
        return html;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 네비게이션 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-item')) {
                const view = e.target.dataset.nav;
                this.navigateTo(view);
            }
            
            // 인증 탭 전환
            if (e.target.matches('.auth-tab')) {
                document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(form => form.style.display = 'none');
                
                e.target.classList.add('active');
                const targetForm = e.target.dataset.tab === 'login' ? 'login-form' : 'register-form';
                document.getElementById(targetForm).style.display = 'block';
            }
        });
        
        
        // 폼 제출 이벤트
        document.addEventListener('submit', async (e) => {
            if (e.target.matches('#login-form')) {
                e.preventDefault();
                await this.handleLogin(e.target);
            }
            
            if (e.target.matches('#register-form')) {
                e.preventDefault();
                await this.handleRegister(e.target);
            }
        });
    }

    // 로그인 처리
    async handleLogin(form) {
        const email = form.querySelector('#login-email').value;
        
        try {
            const user = await this.dbManager.getUserByEmail(email);
            if (user) {
                this.currentUser = user;
                this.dbManager.setCurrentUser(user.id);
                await this.showMainApp();
                this.showToast('로그인되었습니다!');
            } else {
                this.showError('사용자를 찾을 수 없습니다.');
            }
        } catch (error) {
            this.showError('로그인 중 오류가 발생했습니다.');
        }
    }

    // 회원가입 처리
    async handleRegister(form) {
        const userData = {
            username: form.querySelector('#register-username').value,
            email: form.querySelector('#register-email').value,
            displayName: form.querySelector('#register-displayname').value,
            defaultCurrency: form.querySelector('#register-currency').value
        };
        
        try {
            const user = await this.dbManager.createUser(userData);
            this.currentUser = user;
            this.dbManager.setCurrentUser(user.id);
            
            // 기본 계좌 생성
            await this.createDefaultAccount();
            
            await this.showMainApp();
            this.showToast('회원가입이 완료되었습니다!');
        } catch (error) {
            this.showError('회원가입 중 오류가 발생했습니다.');
        }
    }

    // 기본 계좌 생성
    async createDefaultAccount() {
        try {
            await this.dbManager.createAccount({
                name: '기본 계좌',
                type: 'bank',
                balance: 0,
                currency: this.currentUser.defaultCurrency,
                isDefault: true
            });
        } catch (error) {
            console.error('기본 계좌 생성 실패:', error);
            // 계좌 생성 실패해도 회원가입은 진행
        }
    }

    // 완전 초기화
    async completeReset() {
        if (confirm('데이터베이스를 완전히 초기화하고 기본 사용자와 엑셀 데이터를 다시 불러오시겠습니까?\n\n주의: 모든 데이터가 삭제됩니다!')) {
            try {
                // 로딩 표시
                this.showLoadingModal('데이터베이스 초기화 중...');
                
                // 완전 초기화 실행
                const resetResult = await this.dbManager.completeReset();
                console.log('초기화 완료:', resetResult);
                
                // 로딩 메시지 변경
                this.updateLoadingModal('엑셀 데이터 삽입 중...');
                
                // 엑셀 데이터 삽입
                const insertResult = await this.dbManager.insertExcelData();
                console.log('데이터 삽입 완료:', insertResult);
                
                // 로딩 종료
                this.hideLoadingModal();
                
                // 현재 사용자 업데이트
                this.currentUser = await this.dbManager.getUser(resetResult.userId);
                
                // 성공 메시지 표시
                alert(`초기화 완료!\n\n${resetResult.message}\n${insertResult.message}`);
                
                // 대시보드로 이동하여 새로운 데이터 표시
                this.currentView = 'dashboard';
                this.selectedAccountUserId = 'all';
                this.render();
                
            } catch (error) {
                this.hideLoadingModal();
                console.error('완전 초기화 실패:', error);
                alert(`초기화 실패: ${error.message}`);
            }
        }
    }

    // 모달 및 기타 유틸리티 메서드들

    async showAddAssetModal() {
        //console.log('자산 추가 모달 표시');
        
        // 자산 유형 옵션 생성
        const assetTypeOptions = this.generateAssetTypeOptions();

        // 사용자 옵션 생성
        const users = await this.dbManager.getAllAccountUsers();
        const userOptions = users.map(user => `
            <option value="${user.id}" ${user.id === this.selectedAccountUserId ? 'selected' : ''}>
                ${user.name} ${user.relationship ? `(${user.relationship})` : ''}
            </option>
        `).join('');
        
        // 모달 HTML 생성
        const modalHtml = `
            <div class="modal-overlay" id="asset-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>💰 자산 추가</h2>
                        <button class="modal-close" onclick="budgetApp.closeAssetModal()">&times;</button>
                    </div>
                    
                    <form id="add-asset-form" class="modal-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>자산명 *</label>
                                <input type="text" id="asset-name" required placeholder="예: 삼성전자 주식">
                            </div>
                            
                            <div class="form-group">
                                <label>자산 유형 *</label>
                                <select id="asset-type" required onchange="budgetApp.updateAssetSubTypes()">
                                    <option value="">자산 유형 선택</option>
                                    ${assetTypeOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>세부 유형</label>
                                <select id="asset-subtype">
                                    <option value="">먼저 자산 유형을 선택하세요</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>통화</label>
                                <select id="asset-currency">
                                    ${Object.entries(this.currencies).map(([code, curr]) => 
                                        `<option value="${code}" ${code === this.currentUser.defaultCurrency ? 'selected' : ''}>${curr.symbol} ${curr.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>현재 가치 *</label>
                                <input type="text" id="asset-current-value" required placeholder="0" oninput="budgetApp.formatAmountInput(this)">
                            </div>
                            
                            <div class="form-group">
                                <label>구매 가격</label>
                                <input type="text" id="asset-purchase-price" placeholder="0" oninput="budgetApp.formatAmountInput(this)">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>보유 수량</label>
                                <input type="number" id="asset-quantity" step="0.0001" placeholder="1" value="1">
                            </div>
                            
                            <div class="form-group">
                                <label>단위</label>
                                <input type="text" id="asset-unit" placeholder="주, 개, kg 등">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>구매일</label>
                                <input type="date" id="asset-purchase-date">
                            </div>
                            
                            <div class="form-group">
                                <label>위치/거래소</label>
                                <input type="text" id="asset-location" placeholder="증권사, 은행, 거래소 등">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>사용자 *</label>
                                <select id="asset-user" required>
                                    ${userOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>메모</label>
                            <textarea id="asset-notes" placeholder="추가 정보나 메모를 입력하세요" rows="3"></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="budgetApp.closeAssetModal()">취소</button>
                            <button type="submit" class="btn-primary">자산 추가</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 폼 제출 이벤트 리스너 등록
        document.getElementById('add-asset-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddAsset(e.target);
        });
        
        //console.log('자산 추가 모달 표시 완료');
    }

    // 자산 유형 옵션 생성
    generateAssetTypeOptions() {
        return Object.entries(this.assetTypes).map(([key, type]) => 
            `<option value="${key}">${type.icon} ${type.name}</option>`
        ).join('');
    }

    // 자산 세부 유형 업데이트
    updateAssetSubTypes() {
        const typeSelect = document.getElementById('asset-type');
        const subtypeSelect = document.getElementById('asset-subtype');
        
        if (!typeSelect || !subtypeSelect) return;
        
        const selectedType = typeSelect.value;
        subtypeSelect.innerHTML = '<option value="">세부 유형 선택 (선택사항)</option>';
        
        if (selectedType && this.assetTypes[selectedType] && this.assetTypes[selectedType].subTypes) {
            Object.entries(this.assetTypes[selectedType].subTypes).forEach(([key, name]) => {
                subtypeSelect.innerHTML += `<option value="${key}">${name}</option>`;
            });
        }
    }

    // 자산 추가 처리
    async handleAddAsset(form) {
        const assetData = {
            name: form.querySelector('#asset-name').value,
            type: form.querySelector('#asset-type').value,
            subType: form.querySelector('#asset-subtype').value,
            currentValue: parseFloat(form.querySelector('#asset-current-value').value.replace(/,/g, '')),
            purchasePrice: parseFloat(form.querySelector('#asset-purchase-price').value.replace(/,/g, '')) || 0,
            currency: form.querySelector('#asset-currency').value,
            quantity: parseFloat(form.querySelector('#asset-quantity').value) || 1,
            unit: form.querySelector('#asset-unit').value,
            purchaseDate: form.querySelector('#asset-purchase-date').value,
            location: form.querySelector('#asset-location').value,
            notes: form.querySelector('#asset-notes').value,
            accountUserId: form.querySelector('#asset-user').value // 선택된 사용자 ID
        };
        
        try {
            //console.log('자산 추가 중:', assetData);
            const newAsset = await this.dbManager.createAsset(assetData);
            //console.log('자산 추가 완료:', newAsset);
            
            this.showToast('자산이 성공적으로 추가되었습니다!');
            this.closeAssetModal();
            
            // 현재 자산관리 페이지라면 새로고침
            if (this.currentView === 'assets') {
                this.navigateTo('assets');
            }
            
        } catch (error) {
            console.error('자산 추가 실패:', error);
            this.showError('자산 추가 중 오류가 발생했습니다.');
        }
    }

    // 자산 모달 닫기
    closeAssetModal() {
        const modal = document.getElementById('asset-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 자산 수정 모달 표시
    async showEditAssetModal(assetId) {
        try {
            //console.log('자산 수정 모달 표시, ID:', assetId);
            
            // 자산 데이터 가져오기
            const asset = await this.dbManager.getAsset(assetId);
            if (!asset) {
                this.showError('자산을 찾을 수 없습니다.');
                return;
            }
            
            // 자산 유형 옵션 생성
            const assetTypeOptions = this.generateAssetTypeOptions();
            
            // 모달 HTML 생성 (기존과 유사하지만 값들이 채워짐)
            const modalHtml = `
                <div class="modal-overlay" id="asset-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>✏️ 자산 수정</h2>
                            <button class="modal-close" onclick="budgetApp.closeAssetModal()">&times;</button>
                        </div>
                        
                        <form id="edit-asset-form" class="modal-form">
                            <input type="hidden" id="asset-id" value="${asset.id}">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>자산명 *</label>
                                    <input type="text" id="asset-name" required value="${asset.name}">
                                </div>
                                
                                <div class="form-group">
                                    <label>자산 유형 *</label>
                                    <select id="asset-type" required onchange="budgetApp.updateAssetSubTypes()">
                                        <option value="">자산 유형 선택</option>
                                        ${assetTypeOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>세부 유형</label>
                                    <select id="asset-subtype">
                                        <option value="">세부 유형 선택 (선택사항)</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>통화</label>
                                    <select id="asset-currency">
                                        ${Object.entries(this.currencies).map(([code, curr]) => 
                                            `<option value="${code}" ${code === asset.currency ? 'selected' : ''}>${curr.symbol} ${curr.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>현재 가치 *</label>
                                    <input type="text" id="asset-current-value" required value="${parseInt(asset.currentValue).toLocaleString('ko-KR')}" oninput="budgetApp.formatAmountInput(this)">
                                </div>
                                
                                <div class="form-group">
                                    <label>구매 가격</label>
                                    <input type="text" id="asset-purchase-price" value="${asset.purchasePrice ? parseInt(asset.purchasePrice).toLocaleString('ko-KR') : ''}" oninput="budgetApp.formatAmountInput(this)">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>보유 수량</label>
                                    <input type="number" id="asset-quantity" step="0.0001" value="${asset.quantity || 1}">
                                </div>
                                
                                <div class="form-group">
                                    <label>단위</label>
                                    <input type="text" id="asset-unit" value="${asset.unit || ''}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>구매일</label>
                                    <input type="date" id="asset-purchase-date" value="${asset.purchaseDate || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label>위치/거래소</label>
                                    <input type="text" id="asset-location" value="${asset.location || ''}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>메모</label>
                                <textarea id="asset-notes" rows="3">${asset.notes || ''}</textarea>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" onclick="budgetApp.closeAssetModal()">취소</button>
                                <button type="submit" class="btn-primary">수정 저장</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // 모달을 body에 추가
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // 자산 유형 설정
            document.getElementById('asset-type').value = asset.type;
            this.updateAssetSubTypes();
            
            // 세부 유형 설정
            setTimeout(() => {
                if (asset.subType) {
                    document.getElementById('asset-subtype').value = asset.subType;
                }
            }, 100);
            
            // 폼 제출 이벤트 리스너 등록
            document.getElementById('edit-asset-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditAsset(e.target);
            });
            
        } catch (error) {
            console.error('자산 수정 모달 오류:', error);
            this.showError('자산 정보를 불러올 수 없습니다.');
        }
    }

    // 자산 수정 처리
    async handleEditAsset(form) {
        const assetId = form.querySelector('#asset-id').value;
        const assetData = {
            name: form.querySelector('#asset-name').value,
            type: form.querySelector('#asset-type').value,
            subType: form.querySelector('#asset-subtype').value,
            currentValue: parseFloat(form.querySelector('#asset-current-value').value.replace(/,/g, '')),
            purchasePrice: parseFloat(form.querySelector('#asset-purchase-price').value.replace(/,/g, '')) || 0,
            currency: form.querySelector('#asset-currency').value,
            quantity: parseFloat(form.querySelector('#asset-quantity').value) || 1,
            unit: form.querySelector('#asset-unit').value,
            purchaseDate: form.querySelector('#asset-purchase-date').value,
            location: form.querySelector('#asset-location').value,
            notes: form.querySelector('#asset-notes').value
        };
        
        try {
            //console.log('자산 수정 중:', assetId, assetData);
            await this.dbManager.updateAsset(assetId, assetData);
            //console.log('자산 수정 완료');
            
            this.showToast('자산이 성공적으로 수정되었습니다!');
            this.closeAssetModal();
            
            // 자산관리 페이지 새로고침
            if (this.currentView === 'assets') {
                this.navigateTo('assets');
            }
            
        } catch (error) {
            console.error('자산 수정 실패:', error);
            this.showError('자산 수정 중 오류가 발생했습니다.');
        }
    }

    // 자산 삭제
    async deleteAsset(assetId) {
        if (!confirm('이 자산을 삭제하시겠습니까?\n삭제된 자산은 복구할 수 없습니다.')) {
            return;
        }
        
        try {
            //console.log('자산 삭제 중:', assetId);
            await this.dbManager.deleteAsset(assetId);
            //console.log('자산 삭제 완료');
            
            this.showToast('자산이 삭제되었습니다.');
            
            // 자산관리 페이지 새로고침
            if (this.currentView === 'assets') {
                this.navigateTo('assets');
            }
            
        } catch (error) {
            console.error('자산 삭제 실패:', error);
            this.showError('자산 삭제 중 오류가 발생했습니다.');
        }
    }

    async exportData() {
        this.showPasswordInputModal('데이터 내보내기', async (password) => {
            try {
                this.showToast('데이터를 암호화하여 내보내는 중...');
                
                // 모든 데이터 가져오기
                const data = await this.dbManager.exportUserData();
                
                // 데이터 암호화
                const encryptedPackage = await this.encryptData(data, password);
                
                // 암호화된 데이터를 파일로 다운로드
                const dataStr = JSON.stringify(encryptedPackage, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `budget_backup_encrypted_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showToast('✅ 암호화된 데이터가 성공적으로 내보내졌습니다!');
            } catch (error) {
                console.error('데이터 내보내기 실패:', error);
                this.showError('데이터 내보내기 실패: ' + error.message);
            }
        });
    }

    importData() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const fileData = JSON.parse(text);
                
                // 암호화된 파일인지 확인
                if (fileData.encryptedData && fileData.salt && fileData.iv && fileData.algorithm) {
                    // 암호화된 파일 - 암호 입력 요청
                    this.showPasswordInputModal('데이터 가져오기', async (password) => {
                        try {
                            this.showToast('데이터를 복호화하여 가져오는 중...');
                            
                            // 데이터 복호화
                            const decryptedData = await this.decryptData(fileData, password);
                            
                            // 복호화된 데이터로 가져오기 옵션 모달 표시
                            this.showImportOptionsModal(null, decryptedData);
                        } catch (error) {
                            console.error('복호화 실패:', error);
                            this.showError(error.message);
                        }
                    });
                } else {
                    // 일반 백업 파일 - 기존 로직 사용
                    this.showImportOptionsModal(file, fileData);
                }
            } catch (error) {
                console.error('파일 읽기 오류:', error);
                this.showError('파일을 읽을 수 없습니다. 올바른 백업 파일인지 확인해주세요.');
            }
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    showImportOptionsModal(file, preloadedData = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>📥 데이터 가져오기 옵션</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="import-options">
                        <div class="option-section">
                            <h3>📋 가져올 데이터 선택</h3>
                            <div class="checkbox-group">
                                <div class="checkbox-item">
                                    <input type="checkbox" id="import-transactions" checked>
                                    <label for="import-transactions">💳 거래 내역</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="import-assets" checked>
                                    <label for="import-assets">💰 자산 정보</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="import-accounts" checked>
                                    <label for="import-accounts">🏦 계정 정보</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="option-section">
                            <h3>🔄 데이터 가져오기 방식</h3>
                            <div class="radio-group">
                                <div class="radio-item">
                                    <input type="radio" id="import-add" name="import-mode" value="add" checked>
                                    <label for="import-add">➕ 기존 데이터에 추가</label>
                                </div>
                                <div class="radio-item">
                                    <input type="radio" id="import-replace" name="import-mode" value="replace">
                                    <label for="import-replace">🔄 기존 데이터를 완전히 바꾸기</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="option-section" id="merge-strategy-section">
                            <h3>🤝 중복 데이터 처리 방식</h3>
                            <p class="option-description">기존 데이터에 추가할 때 중복된 항목을 어떻게 처리할지 선택하세요.</p>
                            <div class="radio-group">
                                <div class="radio-item">
                                    <input type="radio" id="merge-skip" name="merge-strategy" value="skip" checked>
                                    <label for="merge-skip">⏭️ 건너뛰기 (기존 데이터 유지)</label>
                                </div>
                                <div class="radio-item">
                                    <input type="radio" id="merge-overwrite" name="merge-strategy" value="overwrite">
                                    <label for="merge-overwrite">🔄 덮어쓰기 (새 데이터로 교체)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">가져오기 전에 데이터를 백업하는 것을 권장합니다.</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">취소</button>
                    <button class="btn btn-primary" onclick="budgetApp.executeImport(this)">가져오기 실행</button>
                </div>
            </div>
        `;
        
        modal.file = file; // 파일 정보를 모달에 저장
        modal.preloadedData = preloadedData; // 복호화된 데이터를 모달에 저장
        document.body.appendChild(modal);
        
        // 가져오기 방식 변경 이벤트 리스너 추가
        document.querySelectorAll('input[name="import-mode"]').forEach(radio => {
            radio.addEventListener('change', this.toggleMergeStrategySection);
        });
        
        // 초기 상태 설정
        this.toggleMergeStrategySection();
    }

    toggleMergeStrategySection() {
        const importMode = document.querySelector('input[name="import-mode"]:checked')?.value;
        const mergeSection = document.getElementById('merge-strategy-section');
        
        if (mergeSection) {
            if (importMode === 'add') {
                mergeSection.style.display = 'block';
            } else {
                mergeSection.style.display = 'none';
            }
        }
    }

    async executeImport(button) {
        const modal = button.closest('.modal-overlay');
        const file = modal.file;
        const preloadedData = modal.preloadedData;
        
        const importMode = document.querySelector('input[name="import-mode"]:checked').value;
        const mergeStrategy = importMode === 'add' ? 
            document.querySelector('input[name="merge-strategy"]:checked').value : 
            'replace';
        
        const options = {
            includeTransactions: document.getElementById('import-transactions').checked,
            includeAssets: document.getElementById('import-assets').checked,  
            includeAccounts: document.getElementById('import-accounts').checked,
            importMode: importMode,
            mergeStrategy: mergeStrategy
        };
        
        try {
            this.showToast('데이터를 가져오는 중...');
            modal.remove();
            
            const result = preloadedData ? 
                await this.dbManager.uploadBackupFromData(preloadedData, options) :
                await this.dbManager.uploadBackup(file, options);
            
            if (result.success) {
                let message = '✅ 데이터 가져오기 완료!\n\n';
                
                // 삭제된 데이터가 있는 경우 (완전히 바꾸기 모드)
                if (result.deleted && (result.deleted.transactions > 0 || result.deleted.assets > 0 || result.deleted.accounts > 0)) {
                    message += `🗑️ 기존 데이터 삭제:\n`;
                    if (result.deleted.transactions > 0) message += `• 거래 내역: ${result.deleted.transactions}개\n`;
                    if (result.deleted.assets > 0) message += `• 자산: ${result.deleted.assets}개\n`;
                    if (result.deleted.accounts > 0) message += `• 계정: ${result.deleted.accounts}개\n`;
                    message += `\n`;
                }
                
                message += `📥 가져온 데이터:\n`;
                message += `• 거래 내역: ${result.imported.transactions}개\n`;
                message += `• 자산: ${result.imported.assets}개\n`;
                message += `• 계정: ${result.imported.accounts}개\n`;
                
                if (result.skipped.transactions > 0 || result.skipped.assets > 0 || result.skipped.accounts > 0) {
                    message += `\n⏭️ 건너뛴 데이터:\n`;
                    if (result.skipped.transactions > 0) message += `• 거래 내역: ${result.skipped.transactions}개\n`;
                    if (result.skipped.assets > 0) message += `• 자산: ${result.skipped.assets}개\n`;
                    if (result.skipped.accounts > 0) message += `• 계정: ${result.skipped.accounts}개\n`;
                }
                
                if (result.errors.length > 0) {
                    message += `\n⚠️ 오류가 발생한 항목: ${result.errors.length}개`;
                    console.warn('가져오기 오류:', result.errors);
                }
                
                this.showImportResultModal(message, result);
                
                // 현재 뷰 새로고침
                if (this.currentView === 'dashboard') {
                    this.loadDashboardData();
                }
            } else {
                this.showError('데이터 가져오기에 실패했습니다.');
            }
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            modal.remove();
            this.showError('데이터 가져오기 실패: ' + error.message);
        }
    }

    showImportResultModal(message, result) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>📊 가져오기 결과</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="import-result">
                        <pre>${message}</pre>
                        ${result.errors.length > 0 ? `
                            <details class="error-details">
                                <summary>오류 세부사항 보기 (${result.errors.length}개)</summary>
                                <ul class="error-list">
                                    ${result.errors.map(error => `<li>${error}</li>`).join('')}
                                </ul>
                            </details>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">확인</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 필터 적용
    async applyFilters() {
        const filters = {
            type: document.getElementById('filter-type')?.value || '',
            category: document.getElementById('filter-category')?.value || '',
            dateFrom: document.getElementById('filter-date-from')?.value || '',
            dateTo: document.getElementById('filter-date-to')?.value || ''
        };

        // 사용자 필터 추가
        if (this.selectedAccountUserId && this.selectedAccountUserId !== 'all') {
            filters.accountUserId = this.selectedAccountUserId;
        }

        try {
            this.showToast('필터를 적용하는 중...', 'info');
            const transactions = await this.dbManager.getTransactions(null, filters);
            
            // 현재 정렬 옵션 적용
            const sortOption = document.getElementById('sort-option')?.value || 'date-desc';
            const sortedTransactions = this.sortTransactions(transactions, sortOption);
            
            const transactionsList = document.querySelector('.transactions-list');
            if (transactionsList) {
                transactionsList.innerHTML = await this.renderTransactionsList(sortedTransactions);
            }
            this.showToast(`${sortedTransactions.length}개의 거래내역을 찾았습니다.`);
        } catch (error) {
            console.error('필터 적용 에러:', error);
            this.showError('필터 적용 중 오류가 발생했습니다.');
        }
    }

    // 필터 초기화
    async clearFilters() {
        try {
            // 필터 값 초기화
            const filterType = document.getElementById('filter-type');
            const filterCategory = document.getElementById('filter-category');
            const filterDateFrom = document.getElementById('filter-date-from');
            const filterDateTo = document.getElementById('filter-date-to');
            
            if (filterType) filterType.value = '';
            if (filterCategory) filterCategory.value = '';
            
            // 날짜 필터도 빈 값으로 초기화
            if (filterDateFrom) filterDateFrom.value = '';
            if (filterDateTo) filterDateTo.value = '';
            
            // 정렬 옵션도 초기화
            const sortOption = document.getElementById('sort-option');
            if (sortOption) sortOption.value = 'date-desc';
            
            this.showToast('필터를 초기화했습니다.');
            await this.applyFilters();
        } catch (error) {
            console.error('필터 초기화 에러:', error);
            this.showError('필터 초기화 중 오류가 발생했습니다.');
        }
    }

    // 정렬 적용
    async applySorting() {
        try {
            const sortOption = document.getElementById('sort-option')?.value || 'date-desc';
            const filters = {
                type: document.getElementById('filter-type')?.value || '',
                category: document.getElementById('filter-category')?.value || '',
                dateFrom: document.getElementById('filter-date-from')?.value || '',
                dateTo: document.getElementById('filter-date-to')?.value || ''
            };

            // 사용자 필터 추가
            if (this.selectedAccountUserId && this.selectedAccountUserId !== 'all') {
                filters.accountUserId = this.selectedAccountUserId;
            }

            const transactions = await this.dbManager.getTransactions(null, filters);
            
            // 정렬 적용
            const sortedTransactions = this.sortTransactions(transactions, sortOption);
            
            const transactionsList = document.querySelector('.transactions-list');
            if (transactionsList) {
                transactionsList.innerHTML = await this.renderTransactionsList(sortedTransactions);
            }
            
            const sortLabels = {
                'date-desc': '최신순',
                'date-asc': '과거순', 
                'amount-desc': '금액 높은순',
                'amount-asc': '금액 낮은순'
            };
            
            this.showToast(`${sortLabels[sortOption]}로 ${sortedTransactions.length}개 거래내역을 정렬했습니다.`);
        } catch (error) {
            console.error('정렬 적용 에러:', error);
            this.showError('정렬 적용 중 오류가 발생했습니다.');
        }
    }

    // 거래내역 정렬
    sortTransactions(transactions, sortOption) {
        return transactions.sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                default:
                    return new Date(b.date) - new Date(a.date); // 기본값: 최신순
            }
        });
    }

    // 거래 아이콘 가져오기
    getTransactionIcon(type, category) {
        const categories = this.transactionCategories[type];
        return categories && categories[category] ? categories[category].icon : '💰';
    }

    // 통화 포맷팅
    formatCurrency(amount, currency = 'KRW', abbreviated = false) {
        const currencyInfo = this.currencies[currency];
        
        if (abbreviated && Math.abs(amount) >= 1000) {
            // 축약 형식
            let value = amount;
            let suffix = '';
            
            if (Math.abs(value) >= 1000000000) {
                value = value / 1000000000;
                suffix = 'B';
            } else if (Math.abs(value) >= 1000000) {
                value = value / 1000000;
                suffix = 'M';
            } else if (Math.abs(value) >= 1000) {
                value = value / 1000;
                suffix = 'K';
            }
            
            return `${currencyInfo.symbol}${value.toFixed(value % 1 === 0 ? 0 : 1)}${suffix}`;
        }
        
        return `${currencyInfo.symbol}${amount.toLocaleString()}`;
    }


    // 토스트 메시지 표시
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

    // 거래 추가 모달 표시
    async showAddTransactionModal() {
        //console.log('거래 추가 모달 표시');
        
        // 카테고리 옵션 생성
        const incomeOptions = Object.entries(this.transactionCategories.income)
            .map(([key, cat]) => `<option value="${key}">${cat.icon} ${cat.name}</option>`)
            .join('');
        
        const expenseOptions = Object.entries(this.transactionCategories.expense)
            .map(([key, cat]) => `<option value="${key}">${cat.icon} ${cat.name}</option>`)
            .join('');
            
        // 통화 옵션 생성
        const currencyOptions = Object.entries(this.currencies)
            .map(([code, curr]) => `<option value="${code}" ${code === this.currentUser.defaultCurrency ? 'selected' : ''}>${curr.symbol} ${curr.name}</option>`)
            .join('');

        // 사용자 옵션 생성
        const users = await this.dbManager.getAllAccountUsers();
        const userOptions = users.map(user => `
            <option value="${user.id}" ${user.id === this.selectedAccountUserId ? 'selected' : ''}>
                ${user.name} ${user.relationship ? `(${user.relationship})` : ''}
            </option>
        `).join('');
        
        const modalHtml = `
            <div class="modal-overlay" id="transaction-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>💳 거래 추가</h2>
                        <button class="modal-close" onclick="budgetApp.closeTransactionModal()">&times;</button>
                    </div>
                    
                    <form id="add-transaction-form" class="modal-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>거래 유형 *</label>
                                <select id="transaction-type" required onchange="budgetApp.updateTransactionCategories()">
                                    <option value="">거래 유형 선택</option>
                                    <option value="income">💸 수입</option>
                                    <option value="expense">💰 지출</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>금액 *</label>
                                <input type="text" id="transaction-amount" required placeholder="예: 1,000,000" 
                                       oninput="budgetApp.formatAmountInput(this)" 
                                       onkeypress="return budgetApp.validateNumberInput(event)">
                                <div class="amount-korean" id="amount-korean" style="font-size: 0.85em; color: #666; margin-top: 4px; min-height: 18px;"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>카테고리 *</label>
                                <select id="transaction-category" required>
                                    <option value="">먼저 거래 유형을 선택하세요</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>통화</label>
                                <select id="transaction-currency" onchange="budgetApp.updateKoreanDisplay()">
                                    ${currencyOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>거래 일자 *</label>
                                <input type="date" id="transaction-date" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label>내용 *</label>
                                <input type="text" id="transaction-description" required placeholder="거래 내용을 입력하세요">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>사용자 *</label>
                                <select id="transaction-user" required>
                                    ${userOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>메모</label>
                            <textarea id="transaction-notes" placeholder="추가 메모 (선택사항)" rows="3"></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="budgetApp.closeTransactionModal()">취소</button>
                            <button type="submit" class="btn-primary">거래 추가</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 모달 오버레이 클릭으로 닫기 기능 추가
        const modal = document.getElementById('transaction-modal');
        this.addModalCloseOnOverlayClick(modal);
        
        // 폼 제출 이벤트 리스너 추가
        const form = document.getElementById('add-transaction-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTransaction();
        });
        
        // 거래 유형별 카테고리 저장
        window.transactionCategoriesData = {
            income: incomeOptions,
            expense: expenseOptions
        };
        
        //console.log('거래 추가 모달 표시 완료');
    }

    // 거래 유형에 따른 카테고리 업데이트
    updateTransactionCategories() {
        const typeSelect = document.getElementById('transaction-type');
        const categorySelect = document.getElementById('transaction-category');
        
        if (!typeSelect || !categorySelect) return;
        
        const selectedType = typeSelect.value;
        
        if (selectedType && window.transactionCategoriesData) {
            categorySelect.innerHTML = `
                <option value="">카테고리 선택</option>
                ${window.transactionCategoriesData[selectedType]}
            `;
        } else {
            categorySelect.innerHTML = '<option value="">먼저 거래 유형을 선택하세요</option>';
        }
    }

    // 거래 추가 처리
    async handleAddTransaction() {
        const transactionData = {
            type: document.getElementById('transaction-type').value,
            amount: this.parseFormattedAmount(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            currency: document.getElementById('transaction-currency').value,
            date: document.getElementById('transaction-date').value,
            description: document.getElementById('transaction-description').value,
            notes: document.getElementById('transaction-notes').value,
            accountUserId: document.getElementById('transaction-user').value // 선택된 사용자 ID
        };
        
        // 유효성 검사
        if (!transactionData.type || !transactionData.amount || !transactionData.category || !transactionData.description) {
            this.showError('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        if (transactionData.amount <= 0) {
            this.showError('금액은 0보다 커야 합니다.');
            return;
        }
        
        try {
            //console.log('거래 추가 중:', transactionData);
            const newTransaction = await this.dbManager.createTransaction(transactionData);
            //console.log('거래 추가 완료:', newTransaction);
            
            this.showToast('거래가 성공적으로 추가되었습니다!');
            this.closeTransactionModal();
            
            // 현재 거래내역 페이지나 대시보드라면 새로고침
            if (this.currentView === 'transactions' || this.currentView === 'dashboard') {
                this.navigateTo(this.currentView);
            }
            
        } catch (error) {
            console.error('거래 추가 실패:', error);
            this.showError('거래 추가 중 오류가 발생했습니다.');
        }
    }

    // 거래 모달 닫기
    closeTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        this.closeModal(modal);
        
        // 임시 데이터 정리
        if (window.transactionCategoriesData) {
            delete window.transactionCategoriesData;
        }
    }

    // 거래 수정 모달 표시
    async showEditTransactionModal(transactionId) {
        try {
            //console.log('거래 수정 모달 표시, ID:', transactionId);
            
            // 거래 데이터 가져오기
            const transaction = await this.dbManager.getTransaction(transactionId);
            if (!transaction) {
                this.showError('거래를 찾을 수 없습니다.');
                return;
            }
            
            // 카테고리 옵션 생성
            const incomeOptions = Object.entries(this.transactionCategories.income)
                .map(([key, cat]) => `<option value="${key}" ${key === transaction.category && transaction.type === 'income' ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`)
                .join('');
            
            const expenseOptions = Object.entries(this.transactionCategories.expense)
                .map(([key, cat]) => `<option value="${key}" ${key === transaction.category && transaction.type === 'expense' ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`)
                .join('');
                
            // 통화 옵션 생성
            const currencyOptions = Object.entries(this.currencies)
                .map(([code, curr]) => `<option value="${code}" ${code === transaction.currency ? 'selected' : ''}>${curr.symbol} ${curr.name}</option>`)
                .join('');

            // 사용자 옵션 생성
            const users = await this.dbManager.getAllAccountUsers();
            const userOptions = users.map(user => `
                <option value="${user.id}" ${user.id === transaction.accountUserId ? 'selected' : ''}>
                    ${user.name} ${user.relationship ? `(${user.relationship})` : ''}
                </option>
            `).join('');
            
            const modalHtml = `
                <div class="modal-overlay" id="transaction-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>✏️ 거래 수정</h2>
                            <button class="modal-close" onclick="budgetApp.closeTransactionModal()">&times;</button>
                        </div>
                        
                        <form id="edit-transaction-form" class="modal-form">
                            <input type="hidden" id="transaction-id" value="${transaction.id}">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>거래 유형 *</label>
                                    <select id="transaction-type" required onchange="budgetApp.updateTransactionCategories()">
                                        <option value="">거래 유형 선택</option>
                                        <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>💸 수입</option>
                                        <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>💰 지출</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>금액 *</label>
                                    <input type="text" id="transaction-amount" required placeholder="예: 1,000,000" 
                                           value="${Math.abs(transaction.amount).toLocaleString('ko-KR')}"
                                           oninput="budgetApp.formatAmountInput(this)" 
                                           onkeypress="return budgetApp.validateNumberInput(event)">
                                    <div class="amount-korean" id="amount-korean-edit" style="font-size: 0.85em; color: #666; margin-top: 4px; min-height: 18px;"></div>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>카테고리 *</label>
                                    <select id="transaction-category" required>
                                        <option value="">카테고리 선택</option>
                                        ${transaction.type === 'income' ? incomeOptions : expenseOptions}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>통화</label>
                                    <select id="transaction-currency" onchange="budgetApp.updateKoreanDisplay()">
                                        ${currencyOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>거래 일자 *</label>
                                    <input type="date" id="transaction-date" required value="${transaction.date}">
                                </div>
                                
                                <div class="form-group">
                                    <label>내용 *</label>
                                    <input type="text" id="transaction-description" required value="${transaction.description}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>사용자 *</label>
                                    <select id="transaction-user" required>
                                        ${userOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>메모</label>
                                <textarea id="transaction-notes" rows="3">${transaction.notes || ''}</textarea>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" onclick="budgetApp.closeTransactionModal()">취소</button>
                                <button type="submit" class="btn-primary">거래 수정</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // 모달 오버레이 클릭으로 닫기 기능 추가
            const modal = document.querySelector('.modal-overlay:last-child');
            this.addModalCloseOnOverlayClick(modal);
            
            // 폼 제출 이벤트 리스너 추가
            const form = document.getElementById('edit-transaction-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditTransaction();
            });
            
            // 초기 한글 표시
            setTimeout(() => {
                const amountInput = document.getElementById('transaction-amount');
                const currencySelect = document.getElementById('transaction-currency');
                if (amountInput && amountInput.value) {
                    const selectedCurrency = currencySelect ? currencySelect.value : 'KRW';
                    const korean = this.numberToKorean(this.parseFormattedAmount(amountInput.value), selectedCurrency);
                    const koreanElement = document.getElementById('amount-korean-edit');
                    if (koreanElement) {
                        koreanElement.textContent = korean;
                    }
                }
            }, 100);

            // 거래 유형별 카테고리 저장
            window.transactionCategoriesData = {
                income: incomeOptions,
                expense: expenseOptions
            };
            
            //console.log('거래 수정 모달 표시 완료');
            
        } catch (error) {
            console.error('거래 수정 모달 표시 실패:', error);
            this.showError('거래 정보를 불러올 수 없습니다.');
        }
    }

    // 거래 수정 처리
    async handleEditTransaction() {
        const transactionId = document.getElementById('transaction-id').value;
        const transactionData = {
            type: document.getElementById('transaction-type').value,
            amount: this.parseFormattedAmount(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            currency: document.getElementById('transaction-currency').value,
            date: document.getElementById('transaction-date').value,
            description: document.getElementById('transaction-description').value,
            notes: document.getElementById('transaction-notes').value,
            accountUserId: document.getElementById('transaction-user').value // 선택된 사용자 ID
        };
        
        // 유효성 검사
        if (!transactionData.type || !transactionData.amount || !transactionData.category || !transactionData.description) {
            this.showError('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        if (transactionData.amount <= 0) {
            this.showError('금액은 0보다 커야 합니다.');
            return;
        }
        
        try {
            //console.log('거래 수정 중:', transactionData);
            const updatedTransaction = await this.dbManager.updateTransaction(transactionId, transactionData);
            //console.log('거래 수정 완료:', updatedTransaction);
            
            this.showToast('거래가 성공적으로 수정되었습니다!');
            this.closeTransactionModal();
            
            // 현재 거래내역 페이지나 대시보드라면 새로고침
            if (this.currentView === 'transactions' || this.currentView === 'dashboard') {
                this.navigateTo(this.currentView);
            }
            
        } catch (error) {
            console.error('거래 수정 실패:', error);
            this.showError('거래 수정 중 오류가 발생했습니다.');
        }
    }

    // 거래 삭제
    async deleteTransaction(transactionId) {
        if (!confirm('이 거래를 삭제하시겠습니까?')) {
            return;
        }
        
        try {
            //console.log('거래 삭제 중, ID:', transactionId);
            await this.dbManager.deleteTransaction(transactionId);
            //console.log('거래 삭제 완료');
            
            this.showToast('거래가 성공적으로 삭제되었습니다!');
            
            // 현재 거래내역 페이지나 대시보드라면 새로고침
            if (this.currentView === 'transactions' || this.currentView === 'dashboard') {
                this.navigateTo(this.currentView);
            }
            
        } catch (error) {
            console.error('거래 삭제 실패:', error);
            this.showError('거래 삭제 중 오류가 발생했습니다.');
        }
    }

    // 포함 설정 로드
    async loadInclusionSettings() {
        try {
            // 개인 앱이므로 localStorage에서 설정을 가져오거나 기본값 설정
            const savedSettings = localStorage.getItem('inclusion-settings');
            const inclusionSettings = savedSettings ? JSON.parse(savedSettings) : this.getDefaultInclusionSettings();
            
            // 자산 유형별 설정 렌더링
            this.renderAssetInclusionSettings(inclusionSettings.assets);
            
            // 거래 카테고리별 설정 렌더링
            this.renderTransactionInclusionSettings(inclusionSettings.transactions);
            
        } catch (error) {
            console.error('포함 설정 로드 실패:', error);
            this.showError('설정을 불러올 수 없습니다.');
        }
    }

    // 기본 포함 설정 반환
    getDefaultInclusionSettings() {
        const defaultSettings = {
            assets: {},
            transactions: {
                income: {},
                expense: {}
            }
        };

        // 자산 유형별 기본값 (모든 유형 포함)
        Object.keys(this.assetTypes).forEach(type => {
            defaultSettings.assets[type] = true;
        });

        // 거래 카테고리별 기본값 (모든 카테고리 포함)
        Object.keys(this.transactionCategories.income).forEach(category => {
            defaultSettings.transactions.income[category] = true;
        });
        Object.keys(this.transactionCategories.expense).forEach(category => {
            defaultSettings.transactions.expense[category] = true;
        });

        return defaultSettings;
    }

    // 자산 포함 설정 렌더링
    renderAssetInclusionSettings(assetSettings) {
        const container = document.getElementById('asset-inclusion-settings');
        if (!container) return;

        const html = Object.entries(this.assetTypes).map(([type, typeInfo]) => {
            const isIncluded = assetSettings[type] !== false; // 기본값은 true
            
            return `
                <div class="toggle-item">
                    <label class="toggle-label">
                        <input type="checkbox" 
                               ${isIncluded ? 'checked' : ''} 
                               onchange="budgetApp.updateAssetInclusion('${type}', this.checked)">
                        <span class="toggle-switch"></span>
                        <span class="toggle-text">
                            ${typeInfo.icon} ${typeInfo.name}
                        </span>
                    </label>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // 거래 포함 설정 렌더링
    renderTransactionInclusionSettings(transactionSettings) {
        // 수입 카테고리 렌더링
        const incomeContainer = document.getElementById('income-inclusion-settings');
        if (incomeContainer) {
            const incomeHtml = Object.entries(this.transactionCategories.income).map(([category, categoryInfo]) => {
                const isIncluded = transactionSettings.income[category] !== false;
                
                return `
                    <div class="toggle-item">
                        <label class="toggle-label">
                            <input type="checkbox" 
                                   ${isIncluded ? 'checked' : ''} 
                                   onchange="budgetApp.updateTransactionInclusion('income', '${category}', this.checked)">
                            <span class="toggle-switch"></span>
                            <span class="toggle-text">
                                ${categoryInfo.icon} ${categoryInfo.name}
                            </span>
                        </label>
                    </div>
                `;
            }).join('');
            incomeContainer.innerHTML = incomeHtml;
        }

        // 지출 카테고리 렌더링
        const expenseContainer = document.getElementById('expense-inclusion-settings');
        if (expenseContainer) {
            const expenseHtml = Object.entries(this.transactionCategories.expense).map(([category, categoryInfo]) => {
                const isIncluded = transactionSettings.expense[category] !== false;
                
                return `
                    <div class="toggle-item">
                        <label class="toggle-label">
                            <input type="checkbox" 
                                   ${isIncluded ? 'checked' : ''} 
                                   onchange="budgetApp.updateTransactionInclusion('expense', '${category}', this.checked)">
                            <span class="toggle-switch"></span>
                            <span class="toggle-text">
                                ${categoryInfo.icon} ${categoryInfo.name}
                            </span>
                        </label>
                    </div>
                `;
            }).join('');
            expenseContainer.innerHTML = expenseHtml;
        }
    }

    // 자산 포함 설정 업데이트
    async updateAssetInclusion(assetType, include) {
        try {
            // localStorage에서 현재 설정을 가져오거나 기본값 사용
            const savedSettings = localStorage.getItem('inclusion-settings');
            const inclusionSettings = savedSettings ? JSON.parse(savedSettings) : this.getDefaultInclusionSettings();
            
            // 자산 포함 설정 업데이트
            inclusionSettings.assets[assetType] = include;
            
            // localStorage에 저장
            localStorage.setItem('inclusion-settings', JSON.stringify(inclusionSettings));
            
            this.showToast(`${this.assetTypes[assetType].name} 자산 포함 설정이 ${include ? '포함' : '제외'}로 변경되었습니다.`);
            
            // 대시보드가 현재 보이고 있다면 새로고침
            if (this.currentView === 'dashboard') {
                this.loadDashboardData();
            }
            
        } catch (error) {
            console.error('자산 포함 설정 업데이트 실패:', error);
            this.showError('설정 저장에 실패했습니다.');
        }
    }

    // 거래 포함 설정 업데이트
    async updateTransactionInclusion(type, category, include) {
        try {
            // localStorage에서 현재 설정을 가져오거나 기본값 사용
            const savedSettings = localStorage.getItem('inclusion-settings');
            const inclusionSettings = savedSettings ? JSON.parse(savedSettings) : this.getDefaultInclusionSettings();
            
            // 거래 포함 설정 업데이트
            inclusionSettings.transactions[type][category] = include;
            
            // localStorage에 저장
            localStorage.setItem('inclusion-settings', JSON.stringify(inclusionSettings));
            
            const categoryName = this.transactionCategories[type][category].name;
            this.showToast(`${categoryName} 카테고리 포함 설정이 ${include ? '포함' : '제외'}로 변경되었습니다.`);
            
            // 대시보드가 현재 보이고 있다면 새로고침
            if (this.currentView === 'dashboard') {
                this.loadDashboardData();
            }
            
        } catch (error) {
            console.error('거래 포함 설정 업데이트 실패:', error);
            this.showError('설정 저장에 실패했습니다.');
        }
    }

    // 에러 메시지 표시
    showError(message) {
        this.showToast(message, 'error');
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        //console.log('이벤트 리스너 설정 시작');
        
        // 전역 이벤트 위임 사용
        document.addEventListener('click', (e) => {
            // 인증 탭 전환
            if (e.target.matches('.auth-tab')) {
                this.handleAuthTabClick(e);
            }
            
            // 네비게이션 클릭 (전체 버튼 영역)
            if (e.target.matches('.nav-item') || e.target.closest('.nav-item')) {
                this.handleNavigationClick(e);
            }
            
            // 완전 초기화 버튼
            if (e.target.matches('#reset-btn')) {
                this.completeReset();
            }
        });
        
        // 폼 제출 이벤트
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#login-form')) {
                e.preventDefault();
                this.handleLogin(e);
            }
            
            if (e.target.matches('#register-form')) {
                e.preventDefault();
                this.handleRegister(e);
            }
        });
        
        //console.log('이벤트 리스너 설정 완료');
    }

    // 인증 탭 클릭 처리
    handleAuthTabClick(e) {
        const tabName = e.target.dataset.tab;
        
        // 모든 탭 비활성화
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 모든 폼 숨기기
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        
        // 클릭된 탭 활성화
        e.target.classList.add('active');
        
        // 해당 폼 표시
        const targetForm = document.getElementById(`${tabName}-form`);
        if (targetForm) {
            targetForm.style.display = 'block';
        }
    }

    // 네비게이션 클릭 처리
    handleNavigationClick(e) {
        e.preventDefault();
        
        // 클릭된 요소가 nav-item이 아니라면 부모에서 찾기
        const navItem = e.target.matches('.nav-item') ? e.target : e.target.closest('.nav-item');
        
        if (!navItem) return;
        
        const viewName = navItem.dataset.nav;
        
        if (viewName && viewName !== this.currentView) {
            // 기존 navigateTo 메서드가 있다면 우선 사용
            if (typeof this.navigateTo === 'function') {
                this.navigateTo(viewName);
            } else {
                this.showView(viewName);
            }
        }
    }

    // 뷰 전환
    showView(viewName) {
        //console.log(`뷰 전환: ${this.currentView} → ${viewName}`);
        
        // 현재 뷰 업데이트
        this.currentView = viewName;
        
        // 네비게이션 활성화 상태 업데이트
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-nav="${viewName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // 뷰에 따른 콘텐츠 로드
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('main-content 요소를 찾을 수 없습니다.');
            return;
        }
        
        switch (viewName) {
            case 'dashboard':
                this.loadDashboardView();
                break;
            case 'transactions':
                this.loadTransactionsView();
                break;
            case 'assets':
                this.loadAssetsView();
                break;
            case 'reports':
                this.loadReportsView();
                break;
            case 'settings':
                this.loadSettingsView();
                break;
            default:
                console.warn(`알 수 없는 뷰: ${viewName}`);
                this.loadDashboardView(); // 기본값으로 대시보드 로드
        }
    }

    // 대시보드 뷰 로드
    loadDashboardView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '<div class="loading">대시보드를 로드하는 중...</div>';
        
        // 기존 대시보드 로직 호출
        if (typeof this.loadDashboardData === 'function') {
            this.loadDashboardData();
        } else {
            mainContent.innerHTML = `
                <div class="dashboard-placeholder">
                    <h2>🏠 대시보드</h2>
                    <p>대시보드 기능이 구현 중입니다.</p>
                </div>
            `;
        }
    }

    // 거래내역 뷰 로드
    loadTransactionsView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="transactions-view">
                <h2>💳 거래내역</h2>
                <p>거래내역 기능이 구현 중입니다.</p>
            </div>
        `;
    }

    // 자산관리 뷰 로드
    loadAssetsView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="assets-view">
                <h2>🏦 자산관리</h2>
                <p>자산관리 기능이 구현 중입니다.</p>
            </div>
        `;
    }

    // 리포트 뷰 로드
    async loadReportsView() {
        const mainContent = document.getElementById('main-content');
        
        try {
            // 사용자 목록 가져오기
            const users = await this.dbManager.getAllAccountUsers();
            const userOptions = users.map(user => 
                `<option value="${user.id}" ${user.id === this.selectedAccountUserId ? 'selected' : ''}>${user.name}</option>`
            ).join('');

            mainContent.innerHTML = `
                <div class="reports-view">
                    <div class="view-header">
                        <h2><span class="view-icon">📊</span> 리포트</h2>
                        
                        ${await this.generateUserSelector()}
                    </div>

                    <div class="reports-content">
                        <div class="report-section">
                            <h3>월별 수입/지출 현황</h3>
                            <div class="chart-container">
                                <canvas id="monthly-chart"></canvas>
                            </div>
                        </div>

                        <div class="report-section">
                            <h3>카테고리별 지출 분석</h3>
                            <div class="chart-container">
                                <canvas id="category-chart"></canvas>
                            </div>
                        </div>

                        <div class="report-section">
                            <h3>자산 구성 현황</h3>
                            <div class="chart-container">
                                <canvas id="asset-chart"></canvas>
                            </div>
                        </div>

                        <div class="report-summary">
                            <h3>요약 정보</h3>
                            <div id="report-summary-content" class="summary-grid">
                                <!-- 요약 정보가 여기에 로드됩니다 -->
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 차트 데이터 로드
            await this.loadReportCharts();
            
        } catch (error) {
            console.error('리포트 로드 실패:', error);
            mainContent.innerHTML = `
                <div class="reports-view">
                    <h2>📊 리포트</h2>
                    <div class="error-message">
                        <p>❌ 리포트 데이터를 불러오는 중 오류가 발생했습니다.</p>
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
        }
    }

    // 리포트 차트 로드
    async loadReportCharts() {
        try {
            // 필터 설정
            const filters = {};
            if (this.selectedAccountUserId && this.selectedAccountUserId !== 'all') {
                filters.accountUserId = this.selectedAccountUserId;
            }

            // 데이터 가져오기
            const transactions = await this.dbManager.getTransactions(null, filters);
            const assets = await this.dbManager.getAssets(null, filters);

            // 월별 수입/지출 차트
            await this.renderMonthlyChart(transactions);
            
            // 카테고리별 지출 차트
            await this.renderCategoryChart(transactions);
            
            // 자산 구성 차트
            await this.renderAssetChart(assets);
            
            // 요약 정보
            await this.renderReportSummary(transactions, assets);
            
        } catch (error) {
            console.error('차트 로드 실패:', error);
        }
    }

    // 월별 수입/지출 차트 렌더링
    async renderMonthlyChart(transactions) {
        const canvas = document.getElementById('monthly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 최근 6개월 데이터 준비
        const monthlyData = this.prepareMonthlyData(transactions);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: '수입',
                        data: monthlyData.income,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '지출',
                        data: monthlyData.expenses,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '월별 수입/지출 추이'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ko-KR').format(value) + '원';
                            }
                        }
                    }
                }
            }
        });
    }

    // 카테고리별 지출 차트 렌더링
    async renderCategoryChart(transactions) {
        const canvas = document.getElementById('category-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 카테고리별 지출 데이터 준비
        const categoryData = this.prepareCategoryData(transactions);
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '카테고리별 지출 분석'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 자산 구성 차트 렌더링
    async renderAssetChart(assets) {
        const canvas = document.getElementById('asset-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 자산 유형별 데이터 준비
        const assetData = this.prepareAssetData(assets);
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: assetData.labels,
                datasets: [{
                    data: assetData.values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '자산 구성 현황'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 리포트 요약 렌더링
    async renderReportSummary(transactions, assets) {
        const summaryElement = document.getElementById('report-summary-content');
        if (!summaryElement) return;

        // 이번 달 통계 계산
        const thisMonth = new Date();
        const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
        
        const monthlyTransactions = transactions.filter(t => 
            new Date(t.date) >= startOfMonth
        );

        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
        
        const balance = totalIncome - totalExpenses;

        summaryElement.innerHTML = `
            <div class="summary-card income">
                <div class="summary-icon">💰</div>
                <div class="summary-info">
                    <h4>이번 달 수입</h4>
                    <p class="summary-amount">${this.formatCurrency(totalIncome)}</p>
                </div>
            </div>
            
            <div class="summary-card expense">
                <div class="summary-icon">💸</div>
                <div class="summary-info">
                    <h4>이번 달 지출</h4>
                    <p class="summary-amount">${this.formatCurrency(totalExpenses)}</p>
                </div>
            </div>
            
            <div class="summary-card balance ${balance >= 0 ? 'positive' : 'negative'}">
                <div class="summary-icon">${balance >= 0 ? '📈' : '📉'}</div>
                <div class="summary-info">
                    <h4>이번 달 수지</h4>
                    <p class="summary-amount">${this.formatCurrency(balance)}</p>
                </div>
            </div>
            
            <div class="summary-card assets">
                <div class="summary-icon">🏦</div>
                <div class="summary-info">
                    <h4>총 자산</h4>
                    <p class="summary-amount">${this.formatCurrency(totalAssets)}</p>
                </div>
            </div>
        `;
    }

    // 월별 데이터 준비
    prepareMonthlyData(transactions) {
        const now = new Date();
        const months = [];
        const income = [];
        const expenses = [];

        // 최근 6개월
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            months.push(`${date.getMonth() + 1}월`);
            
            const monthlyTransactions = transactions.filter(t => 
                t.date.startsWith(monthStr)
            );
            
            const monthlyIncome = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const monthlyExpenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            income.push(monthlyIncome);
            expenses.push(monthlyExpenses);
        }

        return {
            labels: months,
            income,
            expenses
        };
    }

    // 카테고리별 데이터 준비
    prepareCategoryData(transactions) {
        const categoryTotals = {};
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const categoryInfo = this.transactionCategories.expense[t.category];
                const categoryName = categoryInfo ? categoryInfo.name : t.category;
                categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + Math.abs(t.amount);
            });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // 상위 10개만

        return {
            labels: sortedCategories.map(([name]) => name),
            values: sortedCategories.map(([,value]) => value)
        };
    }

    // 자산별 데이터 준비
    prepareAssetData(assets) {
        const assetTotals = {};
        
        assets.forEach(asset => {
            const assetTypeInfo = this.assetTypes[asset.type];
            const typeName = assetTypeInfo ? assetTypeInfo.name : asset.type;
            assetTotals[typeName] = (assetTotals[typeName] || 0) + asset.currentValue;
        });

        const sortedAssets = Object.entries(assetTotals)
            .sort(([,a], [,b]) => b - a);

        return {
            labels: sortedAssets.map(([name]) => name),
            values: sortedAssets.map(([,value]) => value)
        };
    }

    // 설정 뷰 로드
    loadSettingsView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="settings-view">
                <h2>⚙️ 설정</h2>
                
                <div class="settings-section">
                    <h3>🔧 관리자 기능</h3>
                    <div class="admin-controls">
                        <button id="reset-all-passwords-btn" class="btn-danger" onclick="budgetApp.resetAllUserPasswords()">
                            🔑 모든 계정 비밀번호 초기화 (111111)
                        </button>
                        <p class="warning-text">⚠️ 이 기능은 데이터베이스의 모든 사용자 비밀번호를 111111로 변경합니다.</p>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>📱 앱 정보</h3>
                    <p>하이브리드 가계부 Pro v1.0</p>
                    <p>개인 맞춤형 재정 관리 솔루션</p>
                </div>
            </div>
        `;
    }

    // 모든 사용자 비밀번호 초기화
    async resetAllUserPasswords() {
        const confirmMessage = `모든 사용자의 비밀번호를 '111111'으로 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            this.showToast('비밀번호 초기화 중...', 'info');
            
            const result = await this.dbManager.resetAllPasswords('111111');
            
            if (result.success) {
                this.showToast(`✅ 성공: ${result.updated}명의 사용자 비밀번호가 '${result.newPassword}'로 초기화되었습니다.`, 'success');
                //console.log('비밀번호 초기화 결과:', result);
            } else {
                this.showError('비밀번호 초기화에 실패했습니다.');
            }
            
        } catch (error) {
            console.error('비밀번호 초기화 실패:', error);
            this.showError(`비밀번호 초기화 실패: ${error.message}`);
        }
    }

    // 로그인 처리
    async handleLogin(e) {
        try {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                this.showError('이메일과 비밀번호를 모두 입력해주세요.');
                return;
            }
            
            if (password.length < 6) {
                this.showError('비밀번호는 최소 6자 이상이어야 합니다.');
                return;
            }
            
            // 사용자 조회
            const users = await this.dbManager.getUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                this.showError('등록되지 않은 이메일입니다.');
                return;
            }
            
            // 비밀번호 검증 (실제 프로덕션에서는 해시 비교 필요)
            if (user.password !== password) {
                this.showError('비밀번호가 올바르지 않습니다.');
                return;
            }
            
            // 로그인 성공
            this.currentUser = user;
            this.dbManager.setCurrentUser(user.id);
            await this.showMainApp();
            this.showToast('로그인되었습니다.');
            
        } catch (error) {
            console.error('로그인 실패:', error);
            this.showError('로그인 중 오류가 발생했습니다.');
        }
    }

    // 회원가입 처리
    async handleRegister(e) {
        try {
            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;
            const displayName = document.getElementById('register-displayname').value.trim();
            const currency = document.getElementById('register-currency').value;
            
            // 유효성 검사
            if (!username || !email || !password || !passwordConfirm || !displayName) {
                this.showError('모든 필드를 입력해주세요.');
                return;
            }
            
            if (password.length < 6) {
                this.showError('비밀번호는 최소 6자 이상이어야 합니다.');
                return;
            }
            
            if (password !== passwordConfirm) {
                this.showError('비밀번호가 일치하지 않습니다.');
                return;
            }
            
            // 이메일 중복 확인
            const users = await this.dbManager.getUsers();
            if (users.some(u => u.email === email)) {
                this.showError('이미 등록된 이메일입니다.');
                return;
            }
            
            // 사용자 생성
            const userId = await this.dbManager.addUser({
                username,
                email,
                password, // 실제 프로덕션에서는 해시화 필요
                displayName,
                defaultCurrency: currency,
                settings: {
                    inclusionSettings: this.getDefaultInclusionSettings()
                },
                createdAt: new Date().toISOString()
            });
            
            // 기본 계좌 생성
            await this.createDefaultAccount(userId);
            
            // 자동 로그인
            this.currentUser = await this.dbManager.getUser(userId);
            this.dbManager.setCurrentUser(userId);
            await this.showMainApp();
            this.showToast('회원가입이 완료되었습니다.');
            
        } catch (error) {
            console.error('회원가입 실패:', error);
            this.showError('회원가입 중 오류가 발생했습니다.');
        }
    }

    // 통계 설정 토글
    toggleStatisticsSettings() {
        const content = document.getElementById('statistics-settings-content');
        const icon = document.getElementById('statistics-expand-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▲';
        } else {
            content.style.display = 'none';
            icon.textContent = '▼';
        }
    }

    // 사용자 목록 로드
    async loadUserList() {
        try {
            const users = await this.dbManager.getAllAccountUsers();
            const userListElement = document.getElementById('user-list');
            
            if (!users || users.length === 0) {
                userListElement.innerHTML = `
                    <div class="empty-state">
                        <p>등록된 사용자가 없습니다.</p>
                        <p>첫 번째 사용자를 추가해보세요!</p>
                    </div>
                `;
                return;
            }

            const userListHtml = users.map((user, index) => `
                <div class="user-item ${user.id === this.currentUser.id ? 'current-user' : ''}">
                    <div class="user-info">
                        <div class="user-avatar">
                            <span>${user.name ? user.name.charAt(0).toUpperCase() : '👤'}</span>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.name || '이름 없음'}</div>
                            <div class="user-meta">
                                ${user.relationship ? user.relationship + ' • ' : ''}
                                ${user.birthDate ? new Date(user.birthDate).toLocaleDateString() : ''}
                                ${index === 0 ? ' • 주 사용자' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn-icon" onclick="budgetApp.editUser('${user.id}')" title="수정">
                            ✏️
                        </button>
                        ${users.length > 1 ? `
                            <button class="btn-icon" onclick="budgetApp.deleteUser('${user.id}')" title="삭제">
                                🗑️
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');

            userListElement.innerHTML = userListHtml;
        } catch (error) {
            console.error('사용자 목록 로드 실패:', error);
            document.getElementById('user-list').innerHTML = `
                <div class="error-state">
                    <p>사용자 목록을 불러올 수 없습니다.</p>
                </div>
            `;
        }
    }

    // 사용자 추가 모달 표시
    showAddUserModal() {
        const modalHtml = `
            <div class="modal-overlay" id="add-user-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>👤 사용자 추가</h2>
                        <button class="modal-close" onclick="budgetApp.closeAddUserModal()">&times;</button>
                    </div>
                    
                    <form id="add-user-form" class="modal-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>이름 *</label>
                                <input type="text" id="user-name" required placeholder="실명을 입력하세요">
                            </div>
                            
                            <div class="form-group">
                                <label>관계</label>
                                <select id="user-relationship">
                                    <option value="">선택하세요</option>
                                    <option value="본인">본인</option>
                                    <option value="배우자">배우자</option>
                                    <option value="자녀">자녀</option>
                                    <option value="부모">부모</option>
                                    <option value="형제자매">형제자매</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>생년월일</label>
                                <input type="date" id="user-birthdate">
                            </div>
                            
                            <div class="form-group">
                                <label>성별</label>
                                <select id="user-gender">
                                    <option value="">선택하세요</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>직업</label>
                                <input type="text" id="user-occupation" placeholder="직업을 입력하세요">
                            </div>
                            
                            <div class="form-group">
                                <label>연락처</label>
                                <input type="tel" id="user-phone" placeholder="010-0000-0000">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>메모</label>
                            <textarea id="user-notes" placeholder="추가 정보나 메모를 입력하세요" rows="3"></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="budgetApp.closeAddUserModal()">취소</button>
                            <button type="submit" class="btn-primary">사용자 추가</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 모달 오버레이 클릭으로 닫기 기능 추가
        const modal = document.getElementById('add-user-modal');
        this.addModalCloseOnOverlayClick(modal);
        
        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddUser();
        });
    }

    // 사용자 추가 처리
    async handleAddUser() {
        try {
            const userData = {
                name: document.getElementById('user-name').value,
                relationship: document.getElementById('user-relationship').value,
                birthDate: document.getElementById('user-birthdate').value,
                gender: document.getElementById('user-gender').value,
                occupation: document.getElementById('user-occupation').value,
                phone: document.getElementById('user-phone').value,
                notes: document.getElementById('user-notes').value
            };

            if (!userData.name.trim()) {
                this.showError('이름은 필수 입력 항목입니다.');
                return;
            }

            await this.dbManager.addAccountUser(userData);
            this.closeAddUserModal();
            this.loadUserList();
            this.showToast('사용자가 성공적으로 추가되었습니다!');
            
        } catch (error) {
            console.error('사용자 추가 실패:', error);
            this.showError('사용자 추가에 실패했습니다: ' + error.message);
        }
    }

    // 사용자 추가 모달 닫기
    closeAddUserModal() {
        const modal = document.getElementById('add-user-modal');
        this.closeModal(modal);
    }

    // 사용자 수정
    async editUser(userId) {
        try {
            const user = await this.dbManager.getAccountUser(userId);
            if (!user) {
                this.showError('사용자를 찾을 수 없습니다.');
                return;
            }

            const modalHtml = `
                <div class="modal-overlay" id="edit-user-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>✏️ 사용자 수정</h2>
                            <button class="modal-close" onclick="budgetApp.closeEditUserModal()">&times;</button>
                        </div>
                        
                        <form id="edit-user-form" class="modal-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>이름 *</label>
                                    <input type="text" id="edit-user-name" required placeholder="실명을 입력하세요" value="${user.name || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label>관계</label>
                                    <select id="edit-user-relationship">
                                        <option value="">선택하세요</option>
                                        <option value="본인" ${user.relationship === '본인' ? 'selected' : ''}>본인</option>
                                        <option value="배우자" ${user.relationship === '배우자' ? 'selected' : ''}>배우자</option>
                                        <option value="자녀" ${user.relationship === '자녀' ? 'selected' : ''}>자녀</option>
                                        <option value="부모" ${user.relationship === '부모' ? 'selected' : ''}>부모</option>
                                        <option value="형제자매" ${user.relationship === '형제자매' ? 'selected' : ''}>형제자매</option>
                                        <option value="기타" ${user.relationship === '기타' ? 'selected' : ''}>기타</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>생년월일</label>
                                    <input type="date" id="edit-user-birthdate" value="${user.birthDate || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label>성별</label>
                                    <select id="edit-user-gender">
                                        <option value="">선택하세요</option>
                                        <option value="male" ${user.gender === 'male' ? 'selected' : ''}>남성</option>
                                        <option value="female" ${user.gender === 'female' ? 'selected' : ''}>여성</option>
                                        <option value="other" ${user.gender === 'other' ? 'selected' : ''}>기타</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>직업</label>
                                    <input type="text" id="edit-user-occupation" placeholder="직업을 입력하세요" value="${user.occupation || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label>연락처</label>
                                    <input type="tel" id="edit-user-phone" placeholder="010-0000-0000" value="${user.phone || ''}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>메모</label>
                                <textarea id="edit-user-notes" placeholder="추가 정보나 메모를 입력하세요" rows="3">${user.notes || ''}</textarea>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" onclick="budgetApp.closeEditUserModal()">취소</button>
                                <button type="submit" class="btn-primary">수정 완료</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            document.getElementById('edit-user-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditUser(userId);
            });

        } catch (error) {
            console.error('사용자 수정 모달 표시 실패:', error);
            this.showError('사용자 정보를 불러올 수 없습니다.');
        }
    }

    // 사용자 수정 처리
    async handleEditUser(userId) {
        try {
            const userData = {
                name: document.getElementById('edit-user-name').value,
                relationship: document.getElementById('edit-user-relationship').value,
                birthDate: document.getElementById('edit-user-birthdate').value,
                gender: document.getElementById('edit-user-gender').value,
                occupation: document.getElementById('edit-user-occupation').value,
                phone: document.getElementById('edit-user-phone').value,
                notes: document.getElementById('edit-user-notes').value
            };

            if (!userData.name.trim()) {
                this.showError('이름은 필수 입력 항목입니다.');
                return;
            }

            await this.dbManager.updateAccountUser(userId, userData);
            this.closeEditUserModal();
            this.loadUserList();
            this.showToast('사용자 정보가 성공적으로 수정되었습니다!');
            
        } catch (error) {
            console.error('사용자 수정 실패:', error);
            this.showError('사용자 수정에 실패했습니다: ' + error.message);
        }
    }

    // 사용자 수정 모달 닫기
    closeEditUserModal() {
        const modal = document.getElementById('edit-user-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 사용자 삭제
    async deleteUser(userId) {
        if (!confirm('이 사용자를 삭제하시겠습니까?\n관련된 모든 데이터가 함께 삭제됩니다.')) {
            return;
        }

        try {
            await this.dbManager.deleteAccountUser(userId);
            this.loadUserList();
            this.showToast('사용자가 성공적으로 삭제되었습니다.');
            
        } catch (error) {
            console.error('사용자 삭제 실패:', error);
            this.showError('사용자 삭제에 실패했습니다: ' + error.message);
        }
    }

    // 사용자 선택 컴포넌트 생성
    async generateUserSelector() {
        try {
            const users = await this.dbManager.getAllAccountUsers();
            
            if (!users || users.length === 0) {
                return `
                    <div class="user-selector-empty">
                        <span>📝 사용자를 먼저 추가해주세요</span>
                    </div>
                `;
            }

            // 첫 번째 사용자를 기본으로 선택
            if (!this.selectedAccountUserId && users.length > 0) {
                this.selectedAccountUserId = users[0].id;
            }

            const userOptions = users.map(user => `
                <option value="${user.id}" ${user.id === this.selectedAccountUserId ? 'selected' : ''}>
                    ${user.name} ${user.relationship ? `(${user.relationship})` : ''}
                </option>
            `).join('');

            return `
                <div class="user-selector">
                    <label for="account-user-select">
                        <span class="user-selector-icon">👤</span>
                        사용자 선택:
                    </label>
                    <select id="account-user-select" onchange="budgetApp.onAccountUserChange(this.value)">
                        <option value="all" ${this.selectedAccountUserId === 'all' ? 'selected' : ''}>전체 보기</option>
                        ${userOptions}
                    </select>
                </div>
            `;
        } catch (error) {
            console.error('사용자 선택기 생성 실패:', error);
            return '';
        }
    }

    // 사용자 선택 변경 시
    onAccountUserChange(userId) {
        this.selectedAccountUserId = userId || 'all';
        
        // 현재 뷰 새로고침
        switch (this.currentView) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'transactions':
                this.navigateTo('transactions');
                break;
            case 'assets':
                this.navigateTo('assets');
                break;
            case 'reports':
                this.loadReportCharts();
                break;
        }
    }

    // 금액 입력 필드 포맷팅
    formatAmountInput(input) {
        // 현재 커서 위치 저장
        const cursorPosition = input.selectionStart;
        const oldValue = input.value;
        
        // 숫자만 추출
        const numbers = input.value.replace(/[^\d]/g, '');
        
        if (numbers === '') {
            input.value = '';
            // 모든 가능한 한글 표시 영역 클리어
            const koreanElements = ['amount-korean', 'amount-korean-edit'].map(id => document.getElementById(id)).filter(el => el);
            koreanElements.forEach(el => el.textContent = '');
            return;
        }
        
        // 천단위 콤마 추가
        const formatted = parseInt(numbers).toLocaleString('ko-KR');
        input.value = formatted;
        
        // 현재 선택된 통화 가져오기
        const currencySelect = document.getElementById('transaction-currency');
        const selectedCurrency = currencySelect ? currencySelect.value : 'KRW';
        
        // 한글로 변환 (통화 반영)
        const korean = this.numberToKorean(parseInt(numbers), selectedCurrency);
        
        // 모든 가능한 한글 표시 영역에 적용
        const koreanElements = ['amount-korean', 'amount-korean-edit'].map(id => document.getElementById(id)).filter(el => el);
        koreanElements.forEach(el => el.textContent = korean);
        
        // 커서 위치 조정
        const difference = formatted.length - oldValue.length;
        const newPosition = cursorPosition + difference;
        setTimeout(() => {
            input.setSelectionRange(newPosition, newPosition);
        }, 0);
    }

    // 숫자 입력만 허용
    validateNumberInput(event) {
        const key = event.key;
        // 숫자, 백스페이스, 삭제, 방향키만 허용
        if (!/^\d$/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    // 숫자를 한글로 변환 (통화별 단위 포함)
    numberToKorean(num, currency = 'KRW') {
        if (num === 0) {
            const currencyUnits = {
                'KRW': '영원',
                'USD': '영달러',
                'EUR': '영유로',
                'JPY': '영엔',
                'CNY': '영위안'
            };
            return currencyUnits[currency] || '영원';
        }
        
        const units = ['', '만', '억', '조', '경'];
        const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
        const teens = ['', '십', '백', '천'];
        
        const numStr = num.toString();
        const len = numStr.length;
        let result = '';
        
        // 4자리씩 끊어서 처리
        const groups = [];
        for (let i = len; i > 0; i -= 4) {
            const start = Math.max(0, i - 4);
            const group = numStr.substring(start, i);
            groups.unshift(group);
        }
        
        groups.forEach((group, groupIndex) => {
            if (parseInt(group) === 0) return;
            
            let groupResult = '';
            const groupNum = parseInt(group);
            
            // 천의 자리
            const thousand = Math.floor(groupNum / 1000);
            if (thousand > 0) {
                if (thousand > 1) groupResult += digits[thousand];
                groupResult += '천';
            }
            
            // 백의 자리
            const hundred = Math.floor((groupNum % 1000) / 100);
            if (hundred > 0) {
                if (hundred > 1) groupResult += digits[hundred];
                groupResult += '백';
            }
            
            // 십의 자리
            const ten = Math.floor((groupNum % 100) / 10);
            if (ten > 0) {
                if (ten > 1) groupResult += digits[ten];
                groupResult += '십';
            }
            
            // 일의 자리
            const one = groupNum % 10;
            if (one > 0) {
                groupResult += digits[one];
            }
            
            // 단위 추가
            const unitIndex = groups.length - 1 - groupIndex;
            if (unitIndex > 0 && groupResult !== '') {
                groupResult += units[unitIndex];
            }
            
            result += groupResult;
        });
        
        // 통화별 단위 추가
        const currencyUnits = {
            'KRW': '원',
            'USD': '달러',
            'EUR': '유로',
            'JPY': '엔',
            'CNY': '위안'
        };
        
        return result + (currencyUnits[currency] || '원');
    }

    // 포맷된 금액을 숫자로 변환
    parseFormattedAmount(formattedAmount) {
        return parseInt(formattedAmount.replace(/[^\d]/g, '')) || 0;
    }

    // 통화 선택 변경 시 한글 표시 업데이트
    updateKoreanDisplay() {
        const amountInput = document.getElementById('transaction-amount');
        if (!amountInput || !amountInput.value) return;

        const numbers = amountInput.value.replace(/[^\d]/g, '');
        if (numbers === '') return;

        const currencySelect = document.getElementById('transaction-currency');
        const selectedCurrency = currencySelect ? currencySelect.value : 'KRW';
        
        const korean = this.numberToKorean(parseInt(numbers), selectedCurrency);
        
        const koreanElements = ['amount-korean', 'amount-korean-edit'].map(id => document.getElementById(id)).filter(el => el);
        koreanElements.forEach(el => el.textContent = korean);
    }

    // ESC 키로 모달 닫기 기능 초기화
    initEscapeKeyHandler() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // 현재 열려있는 모든 모달 찾기
                const modals = document.querySelectorAll('.modal-overlay');
                if (modals.length > 0) {
                    // 가장 마지막(최상위) 모달 닫기
                    const lastModal = modals[modals.length - 1];
                    this.closeModal(lastModal);
                }
            }
        });
    }

    // 범용 모달 닫기 함수
    closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    }

    // 모든 모달에 오버레이 클릭으로 닫기 기능 추가
    addModalCloseOnOverlayClick(modal) {
        if (modal) {
            modal.addEventListener('click', (event) => {
                // 모달 오버레이를 클릭했을 때만 닫기 (모달 내용 클릭시에는 닫지 않음)
                if (event.target === modal) {
                    this.closeModal(modal);
                }
            });
        }
    }

    // 비밀번호에서 암호화 키 생성 (PBKDF2 사용)
    async deriveKeyFromPassword(password, salt = null) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        // 솔트가 없으면 새로 생성
        if (!salt) {
            salt = crypto.getRandomValues(new Uint8Array(32));
        }

        // 비밀번호를 키로 가져오기
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // PBKDF2로 AES 키 생성
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        return { key, salt };
    }

    // 데이터 암호화
    async encryptData(data, password) {
        try {
            // 키 생성
            const { key, salt } = await this.deriveKeyFromPassword(password);

            // 데이터를 JSON 문자열로 변환
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(JSON.stringify(data));

            // IV 생성
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // AES-GCM으로 암호화
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encodedData
            );

            return {
                encryptedData: Array.from(new Uint8Array(encryptedData)),
                salt: Array.from(salt),
                iv: Array.from(iv),
                algorithm: 'AES-GCM-PBKDF2'
            };
        } catch (error) {
            console.error('암호화 실패:', error);
            throw new Error('데이터 암호화에 실패했습니다.');
        }
    }

    // 데이터 복호화
    async decryptData(encryptedPackage, password) {
        try {
            // 키 복원
            const { key } = await this.deriveKeyFromPassword(
                password, 
                new Uint8Array(encryptedPackage.salt)
            );

            // 데이터 복호화
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedPackage.iv) },
                key,
                new Uint8Array(encryptedPackage.encryptedData)
            );

            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decryptedData);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('복호화 실패:', error);
            throw new Error('잘못된 암호이거나 데이터가 손상되었습니다.');
        }
    }

    // 암호 변경 모달 표시
    showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>🔐 암호 변경</h2>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>현재 암호</label>
                        <input type="password" id="current-password" placeholder="현재 암호 입력" required>
                    </div>
                    <div class="form-group">
                        <label>새 암호 (4-6자리)</label>
                        <input type="password" id="new-password" placeholder="새 암호 입력" minlength="4" maxlength="6" required>
                    </div>
                    <div class="form-group">
                        <label>새 암호 확인</label>
                        <input type="password" id="new-password-confirm" placeholder="새 암호 다시 입력" minlength="4" maxlength="6" required>
                    </div>
                    <p class="help-text">보안을 위해 4-6자리 숫자로 설정해주세요.</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">취소</button>
                    <button type="button" class="btn-primary" id="change-password-btn">변경</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('change-password-btn').onclick = () => {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('new-password-confirm').value;

            // 현재 암호 확인
            const savedPassword = localStorage.getItem('app-password');
            if (currentPassword !== savedPassword) {
                this.showError('현재 암호가 일치하지 않습니다.');
                return;
            }

            // 새 암호 유효성 검사
            if (!newPassword || newPassword.length < 4 || newPassword.length > 6) {
                this.showError('새 암호는 4-6자리로 입력해주세요.');
                return;
            }

            if (!/^\d+$/.test(newPassword)) {
                this.showError('암호는 숫자만 입력 가능합니다.');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showError('새 암호가 일치하지 않습니다.');
                return;
            }

            if (newPassword === currentPassword) {
                this.showError('현재 암호와 동일합니다. 다른 암호를 입력해주세요.');
                return;
            }

            // 암호 변경
            localStorage.setItem('app-password', newPassword);
            modal.remove();
            this.showToast('암호가 성공적으로 변경되었습니다.');
        };

        // Enter 키 처리
        modal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('change-password-btn').click();
            }
        });

        // 첫 번째 입력 필드에 포커스
        setTimeout(() => document.getElementById('current-password').focus(), 100);
    }

    // 암호 입력 모달 표시
    showPasswordInputModal(title, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>🔐 ${title}</h2>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>암호를 입력하세요</label>
                        <input type="password" id="data-password" placeholder="암호 입력" required>
                    </div>
                    <div class="form-group" id="confirm-password-group" style="display: none;">
                        <label>암호 확인</label>
                        <input type="password" id="data-password-confirm" placeholder="암호 다시 입력">
                    </div>
                    <p class="help-text">이 암호는 데이터를 안전하게 보호하기 위해 사용됩니다.</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">취소</button>
                    <button type="button" class="btn-primary" id="password-confirm-btn">확인</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 비밀번호 확인이 필요한 경우 (내보내기)
        if (title.includes('내보내기')) {
            document.getElementById('confirm-password-group').style.display = 'block';
        }

        document.getElementById('password-confirm-btn').onclick = () => {
            const password = document.getElementById('data-password').value;
            const confirmPassword = document.getElementById('data-password-confirm').value;

            if (!password) {
                this.showError('암호를 입력해주세요.');
                return;
            }

            if (title.includes('내보내기') && password !== confirmPassword) {
                this.showError('암호가 일치하지 않습니다.');
                return;
            }

            modal.remove();
            onConfirm(password);
        };

        // Enter 키 처리
        modal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('password-confirm-btn').click();
            }
        });

        // 첫 번째 입력 필드에 포커스
        setTimeout(() => document.getElementById('data-password').focus(), 100);
    }

    // 로딩 모달 표시
    showLoadingModal(message = '로딩 중...') {
        // 기존 로딩 모달이 있으면 제거
        const existingModal = document.getElementById('loading-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'loading-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-body" style="text-align: center; padding: 2rem;">
                    <div class="loading-spinner" style="margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                    <p id="loading-message" style="margin: 0; font-size: 1.1em;">${message}</p>
                </div>
            </div>
        `;

        // 스피너 애니메이션 CSS 추가
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    // 로딩 모달 메시지 업데이트
    updateLoadingModal(message) {
        const messageElement = document.getElementById('loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    // 로딩 모달 숨기기
    hideLoadingModal() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// 앱 초기화 및 시작
document.addEventListener('DOMContentLoaded', async () => {
    try {
        //console.log('앱 초기화 시작...');
        
        // 앱 인스턴스 생성 및 초기화
        const app = new AdvancedBudgetApp();
        await app.init();
        window.budgetApp = app; // 디버깅용
        
        // ESC 키 핸들러 초기화
        app.initEscapeKeyHandler();
        
        //console.log('앱 초기화 완료');
        
        // 초기화 완료 후 로딩 화면 숨기기
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
    } catch (error) {
        console.error('앱 시작 실패:', error);
        
        // 로딩 화면 숨기기
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // 에러 화면 표시
        document.getElementById('app').innerHTML = `
            <div class="error-container">
                <h2>앱을 시작할 수 없습니다</h2>
                <p>브라우저를 새로고침하거나 다시 시도해주세요.</p>
                <p style="color: #666; font-size: 0.8em;">오류: ${error.message}</p>
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