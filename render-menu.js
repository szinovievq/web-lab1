document.addEventListener("DOMContentLoaded", function () {

    const order = { soup: null, main: null, drink: null };

    const orderEmpty = document.getElementById('order-empty');
    const orderDetails = document.getElementById('order-details');

    const orderSoup = document.getElementById('order-soup');
    const orderMain = document.getElementById('order-main');
    const orderDrink = document.getElementById('order-drink');
    const orderTotal = document.getElementById('order-total');

    const form = document.getElementById('make-order');

    const categories = ['soup', 'main', 'drink'];

    function createFoodCard(item) {
        const card = document.createElement('div');
        card.classList.add('food-card');
        card.dataset.dish = item.keyword;

        const img = document.createElement('img');
        img.src = item.image;
        img.classList.add('food');

        const price = document.createElement('p');
        price.classList.add('price');
        price.innerHTML = item.price + '₽';

        const name = document.createElement('p');
        name.classList.add('name');
        name.textContent = item.name;

        const bottom = document.createElement('div');
        bottom.classList.add('bottom');

        const weight = document.createElement('p');
        weight.classList.add('weight');
        weight.textContent = item.count;

        const button = document.createElement('button');
        button.type = "button";
        button.textContent = 'Добавить';

        bottom.append(weight, button);
        card.append(img, price, name, bottom);

        return card;
    }
    
    categories.forEach(category => {
        
        const categoryGrid = document.querySelector(`.grid-food[data-category="${category}"]`);
        
        if (!categoryGrid) return;

        const items = menuItems
            .filter(item => item.category === category)
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

        items.forEach(item => {
            const card = createFoodCard(item);
            categoryGrid.appendChild(card);
        });
    });

    function updateOrderUI() {
        if (!order.soup && !order.main && !order.drink) {
            orderEmpty.style.display = "block";
            orderDetails.style.display = "none";
            return;
        }

        orderEmpty.style.display = "none";
        orderDetails.style.display = "block";

        orderSoup.innerHTML = order.soup
            ? `${order.soup.name} ${order.soup.price}₽`
            : 'Суп не выбран';

        orderMain.innerHTML = order.main
            ? `${order.main.name} ${order.main.price}₽`
            : 'Блюдо не выбрано';

        orderDrink.innerHTML = order.drink
            ? `${order.drink.name} ${order.drink.price}₽`
            : 'Напиток не выбран';

        const total = (order.soup?.price || 0) + (order.main?.price || 0) + (order.drink?.price || 0);
        orderTotal.textContent = total;
    }

    document.addEventListener('click', function (e) {
        const card = e.target.closest('.food-card');
        if (!card) return;

        const keyword = card.dataset.dish;
        const item = menuItems.find(el => el.keyword === keyword);
        if (!item) return;

        if (item.category === 'soup') {
            order.soup = item;
        } else if (item.category === 'main') {
            order.main = item;
        } else if (item.category === 'drink') {
            order.drink = item;
        }

        updateOrderUI();
    });

    if (form) {
        form.addEventListener('reset', () => {
            order.soup = null;
            order.main = null;
            order.drink = null;
            updateOrderUI();
        });
    }

    updateOrderUI();

});