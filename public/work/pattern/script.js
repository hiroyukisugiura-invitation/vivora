document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    // 仕様書内の全ての入力欄（input）を取得
    const specInputs = document.querySelectorAll('.spec-sheet input');

    // ===== イベントリスナーの設定 =====

    /**
     * キーボード操作のイベントリスナー
     * @param {KeyboardEvent} e - キーボードイベント
     */
    function handleKeyDown(e) {
        // イベントが発生した入力欄がどれかを取得
        const currentInput = e.target;

        // 入力欄のリスト（specInputs）の中から、現在の入力欄が何番目かを探す
        // Array.from()で、NodeListを本物の配列に変換しています
        const currentIndex = Array.from(specInputs).indexOf(currentInput);

        // もし入力欄が見つからなければ、何もしない
        if (currentIndex === -1) {
            return;
        }

        // --- Enterキーが押された時の処理 ---
        if (e.key === 'Enter') {
            // デフォルトの動作（フォーム送信など）をキャンセル
            e.preventDefault();

            // 次の入力欄のインデックスを計算
            const nextIndex = currentIndex + 1;

            // もし次の入力欄が存在すれば、そちらにフォーカスを移動
            if (nextIndex < specInputs.length) {
                specInputs[nextIndex].focus();
            }
        }
        
        // --- Tabキーが押された時の処理 ---
        // Tabキーは元々右に移動する機能があるので、特別な処理は不要ですが、
        // 将来的にShift+Tabで左に戻るなどの機能を実装する際に、ここに追記できます。
    }

    // --- 全ての入力欄に、キーボードイベントの監視を追加 ---
    specInputs.forEach(input => {
        input.addEventListener('keydown', handleKeyDown);
    });

    console.log('Pattern Creation page script loaded.');
});