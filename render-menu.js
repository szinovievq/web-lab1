document.addEventListener("DOMContentLoaded", function () {
    let menuItems = [];

    const order = { 
        "soup": null, 
        "main-course": null, 
        "salad": null, 
        "drink": null, 
        "dessert": null 
    };

    const categories = ['soup', 'main-course', 'salad', 'drink', 'dessert'];
    const storageKey = 'currentOrder';

    const checkoutPanel = document.getElementById('checkout-panel');
    const panelTotal = document.getElementById('panel-total');
    const checkoutLink = document.getElementById('checkout-link');

    function saveToLocalStorage() {
        const ids = {};
        for (const category in order) {
            if (order[category]) ids[category] = order[category].id;
        }
        localStorage.setItem(storageKey, JSON.stringify(ids));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            const ids = JSON.parse(savedData);
            for (const category in ids) {
                const dish = menuItems.find(item => item.id === ids[category]);
                if (dish) order[category] = dish;
            }
        }
    }

    function checkIsComboComplete() {
        const selected = {
            soup: order.soup !== null,
            main: order["main-course"] !== null,
            salad: order.salad !== null,
            drink: order.drink !== null,
            desert: order.dessert !== null 
        };

        if (typeof getValidationError === 'function') {
            const error = getValidationError(selected);
            console.log("Результат:", error);
            return error === null;
        }
        
        return order["main-course"] !== null && order.drink !== null;
    }

    function updateOrderUI() {
        const total = Object.values(order).reduce((sum, item) => sum + (item?.price || 0), 0);
        
        if (checkoutPanel) {
            checkoutPanel.style.display = total > 0 ? 'flex' : 'none';
            if (panelTotal) panelTotal.textContent = total + '₽';
        }

        if (checkoutLink) {
            const isComplete = checkIsComboComplete();
            if (isComplete) {
                checkoutLink.classList.remove('disabled');
                checkoutLink.style.pointerEvents = "auto";
                checkoutLink.style.opacity = "1";
                checkoutLink.style.cursor = "pointer";
            } else {
                checkoutLink.classList.add('disabled');
                checkoutLink.style.pointerEvents = "none";
                checkoutLink.style.opacity = "0.5";
                checkoutLink.style.cursor = "not-allowed";
            }
        }

        document.querySelectorAll('.food-card').forEach(card => {
            const keyword = card.dataset.dish;
            const item = menuItems.find(el => el.keyword === keyword);
            if (item && order[item.category]?.id === item.id) {
                card.classList.add('selected-card');
                card.style.border = "2px solid tomato";
            } else {
                card.classList.remove('selected-card');
                card.style.border = "none";
            }
        });

        const fields = {
            'order-soup': [order.soup, 'Суп не выбран'],
            'order-main': [order["main-course"], 'Главное блюдо не выбрано'],
            'order-salad': [order.salad, 'Салат/стартер не выбран'],
            'order-drink': [order.drink, 'Напиток не выбран'],
            'order-desert': [order.dessert, 'Десерт не выбран']
        };
        for (const [id, data] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.textContent = data[0] ? `${data[0].name} ${data[0].price}₽` : data[1];
        }
    }

    async function loadDishes() {
        const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
        try {
            const response = await fetch(apiUrl);
            menuItems = await response.json();
            loadFromLocalStorage();
            categories.forEach(category => renderCategory(category));
            updateOrderUI();
        } catch (e) { console.error(e); }
    }

    function createFoodCard(item) {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.dataset.dish = item.keyword;
        card.innerHTML = `
            <img src="${item.image}" class="food">
            <p class="price">${item.price}₽</p>
            <p class="name">${item.name}</p>
            <div class="bottom">
                <p class="weight">${item.count}</p>
                <button type="button">Добавить</button>
            </div>`;
        return card;
    }

    function renderCategory(category, activeKind = null) {
        const grid = document.querySelector(`.grid-food[data-category="${category}"]`);
        if (!grid) return;
        grid.innerHTML = '';
        const items = menuItems
            .filter(item => item.category === category && (!activeKind || item.kind === activeKind))
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        items.forEach(item => grid.appendChild(createFoodCard(item)));
        updateOrderUI();
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.food-card');
        if (!card) return;
        const item = menuItems.find(el => el.keyword === card.dataset.dish);
        if (item) {
            order[item.category] = item;
            saveToLocalStorage();
            updateOrderUI();
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.filters');
            const category = container.dataset.category;
            const kind = btn.dataset.kind;
            
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCategory(category, kind);
        });
    });

    loadDishes();
});