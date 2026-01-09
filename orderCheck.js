document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('make-order');

    function getValidationError(selected) {
        const { soup, main, salad, drink, desert } = selected;

        if (!soup && !main && !salad && !drink && !desert) {
            return "Ничего не выбрано. Выберите блюда для заказа";
        }

        if (soup && salad && !main) {
            if (!drink) return "Выберите напиток";
            return null;
        }

        if (soup && !main && !salad) {
            return "Выберите главное блюдо/салат/стартер";
        }

        if (salad && !soup && !main) {
            return "Выберите суп или главное блюдо";
        }

        if ((drink || desert) && !main && !soup) {
            return "Выберите главное блюдо";
        }

        if (!drink) {
            return "Выберите напиток";
        }

        return null; 
    }

    function showNotification(message) {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <button id="modal-ok">Окей 👌</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('modal-ok').addEventListener('click', () => {
            overlay.remove();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            const selected = {
                soup: document.getElementById('order-soup').textContent !== 'Суп не выбран',
                main: document.getElementById('order-main').textContent !== 'Главное блюдо не выбрано',
                salad: document.getElementById('order-salad').textContent !== 'Салат/стартер не выбран',
                drink: document.getElementById('order-drink').textContent !== 'Напиток не выбран',
                desert: document.getElementById('order-desert').textContent !== 'Десерт не выбран'
            };

            const errorMsg = getValidationError(selected);

            if (errorMsg) {
                e.preventDefault();
                showNotification(errorMsg);
            }
        });
    }
});