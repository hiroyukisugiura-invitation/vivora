document.addEventListener('DOMContentLoaded', () => {

    // --- interact.jsのセットアップ ---

    // ドラッグ移動の機能を設定
    interact('.draggable').draggable({
        listeners: {
            move(event) {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.left = `${x}px`;
                target.style.top = `${y}px`;

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
        },
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        inertia: true
    });

    // 回転・リサイズの機能を設定
    interact('.draggable').gesturable({
        listeners: {
            move(event) {
                const target = event.target;
                const angle = (parseFloat(target.getAttribute('data-angle')) || 0) + event.da;
                const scale = (parseFloat(target.getAttribute('data-scale')) || 1) + event.ds;

                target.style.transform = `rotate(${angle}deg) scale(${scale})`;

                target.setAttribute('data-angle', angle);
                target.setAttribute('data-scale', scale);
            }
        }
    });

    console.log('Print Layout page script loaded.');
});