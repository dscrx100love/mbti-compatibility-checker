// DOM要素の取得
const elements = {
    type1Select: document.getElementById('type1'),
    type2Select: document.getElementById('type2'),
    type1Preview: document.getElementById('type1-preview'),
    type2Preview: document.getElementById('type2-preview'),
    diagnoseBtn: document.getElementById('diagnose-btn'),
    diagnosisPage: document.getElementById('diagnosis-page'),
    resultPage: document.getElementById('result-page'),
    resultContent: document.getElementById('result-content'),
    shareBtn: document.getElementById('share-btn'),
    retryBtn: document.getElementById('retry-btn'),
};

// 現在の診断結果を保持
let currentResult = null;

// ページ切り替え機能
const pageManager = {
    showDiagnosisPage() {
        elements.diagnosisPage.classList.remove('hidden');
        elements.resultPage.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    showResultPage() {
        elements.diagnosisPage.classList.add('hidden');
        elements.resultPage.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeEventListeners();
        loadRecentResults();
    } catch (error) {
        console.error('初期化エラー:', error);
        if (typeof errorHandler !== 'undefined') {
            errorHandler.showError('アプリケーションの初期化に失敗しました');
        }
    }
});

// イベントリスナーの設定
function initializeEventListeners() {
    // 診断ボタン
    elements.diagnoseBtn.addEventListener('click', performDiagnosis);
    
    // もう一度診断ボタン
    elements.retryBtn.addEventListener('click', resetDiagnosis);
    
    // シェアボタン
    elements.shareBtn.addEventListener('click', showShareOptions);
    
    // セレクトボックスの変更時
    elements.type1Select.addEventListener('change', () => {
        validateSelection();
        showTypePreview('type1', elements.type1Select.value, elements.type1Preview);
    });
    elements.type2Select.addEventListener('change', () => {
        validateSelection();
        showTypePreview('type2', elements.type2Select.value, elements.type2Preview);
    });
}

// 選択の検証
function validateSelection() {
    const type1 = elements.type1Select.value;
    const type2 = elements.type2Select.value;
    
    if (type1 && type2) {
        elements.diagnoseBtn.disabled = false;
        elements.diagnoseBtn.style.opacity = '1';
        elements.diagnoseBtn.style.cursor = 'pointer';
    } else {
        elements.diagnoseBtn.disabled = true;
        elements.diagnoseBtn.style.opacity = '0.6';
        elements.diagnoseBtn.style.cursor = 'not-allowed';
    }
}

// タイプ選択プレビュー表示
function showTypePreview(selectId, selectedType, previewElement) {
    if (!selectedType || !mbtiTypes[selectedType]) {
        previewElement.classList.add('hidden');
        return;
    }
    
    const typeData = mbtiTypes[selectedType];
    
    previewElement.innerHTML = `
        <div class="preview-header">
            <span class="preview-emoji">${typeData.emoji}</span>
            <span class="preview-name">${selectedType} - ${typeData.name}</span>
        </div>
        <div class="preview-traits">${typeData.traits}</div>
        <div class="preview-communication">💬 ${typeData.communication}</div>
    `;
    
    previewElement.classList.remove('hidden');
}

// 診断実行
function performDiagnosis() {
    try {
        const type1 = elements.type1Select.value;
        const type2 = elements.type2Select.value;
        
        if (!type1 || !type2) {
            errorHandler.showError('両方のタイプを選択してください');
            return;
        }
        
        // 診断結果の取得
        let key = `${type1}-${type2}`;
        let compatibility = compatibilityData[key];
        
        // 逆方向も試す
        if (!compatibility) {
            key = `${type2}-${type1}`;
            compatibility = compatibilityData[key];
        }
        
        if (!compatibility) {
            errorHandler.showError('診断データが見つかりません');
            return;
        }
        
        // 現在の結果を保存
        currentResult = {
            type1,
            type2,
            ...compatibility
        };
        
        // 結果を表示
        displayResult(currentResult);
        
        // 最近の結果に追加
        recentResultsManager.addResult(type1, type2);
        
        // 結果ページに遷移
        pageManager.showResultPage();
    } catch (error) {
        console.error('診断実行エラー:', error);
        errorHandler.showError('診断中にエラーが発生しました。もう一度お試しください。');
    }
}

// 診断結果の表示
function displayResult(result) {
    const { type1, type2, score, title, description, goodPoints, cautionPoints, advice } = result;
    
    const type1Data = mbtiTypes[type1];
    const type2Data = mbtiTypes[type2];
    
    // キャラクター設定を取得
    const key = `${type1}-${type2}`;
    const characterization = characterizationData[key];
    const characterSubtitle = characterization ? `<p class="character-subtitle">${characterization}</p>` : '';
    
    const resultHTML = `
        <div class="result-header">
            <h2 class="result-title">
                ${type1Data.emoji} ${type1} ${type1Data.name} × ${type2Data.emoji} ${type2} ${type2Data.name}
            </h2>
            ${characterSubtitle}
            <div class="compatibility-score">
                <p class="score-label">相性度</p>
                <div class="score-stars">${formatters.formatStars(score)}</div>
                <p class="score-title">${title}</p>
            </div>
        </div>
        
        <div class="result-details">
            <div class="detail-section rarity-section">
                <h3>💎 レア度</h3>
                ${formatters.formatRarity(type1, type2)}
            </div>
            
            <div class="result-description">${description}</div>
            
            <div class="detail-section">
                <h3>✨ 相性が良い理由</h3>
                <ul class="detail-list">
                    ${goodPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h3>⚠️ 注意すべきポイント</h3>
                <ul class="detail-list caution-list">
                    ${cautionPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h3>💝 関係改善アドバイス</h3>
                <div class="advice-container">
                    ${formatters.formatAdvice(advice, type1, type2)}
                </div>
            </div>
            
            
            <div class="detail-section newsletter-inline">
                <h3>📚 カップル・夫婦向けに電子書籍を無料プレゼント！</h3>
                <div class="newsletter-image">
                    <img src="images/電子書籍.png" alt="ふたりの教科書 - ケンカしない関係をつくる3ステップ" class="textbook-image">
                </div>
                <p class="newsletter-description">
                    「ふたりの教科書 - ケンカしない関係をつくる3ステップ -」を期間限定で配布中！<br>
                    どのように破局危機から夫婦円満になったのか、思考や価値観をメルマガにてお届け。
                </p>
                <form class="newsletter-form" action="https://my937p.com/p/r/3TSRAium" method="post" enctype="multipart/form-data">
                    <input 
                        type="email" 
                        name="data[User][mail]"
                        class="email-input" 
                        placeholder="メールアドレスを入力"
                        required
                    >
                    <button type="submit" class="btn btn-secondary">
                        電子書籍を受け取る
                    </button>
                </form>
                <p class="privacy-notice">
                    ※定期的にプレゼントや有益情報をお届けします<br>
                    ※ふだん使うGmailやYahooメールでご登録ください<br>
                    ※購読をやめたいときは末尾リンクからすぐ解除できます<br>
                    ※個人情報はプライバシーポリシーに則り、厳重管理します
                </p>
            </div>
        </div>
    `;
    
    elements.resultContent.innerHTML = resultHTML;
    
    // メルマガフォームのイベントリスナーを設定
    const newsletterForm = elements.resultContent.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // 結果が設定されたことをマーク（ページ切り替えは performDiagnosis で実行）
}


// 診断リセット
function resetDiagnosis() {
    elements.type1Select.value = '';
    elements.type2Select.value = '';
    validateSelection();
    
    // 診断ページに戻る
    pageManager.showDiagnosisPage();
}

// シェアオプションの表示
function showShareOptions() {
    if (!currentResult) return;
    
    const { type1, type2, score, title } = currentResult;
    
    // シェアメニューの作成
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <div class="share-menu-content">
            <h3>結果をシェア</h3>
            <div class="share-buttons">
                <button onclick="shareToTwitter('${type1}', '${type2}', ${score})">
                    🐦 Twitter
                </button>
                <button onclick="shareToLine('${type1}', '${type2}', ${score})">
                    💬 LINE
                </button>
                <button onclick="downloadShareImage('${type1}', '${type2}', ${score}, '${title}')">
                    📷 画像保存
                </button>
                <button onclick="copyToClipboard('${type1}', '${type2}', ${score})">
                    🔗 URLコピー
                </button>
            </div>
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
                閉じる
            </button>
        </div>
    `;
    
    // モーダルスタイルを適用
    shareMenu.classList.add('modal-overlay');
    
    // クリックイベントを追加（オーバーレイクリックで閉じる）
    shareMenu.addEventListener('click', (e) => {
        if (e.target === shareMenu) {
            shareMenu.remove();
        }
    });
    
    document.body.appendChild(shareMenu);
}

// グローバル関数として公開
window.shareToTwitter = (type1, type2, score) => {
    shareManager.shareToTwitter(type1, type2, score);
    document.querySelector('.share-menu').remove();
};

window.shareToLine = (type1, type2, score) => {
    shareManager.shareToLine(type1, type2, score);
    document.querySelector('.share-menu').remove();
};

window.copyToClipboard = (type1, type2, score) => {
    shareManager.copyToClipboard(type1, type2, score);
    document.querySelector('.share-menu').remove();
};

window.downloadShareImage = (type1, type2, score, title) => {
    shareManager.downloadShareImage(type1, type2, score, title);
    const shareMenu = document.querySelector('.share-menu');
    if (shareMenu) shareMenu.remove();
};


// メルマガ登録の処理
function handleNewsletterSubmit(e) {
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value : '';
    
    if (!validation.isValidEmail(email)) {
        e.preventDefault();
        errorHandler.showError('正しいメールアドレスを入力してください');
        return;
    }
    
    // フォーム送信前に成功を記録（外部サイトにリダイレクトされるため）
    emailManager.markEmailSubmitted();
    
    // 成功メッセージをすぐに表示
    shareManager.showCopySuccess();
    document.querySelector('.copy-success-message').textContent = '登録ページに移動します。ありがとうございます！';
    
    // フォームを実際のエンドポイントに送信（デフォルト動作を許可）
}



// 最近の結果の読み込み
function loadRecentResults() {
    const recent = recentResultsManager.getRecentResults();
    
    if (recent.length > 0) {
        const recentSection = document.createElement('section');
        recentSection.className = 'recent-results';
        recentSection.innerHTML = `
            <h3>最近の診断結果</h3>
            <div class="recent-list">
                ${recent.map(r => `
                    <button class="recent-item" onclick="selectTypes('${r.type1}', '${r.type2}')">
                        ${r.type1} × ${r.type2}
                    </button>
                `).join('')}
            </div>
        `;
        
        elements.diagnosisPage.querySelector('.card').appendChild(recentSection);
        
        // スタイルを追加
        const style = document.createElement('style');
        style.textContent = `
            .recent-results {
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid var(--border-color);
            }
            .recent-results h3 {
                font-size: 1.2rem;
                color: var(--text-secondary);
                margin-bottom: 15px;
            }
            .recent-list {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .recent-item {
                padding: 8px 16px;
                border: 1px solid var(--border-color);
                background: var(--bg-light);
                border-radius: var(--radius-small);
                cursor: pointer;
                transition: var(--transition);
            }
            .recent-item:hover {
                border-color: var(--primary-color);
                background: white;
            }
        `;
        document.head.appendChild(style);
    }
}

// 最近の結果をクリック時の処理
window.selectTypes = (type1, type2) => {
    elements.type1Select.value = type1;
    elements.type2Select.value = type2;
    validateSelection();
    performDiagnosis();
};

// 初期状態の設定
validateSelection();