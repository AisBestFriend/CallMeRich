// IndexedDB 데이터베이스 매니저
class DatabaseManager {
    constructor() {
        this.dbName = 'BudgetAppDB';
        this.dbVersion = 2;
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

                // 가계부 사용자 테이블
                if (!db.objectStoreNames.contains('account_users')) {
                    const accountUsersStore = db.createObjectStore('account_users', { keyPath: 'id' });
                    accountUsersStore.createIndex('ownerId', 'ownerId', { unique: false });
                    accountUsersStore.createIndex('name', 'name', { unique: false });
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

    // 고유 ID 생성
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // === 사용자 관리 ===
    async createUser(userData) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const user = {
            id: this.generateId(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // 비밀번호 추가
            displayName: userData.displayName,
            defaultCurrency: userData.defaultCurrency || 'KRW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: userData.settings || {
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

    async updateUser(userId, updateData) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(userId);
            getRequest.onsuccess = () => {
                const user = getRequest.result;
                if (user) {
                    Object.assign(user, updateData, {
                        updatedAt: new Date().toISOString()
                    });
                    
                    const updateRequest = store.put(user);
                    updateRequest.onsuccess = () => resolve(user);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('User not found'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // 새 사용자 추가 (alias for createUser)
    async addUser(userData) {
        return await this.createUser(userData);
    }

    // 모든 사용자 조회
    async getUsers() {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 모든 사용자 비밀번호 일괄 초기화
    async resetAllPasswords(newPassword = '111111') {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            let updatedCount = 0;
            let totalCount = 0;
            
            const request = store.getAll();
            request.onsuccess = () => {
                const users = request.result;
                totalCount = users.length;
                
                if (totalCount === 0) {
                    resolve({ success: true, updated: 0, total: 0 });
                    return;
                }
                
                users.forEach(user => {
                    user.password = newPassword;
                    user.updatedAt = new Date().toISOString();
                    
                    const updateRequest = store.put(user);
                    updateRequest.onsuccess = () => {
                        updatedCount++;
                        if (updatedCount === totalCount) {
                            resolve({ 
                                success: true, 
                                updated: updatedCount, 
                                total: totalCount,
                                newPassword: newPassword
                            });
                        }
                    };
                    updateRequest.onerror = () => {
                        reject(new Error(`사용자 ${user.email}의 비밀번호 업데이트 실패`));
                    };
                });
            };
            request.onerror = () => reject(new Error('사용자 목록 조회 실패'));
        });
    }

    // === 거래 내역 관리 ===
    async createTransaction(transactionData) {
        const transaction = this.db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        
        const txn = {
            id: this.generateId(),
            userId: this.currentUserId,
            accountUserId: transactionData.accountUserId || null, // 가계부 사용자 ID
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

    async getTransaction(id) {
        const transaction = this.db.transaction(['transactions'], 'readonly');
        const store = transaction.objectStore('transactions');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                const txn = request.result;
                if (txn && txn.userId === this.currentUserId) {
                    resolve(txn);
                } else {
                    resolve(null);
                }
            };
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
                
                // 가계부 사용자별 필터링
                if (filters.accountUserId) {
                    results = results.filter(t => t.accountUserId === filters.accountUserId);
                }
                
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
            accountUserId: assetData.accountUserId || null, // 가계부 사용자 ID
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

    async getAssets(userId = null, filters = {}) {
        userId = userId || this.currentUserId;
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => {
                let results = request.result.filter(asset => asset.isActive);
                
                // 가계부 사용자별 필터링
                if (filters.accountUserId) {
                    results = results.filter(asset => asset.accountUserId === filters.accountUserId);
                }
                
                // 자산 유형별 필터링
                if (filters.type) {
                    results = results.filter(asset => asset.type === filters.type);
                }
                
                // 가치 순으로 정렬
                results.sort((a, b) => b.currentValue - a.currentValue);
                
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAsset(id) {
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                const asset = request.result;
                if (asset && asset.userId === this.currentUserId) {
                    resolve(asset);
                } else {
                    resolve(null);
                }
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

    // 데이터 통계 (포함 설정 적용)
    async getStatistics(userId = null, period = 'month') {
        userId = userId || this.currentUserId;
        const transactions = await this.getTransactions(userId);
        const assets = await this.getAssets(userId);
        
        // 사용자 설정에서 포함 설정 가져오기
        const user = await this.getUser(userId);
        const inclusionSettings = user?.settings?.inclusionSettings || this.getDefaultInclusionSettings();
        
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

        // 포함 설정에 따라 거래 필터링
        const filteredTransactions = periodTransactions.filter(t => {
            const categorySettings = inclusionSettings.transactions[t.type];
            return categorySettings && categorySettings[t.category] !== false;
        });

        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // 포함 설정에 따라 자산 필터링
        const filteredAssets = assets.filter(a => {
            return inclusionSettings.assets[a.type] !== false;
        });

        const totalAssets = filteredAssets.reduce((sum, a) => sum + a.currentValue, 0);

        return {
            period,
            income,
            expenses,
            balance: income - expenses,
            totalAssets,
            netWorth: totalAssets,
            transactionCount: filteredTransactions.length,
            categoryBreakdown: this.getCategoryBreakdown(filteredTransactions),
            filteredCounts: {
                includedTransactions: filteredTransactions.length,
                totalTransactions: periodTransactions.length,
                includedAssets: filteredAssets.length,
                totalAssets: assets.length
            }
        };
    }

    // 기본 포함 설정 반환 (데이터베이스용)
    getDefaultInclusionSettings() {
        // 이 메서드는 앱 클래스의 assetTypes와 transactionCategories를 참조할 수 없으므로
        // 기본값으로 모든 항목을 포함하도록 설정
        return {
            assets: {
                'real_estate': true,
                'securities': true,
                'cash': true,
                'crypto': true,
                'commodity': true,
                'other': true
            },
            transactions: {
                income: {
                    'salary': true,
                    'business': true,
                    'investment': true,
                    'bonus': true,
                    'freelance': true,
                    'rental': true,
                    'other': true
                },
                expense: {
                    'food': true,
                    'transportation': true,
                    'shopping': true,
                    'utility': true,
                    'healthcare': true,
                    'education': true,
                    'entertainment': true,
                    'housing': true,
                    'insurance': true,
                    'other': true
                }
            }
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

    // calculateFinancialSummary의 별칭 (호환성)
    async calculateFinancialSummary(period = 'month', userId = null) {
        return await this.getStatistics(userId, period);
    }

    // === 계정 관리 ===
    async createAccount(accountData) {
        const transaction = this.db.transaction(['accounts'], 'readwrite');
        const store = transaction.objectStore('accounts');
        
        const account = {
            id: this.generateId(),
            userId: this.currentUserId,
            name: accountData.name,
            type: accountData.type, // 'bank', 'credit_card', 'cash', 'digital_wallet'
            balance: parseFloat(accountData.balance) || 0,
            currency: accountData.currency || 'KRW',
            isDefault: accountData.isDefault || false,
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
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateAccount(accountId, updateData) {
        const transaction = this.db.transaction(['accounts'], 'readwrite');
        const store = transaction.objectStore('accounts');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(accountId);
            getRequest.onsuccess = () => {
                const account = getRequest.result;
                if (account) {
                    Object.assign(account, updateData, {
                        updatedAt: new Date().toISOString()
                    });
                    
                    const updateRequest = store.put(account);
                    updateRequest.onsuccess = () => resolve(account);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('Account not found'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteAccount(accountId) {
        const transaction = this.db.transaction(['accounts'], 'readwrite');
        const store = transaction.objectStore('accounts');
        
        return new Promise((resolve, reject) => {
            const request = store.delete(accountId);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
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

    async importUserData(data, options = {}) {
        const { 
            overwrite = false, 
            importMode = 'add', // 'add', 'replace'
            mergeStrategy = 'skip', // 'skip', 'overwrite', 'merge'
            includeAssets = true,
            includeTransactions = true,
            includeAccounts = true
        } = options;

        try {
            // 데이터 유효성 검사
            if (!data || !data.version || !data.user) {
                throw new Error('잘못된 데이터 형식입니다.');
            }

            // 버전 호환성 확인
            if (data.version !== '1.0') {
                console.warn(`지원하지 않는 데이터 버전: ${data.version}`);
            }

            const userId = this.currentUserId;
            const importResults = {
                success: false,
                imported: {
                    transactions: 0,
                    assets: 0,
                    accounts: 0
                },
                skipped: {
                    transactions: 0,
                    assets: 0,
                    accounts: 0
                },
                deleted: {
                    transactions: 0,
                    assets: 0,
                    accounts: 0
                },
                errors: []
            };

            // 완전히 바꾸기 모드일 때 기존 데이터 삭제
            if (importMode === 'replace') {
                try {
                    if (includeTransactions) {
                        const existingTransactions = await this.getTransactions(userId);
                        for (const transaction of existingTransactions) {
                            await this.deleteTransaction(transaction.id);
                            importResults.deleted.transactions++;
                        }
                    }
                    
                    if (includeAssets) {
                        const existingAssets = await this.getAssets(userId);
                        for (const asset of existingAssets) {
                            await this.deleteAsset(asset.id);
                            importResults.deleted.assets++;
                        }
                    }
                    
                    if (includeAccounts) {
                        const existingAccounts = await this.getAccounts(userId);
                        for (const account of existingAccounts) {
                            await this.deleteAccount(account.id);
                            importResults.deleted.accounts++;
                        }
                    }
                } catch (error) {
                    importResults.errors.push(`기존 데이터 삭제 실패: ${error.message}`);
                }
            }

            // 사용자 정보 업데이트 (설정만)
            if (data.user && data.user.settings) {
                try {
                    await this.updateUser(userId, {
                        settings: { ...data.user.settings }
                    });
                } catch (error) {
                    importResults.errors.push(`사용자 설정 업데이트 실패: ${error.message}`);
                }
            }

            // 계정 가져오기
            if (includeAccounts && data.accounts && data.accounts.length > 0) {
                const existingAccounts = await this.getAccounts(userId);
                const existingAccountNames = existingAccounts.map(a => a.name);

                for (const accountData of data.accounts) {
                    try {
                        // 완전히 바꾸기 모드가 아닐 때만 중복 체크
                        const accountExists = importMode === 'add' ? existingAccountNames.includes(accountData.name) : false;
                        
                        if (accountExists && mergeStrategy === 'skip') {
                            importResults.skipped.accounts++;
                            continue;
                        }

                        const newAccount = {
                            ...accountData,
                            id: this.generateId(), // 새 ID 생성
                            userId: userId, // 현재 사용자로 변경
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        if (accountExists && mergeStrategy === 'overwrite') {
                            const existingAccount = existingAccounts.find(a => a.name === accountData.name);
                            const updateData = {
                                ...accountData,
                                userId: userId,
                                updatedAt: new Date().toISOString()
                            };
                            await this.updateAccount(existingAccount.id, updateData);
                        } else if (!accountExists) {
                            await this.createAccount(newAccount);
                        }
                        
                        importResults.imported.accounts++;
                    } catch (error) {
                        importResults.errors.push(`계정 "${accountData.name}" 가져오기 실패: ${error.message}`);
                        importResults.skipped.accounts++;
                    }
                }
            }

            // 자산 가져오기
            if (includeAssets && data.assets && data.assets.length > 0) {
                const existingAssets = await this.getAssets(userId);
                const existingAssetNames = existingAssets.map(a => a.name);

                for (const assetData of data.assets) {
                    try {
                        // 완전히 바꾸기 모드가 아닐 때만 중복 체크
                        const assetExists = importMode === 'add' ? existingAssetNames.includes(assetData.name) : false;
                        
                        if (assetExists && mergeStrategy === 'skip') {
                            importResults.skipped.assets++;
                            continue;
                        }

                        const newAsset = {
                            ...assetData,
                            id: this.generateId(), // 새 ID 생성
                            userId: userId, // 현재 사용자로 변경
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        if (assetExists && mergeStrategy === 'overwrite') {
                            const existingAsset = existingAssets.find(a => a.name === assetData.name);
                            const updateData = {
                                ...assetData,
                                userId: userId,
                                updatedAt: new Date().toISOString()
                            };
                            await this.updateAsset(existingAsset.id, updateData);
                        } else if (!assetExists) {
                            await this.createAsset(newAsset);
                        }
                        
                        importResults.imported.assets++;
                    } catch (error) {
                        importResults.errors.push(`자산 "${assetData.name}" 가져오기 실패: ${error.message}`);
                        importResults.skipped.assets++;
                    }
                }
            }

            // 거래 내역 가져오기
            if (includeTransactions && data.transactions && data.transactions.length > 0) {
                const existingTransactions = await this.getTransactions(userId);
                
                for (const transactionData of data.transactions) {
                    try {
                        // 완전히 바꾸기 모드가 아닐 때만 중복 체크
                        const transactionExists = importMode === 'add' ? existingTransactions.some(existing => 
                            existing.date === transactionData.date &&
                            Math.abs(existing.amount) === Math.abs(transactionData.amount) &&
                            existing.description === transactionData.description &&
                            existing.type === transactionData.type
                        ) : false;
                        
                        if (transactionExists && mergeStrategy === 'skip') {
                            importResults.skipped.transactions++;
                            continue;
                        }

                        const newTransaction = {
                            ...transactionData,
                            id: this.generateId(), // 새 ID 생성
                            userId: userId, // 현재 사용자로 변경
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        if (transactionExists && mergeStrategy === 'overwrite') {
                            const existingTransaction = existingTransactions.find(existing => 
                                existing.date === transactionData.date &&
                                Math.abs(existing.amount) === Math.abs(transactionData.amount) &&
                                existing.description === transactionData.description &&
                                existing.type === transactionData.type
                            );
                            const updateData = {
                                ...transactionData,
                                userId: userId,
                                updatedAt: new Date().toISOString()
                            };
                            await this.updateTransaction(existingTransaction.id, updateData);
                        } else if (!transactionExists) {
                            await this.createTransaction(newTransaction);
                        }

                        importResults.imported.transactions++;
                    } catch (error) {
                        importResults.errors.push(`거래 내역 가져오기 실패: ${error.message}`);
                        importResults.skipped.transactions++;
                    }
                }
            }

            importResults.success = true;
            return importResults;

        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            throw new Error(`데이터 가져오기 실패: ${error.message}`);
        }
    }

    // JSON 파일로 데이터 내보내기
    async downloadBackup(filename = null) {
        try {
            const data = await this.exportUserData();
            const jsonString = JSON.stringify(data, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `budget_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('백업 다운로드 실패:', error);
            throw new Error(`백업 다운로드 실패: ${error.message}`);
        }
    }

    // 파일에서 데이터 가져오기
    async uploadBackup(file, options = {}) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('파일이 선택되지 않았습니다.'));
                return;
            }

            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                reject(new Error('JSON 파일만 지원됩니다.'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    const result = await this.importUserData(jsonData, options);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`파일 처리 실패: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('파일 읽기 실패'));
            };

            reader.readAsText(file);
        });
    }

    // 전체 데이터베이스 초기화 (개발/테스트용)
    async clearAllData() {
        const stores = ['users', 'transactions', 'assets', 'accounts', 'budgets'];
        const promises = stores.map(storeName => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });

        try {
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('데이터 초기화 실패:', error);
            throw new Error(`데이터 초기화 실패: ${error.message}`);
        }
    }

    // === 가계부 사용자 관리 ===
    async addAccountUser(userData) {
        const transaction = this.db.transaction(['account_users'], 'readwrite');
        const store = transaction.objectStore('account_users');

        const user = {
            id: this.generateId(),
            ownerId: this.currentUserId,
            name: userData.name,
            relationship: userData.relationship || '',
            birthDate: userData.birthDate || '',
            gender: userData.gender || '',
            occupation: userData.occupation || '',
            phone: userData.phone || '',
            notes: userData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(user);
            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllAccountUsers() {
        if (!this.currentUserId) {
            throw new Error('로그인이 필요합니다.');
        }

        const transaction = this.db.transaction(['account_users'], 'readonly');
        const store = transaction.objectStore('account_users');
        const index = store.index('ownerId');

        return new Promise((resolve, reject) => {
            const request = index.getAll(this.currentUserId);
            request.onsuccess = () => {
                const users = request.result || [];
                users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                resolve(users);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAccountUser(userId) {
        const transaction = this.db.transaction(['account_users'], 'readonly');
        const store = transaction.objectStore('account_users');

        return new Promise((resolve, reject) => {
            const request = store.get(userId);
            request.onsuccess = () => {
                const user = request.result;
                if (user && user.ownerId === this.currentUserId) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateAccountUser(userId, userData) {
        const transaction = this.db.transaction(['account_users'], 'readwrite');
        const store = transaction.objectStore('account_users');

        return new Promise(async (resolve, reject) => {
            try {
                const existingUser = await this.getAccountUser(userId);
                if (!existingUser) {
                    reject(new Error('사용자를 찾을 수 없습니다.'));
                    return;
                }

                const updatedUser = {
                    ...existingUser,
                    name: userData.name,
                    relationship: userData.relationship || '',
                    birthDate: userData.birthDate || '',
                    gender: userData.gender || '',
                    occupation: userData.occupation || '',
                    phone: userData.phone || '',
                    notes: userData.notes || '',
                    updatedAt: new Date().toISOString()
                };

                const request = store.put(updatedUser);
                request.onsuccess = () => resolve(updatedUser);
                request.onerror = () => reject(request.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    async deleteAccountUser(userId) {
        const transaction = this.db.transaction(['account_users'], 'readwrite');
        const store = transaction.objectStore('account_users');

        return new Promise(async (resolve, reject) => {
            try {
                const existingUser = await this.getAccountUser(userId);
                if (!existingUser) {
                    reject(new Error('사용자를 찾을 수 없습니다.'));
                    return;
                }

                const request = store.delete(userId);
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    // 기존 데이터를 첫 번째 사용자에게 매핑
    async migrateDataToFirstUser() {
        if (!this.currentUserId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const users = await this.getAllAccountUsers();
            if (users.length === 0) {
                return false;
            }

            const firstUser = users[0];
            
            // 거래 내역에 사용자 매핑
            const transactionTx = this.db.transaction(['transactions'], 'readwrite');
            const transactionStore = transactionTx.objectStore('transactions');
            const transactionIndex = transactionStore.index('userId');
            
            const transactionRequest = transactionIndex.getAll(this.currentUserId);
            await new Promise((resolve, reject) => {
                transactionRequest.onsuccess = () => {
                    const transactions = transactionRequest.result;
                    const promises = transactions.map(transaction => {
                        if (!transaction.accountUserId) {
                            transaction.accountUserId = firstUser.id;
                            transaction.updatedAt = new Date().toISOString();
                            return new Promise((resolve, reject) => {
                                const updateRequest = transactionStore.put(transaction);
                                updateRequest.onsuccess = () => resolve();
                                updateRequest.onerror = () => reject(updateRequest.error);
                            });
                        }
                        return Promise.resolve();
                    });
                    
                    Promise.all(promises).then(resolve).catch(reject);
                };
                transactionRequest.onerror = () => reject(transactionRequest.error);
            });

            // 자산에 사용자 매핑
            const assetTx = this.db.transaction(['assets'], 'readwrite');
            const assetStore = assetTx.objectStore('assets');
            const assetIndex = assetStore.index('userId');
            
            const assetRequest = assetIndex.getAll(this.currentUserId);
            await new Promise((resolve, reject) => {
                assetRequest.onsuccess = () => {
                    const assets = assetRequest.result;
                    const promises = assets.map(asset => {
                        if (!asset.accountUserId) {
                            asset.accountUserId = firstUser.id;
                            asset.updatedAt = new Date().toISOString();
                            return new Promise((resolve, reject) => {
                                const updateRequest = assetStore.put(asset);
                                updateRequest.onsuccess = () => resolve();
                                updateRequest.onerror = () => reject(updateRequest.error);
                            });
                        }
                        return Promise.resolve();
                    });
                    
                    Promise.all(promises).then(resolve).catch(reject);
                };
                assetRequest.onerror = () => reject(assetRequest.error);
            });

            return true;

        } catch (error) {
            console.error('데이터 마이그레이션 실패:', error);
            throw error;
        }
    }
}

// 전역 데이터베이스 인스턴스
window.dbManager = new DatabaseManager();