document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM要素の取得 ---
    const fabricCategoriesContainer = document.querySelector('.fabric-categories');
    const fabricThumbnailsContainer = document.querySelector('.fabric-thumbnails');

    // --- 生地データの準備 ---
    // 将来的には、データベースからこれらの情報を取得することになりますが、
    // まずは仮のデータで機能を作成します。
    const fabrics = {
        cotton: [
            { name: 'Broadcloth', image: '../../fabric/cotton/broadcloth.png' },
            { name: 'Muslin', image: '../../fabric/cotton/muslin.png' },
            { name: 'Flannel', image: '../../fabric/cotton/flannel.png' },
            { name: 'Poplin', image: '../../fabric/cotton/poplin.png' },
            { name: 'Jersey', image: '../../fabric/cotton/jersey.png' },
        ],
        linen: [
            { name: 'Linen Plain', image: '../../fabric/linen/plain.png' },
            { name: 'Linen Twill', image: '../../fabric/linen/twill.png' },
        ],
        wool: [
            { name: 'Merino Wool', image: '../../fabric/wool/merino.png' },
            { name: 'Cashmere', image: '../../fabric/wool/cashmere.png' },
        ],
        // Silk, Syntheticなども同様にデータを追加できます
    };

    /**
     * 指定されたカテゴリの生地サムネイルを描画する関数
     * @param {string} category - 'cotton', 'linen' などのカテゴリ名
     */
    function renderFabricThumbnails(category) {
        // 1. まず、現在のサムネイル表示を空にする
        fabricThumbnailsContainer.innerHTML = '';

        // 2. 指定されたカテゴリの生地データを取得
        const categoryFabrics = fabrics[category] || [];

        // 3. 各生地データからサムネイル要素を作成して追加
        categoryFabrics.forEach(fabric => {
            const thumbDiv = document.createElement('div');
            thumbDiv.classList.add('fabric-thumb');

            const img = document.createElement('img');
            img.src = fabric.image;
            img.alt = fabric.name;

            const label = document.createElement('span');
            label.classList.add('thumb-label');
            label.textContent = fabric.name;

            thumbDiv.appendChild(img);
            thumbDiv.appendChild(label);
            fabricThumbnailsContainer.appendChild(thumbDiv);
        });

        // 4. 最後に、静的な「+」ボタンを追加
        const addButton = document.createElement('button');
        addButton.classList.add('fabric-thumb', 'add-button');
        addButton.textContent = '+';
        fabricThumbnailsContainer.appendChild(addButton);
    }

    // ===== イベントリスナーの設定 =====

    fabricCategoriesContainer.addEventListener('click', (e) => {
        // クリックされたのがカテゴリボタンでなければ、何もしない
        const targetButton = e.target.closest('.category-button');
        if (!targetButton || targetButton.classList.contains('add-button')) {
            return;
        }

        // 1. 全てのボタンから 'active' クラスを削除
        fabricCategoriesContainer.querySelectorAll('.category-button').forEach(button => {
            button.classList.remove('active');
        });

        // 2. クリックされたボタンに 'active' クラスを追加
        targetButton.classList.add('active');

        // 3. ボタンのテキスト（カテゴリ名）を小文字にして取得
        const selectedCategory = targetButton.textContent.toLowerCase();

        // 4. 新しいカテゴリでサムネイルを再描画
        renderFabricThumbnails(selectedCategory);
    });

    // ===== 初期表示処理 =====
    // ページが読み込まれたら、最初に'cotton'カテゴリのサムネイルを表示する
    renderFabricThumbnails('cotton');

});