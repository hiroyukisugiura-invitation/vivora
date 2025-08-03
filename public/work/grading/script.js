document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    // ピッチ入力テーブルの本体（tbody）を取得
    const pitchTableBody = document.querySelector('.pitch-table tbody');

    /**
     * テーブルの行内にある他の入力欄を、変更された入力欄の値で更新する関数
     * @param {HTMLInputElement} changedInput - 変更された入力欄の要素
     */
    function syncRowInputs(changedInput) {
        // 変更された入力欄の現在の値を取得
        const newValue = changedInput.value;
        
        // 変更された入力欄が所属する「行」（<tr>）を取得
        const tableRow = changedInput.closest('tr');
        
        // もし行が見つからなければ、何もしない
        if (!tableRow) {
            return;
        }

        // その行の中にある全ての入力欄（自分自身も含む）を取得
        const inputsInRow = tableRow.querySelectorAll('input[type="text"]');
        
        // 全ての入力欄の値を、新しい値に更新する
        inputsInRow.forEach(input => {
            // 自分自身を再度更新する必要はないが、コードをシンプルにするために含めても問題ない
            input.value = newValue;
        });
    }

    // ===== イベントリスナーの設定 =====

    // テーブル本体（tbody）で入力イベントを監視
    pitchTableBody.addEventListener('input', (e) => {
        
        // イベントが入力欄（input）で発生したかを確認
        if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
            // もしそうなら、同じ行の他の入力欄を同期する関数を呼び出す
            syncRowInputs(e.target);
        }
    });

    console.log('Grading page script loaded.');
});