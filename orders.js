const API_KEY = "05125fd6-df9e-4262-b007-93b670896319";
const BASE_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api";
let dishes = [];

async function loadData() {
    try {
        const resDishes = await fetch(`${BASE_URL}/dishes`);
        dishes = await resDishes.json();
        await loadOrders();
    } catch (err) {
        console.error("Ошибка загрузки данных:", err);
    }
}

async function loadOrders() {
    const res = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`);
    const data = await res.json();
    renderTable(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
}

function renderTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    orders.forEach((o, i) => {
        tbody.innerHTML += `<tr>
            <td>${i+1}</td>
            <td>${new Date(o.created_at).toLocaleString()}</td>
            <td>${getNames(o)}</td>
            <td>${getTotal(o)}₽</td>
            <td>${o.delivery_time || 'Скорее'}</td>
            <td>
                <span class="action-btn" onclick="openView(${o.id})">👁️</span>
                <span class="action-btn" onclick="openEdit(${o.id})">✏️</span>
                <span class="action-btn" onclick="openDelete(${o.id})">🗑️</span>
            </td>
        </tr>`;
    });
}

async function openView(id) {
    const order = await fetchOrder(id);
    const temp = document.getElementById('view-order-template').content.cloneNode(true);
    
    temp.querySelector('[data-field="created_at"]').innerText = new Date(order.created_at).toLocaleString();
    temp.querySelector('[data-field="full_name"]').innerText = order.full_name;
    temp.querySelector('[data-field="delivery_address"]').innerText = order.delivery_address;
    temp.querySelector('[data-field="delivery_time"]').innerText = order.delivery_time || 'Как можно скорее';
    temp.querySelector('[data-field="phone"]').innerText = order.phone;
    temp.querySelector('[data-field="email"]').innerText = order.email;
    temp.querySelector('[data-field="comment"]').innerText = order.comment || 'Нет комментария';
    temp.querySelector('[data-field="total_price"]').innerText = getTotal(order);

    renderComp(order, temp.getElementById('view-composition'));
    showModal(temp);
}

async function openEdit(id) {
    const order = await fetchOrder(id);
    const temp = document.getElementById('edit-order-template').content.cloneNode(true);
    const form = temp.getElementById('edit-order-form');

    form.email.type = "email";
    form.email.required = true;
    form.delivery_time.step = "300";
    form.full_name.required = true;
    form.delivery_address.required = true;

    temp.querySelector('[data-field="created_at"]').innerText = new Date(order.created_at).toLocaleString();
    temp.querySelector('[data-field="total_price"]').innerText = getTotal(order);
    
    form.full_name.value = order.full_name;
    form.delivery_address.value = order.delivery_address;
    form.delivery_time.value = order.delivery_time;
    form.phone.value = order.phone;
    form.email.value = order.email;
    temp.querySelector('textarea').value = order.comment || '';

    renderComp(order, temp.getElementById('edit-composition'));
    temp.getElementById('save-btn').onclick = () => updateOrder(id);
    showModal(temp);
}

async function updateOrder(id) {
    const form = document.getElementById('edit-order-form');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const comment = document.querySelector('.modal-textarea').value;
    formData.set('comment', comment);

    try {
        const res = await fetch(`${BASE_URL}/orders/${id}?api_key=${API_KEY}`, { 
            method: 'PUT', 
            body: formData 
        });
        if (res.ok) {
            closeModal();
            alert("Заказ обновлен")
            await loadOrders();
        } else {
            alert("Ошибка сохранения на сервере");
        }
    } catch (err) {
        console.error("Ошибка:", err);
    }
}

function openDelete(id) {
    const temp = document.getElementById('delete-order-template').content.cloneNode(true);
    temp.getElementById('confirm-delete-btn').onclick = () => deleteOrder(id);
    showModal(temp);
}

async function deleteOrder(id) {
    await fetch(`${BASE_URL}/orders/${id}?api_key=${API_KEY}`, { method: 'DELETE' });
    closeModal();
    alert("Заказ удален")
    await loadOrders();
}

function renderComp(order, container) {
    if (!container) return;
    const cats = { soup_id: "Суп", main_course_id: "Основное", salad_id: "Салат", drink_id: "Напиток", dessert_id: "Десерт" };
    container.innerHTML = '';
    Object.entries(cats).forEach(([key, label]) => {
        const d = dishes.find(dish => dish.id === order[key]);
        if (d) {
            container.innerHTML += `
                <div class="info-row">
                    <span class="label">${label}</span>
                    <span class="value">${d.name} ${d.price}₽</span>
                </div>`;
        }
    });
}

async function fetchOrder(id) {
    const res = await fetch(`${BASE_URL}/orders/${id}?api_key=${API_KEY}`);
    return await res.json();
}

function getTotal(o) {
    return [o.soup_id, o.main_course_id, o.salad_id, o.drink_id, o.dessert_id]
        .reduce((s, id) => s + (dishes.find(d => d.id === id)?.price || 0), 0);
}

function getNames(o) {
    return [o.soup_id, o.main_course_id, o.salad_id, o.drink_id, o.dessert_id]
        .map(id => dishes.find(d => d.id === id)?.name)
        .filter(n => n).join(', ');
}

function showModal(content) {
    const target = document.getElementById('modal-content');
    target.innerHTML = '';
    target.appendChild(content);
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

window.onload = loadData;