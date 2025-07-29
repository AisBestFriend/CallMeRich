// IndexedDB 데이터베이스 매니저
class DatabaseManager {
    constructor() {
        this.dbName = 'BudgetAppDB';
        this.dbVersion = 1;
        this.db = null;
        this.currentUserId = localStorage.getItem('currentUserId') || null;
    }

    // 데이터베이스 초기화
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 사용자 테이블
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('username', 'username', { unique: true });
                }

                // 거래 내역 테이블
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
                    transactionStore.createIndex('userId', 'userId', { unique: false });
                    transactionStore.createIndex('date', 'date', { unique: false });
                    transactionStore.createIndex('type', 'type', { unique: false });
                    transactionStore.createIndex('category', 'category', { unique: false });
                    transactionStore.createIndex('currency', 'currency', { unique: false });
                }

                // 자산 테이블
                if (!db.objectStoreNames.contains('assets')) {
                    const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
                    assetStore.createIndex('userId', 'userId', { unique: false });
                    assetStore.createIndex('type', 'type', { unique: false });
                    assetStore.createIndex('subType', 'subType', { unique: false });
                }

                // 예산 테이블
                if (!db.objectStoreNames.contains('budgets')) {
                    const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
                    budgetStore.createIndex('userId', 'userId', { unique: false });
                    budgetStore.createIndex('category', 'category', { unique: false });
                    budgetStore.createIndex('period', 'period', { unique: false });
                }

                // 계정 테이블 (은행계좌, 카드 등)
                if (!db.objectStoreNames.contains('accounts')) {
                    const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
                    accountStore.createIndex('userId', 'userId', { unique: false });
                    accountStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // 현재 사용자 설정
    setCurrentUser(userId) {
        this.currentUserId = userId;
        localStorage.setItem('currentUserId', userId);
    }

    // 현재 사용자 가져오기
    getCurrentUser() {
        return this.currentUserId;
    }

    // === 사용자 관리 ===
    async createUser(userData) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const user = {
            id: this.generateId(),
            username: userData.username,
            email: userData.email,
            displayName: userData.displayName,
            defaultCurrency: userData.defaultCurrency || 'KRW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
                theme: 'auto',
                language: 'ko',
                dateFormat: 'YYYY-MM-DD',
                numberFormat: 'comma'
            }
        };

        return new Promise((resolve, reject) => {
            const request = store.add(user);
            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    async getUser(userId) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            const request = store.get(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserByEmail(email) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('email');
        
        return new Promise((resolve, reject) => {
            const request = index.get(email);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // === 거래 내역 관리 ===
    async createTransaction(transactionData) {
        const transaction = this.db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        
        const txn = {
            id: this.generateId(),
            userId: this.currentUserId,
            date: transactionData.date || new Date().toISOString().split('T')[0],
            amount: parseFloat(transactionData.amount),
            currency: transactionData.currency || 'KRW',
            type: transactionData.type, // 'income', 'expense', 'transfer'
            category: transactionData.category,
            subcategory: transactionData.subcategory || null,
            description: transactionData.description,
            tags: transactionData.tags || [],
            accountId: transactionData.accountId || null, // 연결된 계정
            location: transactionData.location || null,
            receiptUrl: transactionData.receiptUrl || null,
            notes: transactionData.notes || '',
            recurring: transactionData.recurring || null, // 정기거래 정보
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(txn);
            request.onsuccess = () => resolve(txn);
            request.onerror = () => reject(request.error);
        });
    }

    async getTransactions(userId = null, filters = {}) {
        userId = userId || this.currentUserId;
        const transaction = this.db.transaction(['transactions'], 'readonly');
        const store = transaction.objectStore('transactions');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => {
                let results = request.result;
                
                // 필터 적용
                if (filters.dateFrom) {
                    results = results.filter(t => t.date >= filters.dateFrom);
                }
                if (filters.dateTo) {
                    results = results.filter(t => t.date <= filters.dateTo);
                }
                if (filters.type) {
                    results = results.filter(t => t.type === filters.type);
                }
                if (filters.category) {
                    results = results.filter(t => t.category === filters.category);
                }
                if (filters.currency) {
                    results = results.filter(t => t.currency === filters.currency);
                }
                if (filters.tags && filters.tags.length > 0) {
                    results = results.filter(t => 
                        filters.tags.some(tag => t.tags.includes(tag))
                    );
                }
                
                // 날짜 역순 정렬
                results.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateTransaction(id, updateData) {
        const transaction = this.db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const txn = getRequest.result;
                if (txn && txn.userId === this.currentUserId) {
                    Object.assign(txn, updateData, { 
                        updatedAt: new Date().toISOString() 
                    });
                    
                    const putRequest = store.put(txn);
                    putRequest.onsuccess = () => resolve(txn);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error('거래를 찾을 수 없거나 권한이 없습니다.'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteTransaction(id) {
        const transaction = this.db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const txn = getRequest.result;
                if (txn && txn.userId === this.currentUserId) {
                    const deleteRequest = store.delete(id);
                    deleteRequest.onsuccess = () => resolve(true);
                    deleteRequest.onerror = () => reject(deleteRequest.error);
                } else {
                    reject(new Error('거래를 찾을 수 없거나 권한이 없습니다.'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // === 자산 관리 ===
    async createAsset(assetData) {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        
        const asset = {
            id: this.generateId(),
            userId: this.currentUserId,
            name: assetData.name,
            type: assetData.type, // 'securities', 'real_estate', 'cash', 'crypto', 'commodity', 'other'
            subType: assetData.subType, // 'stock', 'bond', 'fund', 'apartment', 'land', etc.
            currentValue: parseFloat(assetData.currentValue),
            purchasePrice: parseFloat(assetData.purchasePrice || 0),
            purchaseDate: assetData.purchaseDate,
            currency: assetData.currency || 'KRW',
            quantity: parseFloat(assetData.quantity || 1),
            unit: assetData.unit || '개',
            location: assetData.location || null, // 부동산 위치 등
            description: assetData.description || '',
            tags: assetData.tags || [],
            metadata: assetData.metadata || {}, // 추가 정보 (종목코드, 계좌번호 등)
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(asset);
            request.onsuccess = () => resolve(asset);
            request.onerror = () => reject(request.error);
        });
    }

    async getAssets(userId = null, type = null) {
        userId = userId || this.currentUserId;
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => {
                let results = request.result.filter(asset => asset.isActive);
                
                if (type) {
                    results = results.filter(asset => asset.type === type);
                }
                
                // 가치 순으로 정렬
                results.sort((a, b) => b.currentValue - a.currentValue);
                
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateAsset(id, updateData) {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const asset = getRequest.result;
                if (asset && asset.userId === this.currentUserId) {
                    Object.assign(asset, updateData, { 
                        updatedAt: new Date().toISOString() 
                    });
                    
                    const putRequest = store.put(asset);
                    putRequest.onsuccess = () => resolve(asset);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error('자산을 찾을 수 없거나 권한이 없습니다.'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteAsset(id) {
        return this.updateAsset(id, { isActive: false });
    }

    // === 계정 관리 (은행계좌, 카드 등) ===
    async createAccount(accountData) {
        const transaction = this.db.transaction(['accounts'], 'readwrite');
        const store = transaction.objectStore('accounts');
        
        const account = {
            id: this.generateId(),
            userId: this.currentUserId,
            name: accountData.name,
            type: accountData.type, // 'bank', 'credit_card', 'cash', 'digital_wallet'
            bankName: accountData.bankName || null,
            accountNumber: accountData.accountNumber || null,
            balance: parseFloat(accountData.balance || 0),
            currency: accountData.currency || 'KRW',
            isActive: true,
            isDefault: accountData.isDefault || false,
            color: accountData.color || '#2196F3',
            icon: accountData.icon || '🏦',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(account);
            request.onsuccess = () => resolve(account);
            request.onerror = () => reject(request.error);
        });
    }

    async getAccounts(userId = null) {
        userId = userId || this.currentUserId;
        const transaction = this.db.transaction(['accounts'], 'readonly');
        const store = transaction.objectStore('accounts');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => {
                const results = request.result.filter(account => account.isActive);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // === 유틸리티 함수 ===
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 데이터 통계
    async getStatistics(userId = null, period = 'month') {
        userId = userId || this.currentUserId;
        const transactions = await this.getTransactions(userId);
        const assets = await this.getAssets(userId);
        
        // 기간 계산
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const periodTransactions = transactions.filter(t => 
            new Date(t.date) >= startDate
        );

        const income = periodTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);

        return {
            period,
            income,
            expenses,
            balance: income - expenses,
            totalAssets,
            netWorth: totalAssets,
            transactionCount: periodTransactions.length,
            categoryBreakdown: this.getCategoryBreakdown(periodTransactions)
        };
    }

    getCategoryBreakdown(transactions) {
        const breakdown = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                breakdown[t.category] = (breakdown[t.category] || 0) + Math.abs(t.amount);
            }
        });
        return breakdown;
    }

    // 데이터 백업/복원
    async exportUserData(userId = null) {
        userId = userId || this.currentUserId;
        
        const [user, transactions, assets, accounts] = await Promise.all([
            this.getUser(userId),
            this.getTransactions(userId),
            this.getAssets(userId),
            this.getAccounts(userId)
        ]);

        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            user,
            transactions,
            assets,
            accounts
        };
    }

    async importUserData(data) {
        // 데이터 유효성 검사 후 가져오기 로직
        // 구현 필요
    }
}

// 전역 데이터베이스 인스턴스
window.dbManager = new DatabaseManager();