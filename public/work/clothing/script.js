document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM要素の取得 ---
    const clothingCategoriesContainer = document.querySelector('.clothing-categories');
    const clothingThumbnailsContainer = document.querySelector('.clothing-thumbnails');

    // --- 服のパーツデータの準備 ---
    // 将来的にはデータベースから取得しますが、まずは仮のデータで機能を作ります。
    // HiroyukiさんのUIデザインに合わせて、まずは'tops'のデータを用意しました。
    const clothingParts = {
        tops: [
            { name: 'tshirt', image: '../../clothing/tops/tshirt.png' },
            { name: 'tanktop', image: '../../clothing/tops/tanktop.png' },
            { name: 'blouse', image: '../../clothing/tops/blouse.png' },
            { name: 'sweater', image: '../../clothing/tops/sweater.png' },
            { name: 'cardigan', image: '../../clothing/tops/cardigan.png' },
            { name: 'hoodie', image: '../../clothing/tops/hoodie.png' },
            { name: 'croptop', image: '../../clothing/tops/croptop.png' },
        ],
        bottoms: [
            // 例： { name: 'jeans', image: '../../clothing/bottoms/jeans.png' },
        ],
        sleeves: [
            // 例： { name: 'long-sleeve', image: '../../clothing/sleeves/long.png' },
        ]
        // 他のカテゴリも同様に追加していきます。
    };

    /**
     * 指定されたカテゴリの服パーツサムネイルを描画する関数
     * @param {string} category - 'tops', 'bottoms' などのカテゴリ名
     */
    function renderClothingThumbnails(category) {
        // 1. まず、現在のサムネイル表示を空にする
        clothingThumbnailsContainer.innerHTML = '';

        // 2. 指定されたカテゴリのパーツデータを取得（なければ空の配列）
        const categoryParts = clothingParts[category] || [];

        // 3. 各パーツデータからサムネイル要素を作成して追加
        categoryParts.forEach(part => {
            const thumbDiv = document.createElement('div');
            thumbDiv.classList.add('clothing-thumb');

            const img = document.createElement('img');
            img.src = part.image;
            img.alt = part.name;

            const label = document.createElement('span');
            label.classList.add('thumb-label');
            label.textContent = part.name;

            thumbDiv.appendChild(img);
            thumbDiv.appendChild(label);
            clothingThumbnailsContainer.appendChild(thumbDiv);
        });
    }

    // ===== イベントリスナーの設定 =====

    clothingCategoriesContainer.addEventListener('click', (e) => {
        // クリックされたのがカテゴリボタンでなければ、何もしない
        const targetButton = e.target.closest('.category-button');
        if (!targetButton || targetButton.classList.contains('add-button')) {
            return;
        }

        // 1. 全てのボタンから 'active' クラスを削除
        clothingCategoriesContainer.querySelectorAll('.category-button').forEach(button => {
            button.classList.remove('active');
        });

        // 2. クリックされたボタンに 'active' クラスを追加
        targetButton.classList.add('active');

        // 3. ボタンのテキスト（カテゴリ名）を取得
        const selectedCategory = targetButton.textContent.toLowerCase();

        // 4. 新しいカテゴリでサムネイルを再描画
        renderClothingThumbnails(selectedCategory);
    });

    // ===== 初期表示処理 =====
    // ページが読み込まれたら、最初に'tops'カテゴリのサムネイルを表示する
    renderClothingThumbnails('tops');

});