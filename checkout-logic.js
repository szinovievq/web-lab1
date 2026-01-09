const API_KEY = "05125fd6-df9e-4262-b007-93b670896319";
const DISHES_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";
const ORDERS_URL = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${API_KEY}`;

let allDishes = [];
let currentOrder = {
    soup: null,
    'main-course': null,
    salad: null,
    drink: null,
    dessert: null
};

async function initCheckout() {
    try {
        const response = await fetch(DISHES_URL);
        allDishes = await response.json();
        
        loadFromStorage();
        renderSelectedDishes();
        updateOrderSummary();
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        alert("Не удалось загрузить данные меню.");
    }
}

function loadFromStorage() {
    const savedIds = JSON.parse(localStorage.getItem('currentOrder')) || {};
    for (const category in savedIds) {
        const dish = allDishes.find(d => d.id === savedIds[category]);
        if (dish) currentOrder[category] = dish;
    }
}

function renderSelectedDishes() {
    const container = document.getElementById('selected-cards-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    const form = document.getElementById('make-order');
    
    container.innerHTML = '';
    const selectedCategories = Object.keys(currentOrder).filter(cat => currentOrder[cat]);

    if (selectedCategories.length === 0) {
        emptyMsg.style.display = 'block';
        form.style.display = 'none';
        return;
    }

    emptyMsg.style.display = 'none';
    form.style.display = 'grid';

    selectedCategories.forEach(category => {
        const dish = currentOrder[category];
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <img src="${dish.image}" class="food" alt="${dish.name}">
            <p class="price">${dish.price}₽</p>
            <p class="name">${dish.name}</p>
            <div class="bottom">
                <p class="weight">${dish.count}</p>
                <button type="button" class="delete-btn" onclick="removeDish('${category}')">Удалить</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.removeDish = function(category) {
    currentOrder[category] = null;
    
    const savedIds = JSON.parse(localStorage.getItem('currentOrder')) || {};
    delete savedIds[category];
    localStorage.setItem('currentOrder', JSON.stringify(savedIds));
    
    renderSelectedDishes();
    updateOrderSummary();
};

function updateOrderSummary() {
    const mapping = {
        soup: { el: 'order-soup', def: 'Суп не выбран' },
        'main-course': { el: 'order-main', def: 'Главное блюдо не выбрано' },
        salad: { el: 'order-salad', def: 'Салат/стартер не выбран' },
        drink: { el: 'order-drink', def: 'Напиток не выбран' },
        dessert: { el: 'order-desert', def: 'Десерт не выбран' }
    };

    let total = 0;
    for (const [cat, info] of Object.entries(mapping)) {
        const span = document.getElementById(info.el);
        if (currentOrder[cat]) {
            span.textContent = `${currentOrder[cat].name} (${currentOrder[cat].price}₽)`;
            total += currentOrder[cat].price;
        } else {
            span.textContent = info.def;
        }
    }
    document.getElementById('order-total').textContent = total;
    
    const emptyHint = document.getElementById('order-empty');
    const details = document.getElementById('order-details');
    if (total > 0) {
        emptyHint.style.display = 'none';
        details.style.display = 'block';
    } else {
        emptyHint.style.display = 'block';
        details.style.display = 'none';
    }
}

function getValidationError() {
    const s = currentOrder;
    const hasSoup = !!s.soup;
    const hasMain = !!s['main-course'];
    const hasSalad = !!s.salad;
    const hasDrink = !!s.drink;

    if (!hasSoup && !hasMain && !hasSalad && !hasDrink) return "Ничего не выбрано";
    
    const combo1 = hasSoup && hasMain && hasSalad && hasDrink;
    const combo2 = hasSoup && hasMain && hasDrink;
    const combo3 = hasSoup && hasSalad && hasDrink;
    const combo4 = hasMain && hasSalad && hasDrink;
    const combo5 = hasMain && hasDrink;

    if (combo1 || combo2 || combo3 || combo4 || combo5) return null;

    if (!hasDrink) return "Выберите напиток";
    if (hasSoup && !hasMain && !hasSalad) return "Выберите главное блюдо или салат";
    if (hasSalad && !hasSoup && !hasMain) return "Выберите суп или главное блюдо";
    if (!hasMain && !hasSoup) return "Выберите главное блюдо";
    
    return "Состав заказа не соответствует ни одному комбо";
}

document.getElementById('make-order').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMsg = getValidationError();
    if (errorMsg) {
        alert(errorMsg);
        return;
    }

    const formData = new FormData(e.target);
    
    const body = {
        full_name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('tel'),
        delivery_address: formData.get('address'),
        delivery_type: formData.get('r-time') === 'asap' ? 'now' : 'by_time',
        delivery_time: formData.get('time-select'),
        comment: formData.get('comment'),
        subscribe: formData.get('confirm') ? 1 : 0,
        soup_id: currentOrder.soup?.id || null,
        main_course_id: currentOrder['main-course']?.id || null,
        salad_id: currentOrder.salad?.id || null,
        drink_id: currentOrder.drink?.id || null,
        dessert_id: currentOrder.dessert?.id || null
    };

    try {
        const response = await fetch(ORDERS_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert("Заказ успешно оформлен!");
            localStorage.removeItem('currentOrder');
            setTimeout(() => { window.location.href = "home.html"; }, 2000);
        } else {
            const data = await response.json();
            throw new Error(data.error || "Ошибка сервера");
        }
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

initCheckout();