// Меню Планировщик - Основная логика

class MenuPlanner {
    constructor() {
        this.data = this.loadData();
        this.currentDate = new Date();
        this.currentDay = null;
        this.currentMeal = null;
        this.adjustMealId = null;
        
        this.init();
    }

    // Загрузка данных
    loadData() {
        const saved = localStorage.getItem('menuPlanner');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            menu: this.generateEmptyMenu(),
            recipes: this.generateSampleRecipes(),
            products: [],
            preparations: [],
            adjustments: {}
        };
    }

    saveData() {
        localStorage.setItem('menuPlanner', JSON.stringify(this.data));
    }

    // Генерация пустого меню на 28 дней
    generateEmptyMenu() {
        const menu = {};
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Начать с понедельника
        
        for (let i = 0; i < 28; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = this.formatDate(date);
            menu[dateStr] = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            };
        }
        return menu;
    }

    // Пример рецептов
    generateSampleRecipes() {
        return {
            'куриное-филе': {
                name: 'Запеченное куриное филе',
                portions: 1,
                calories: 165,
                protein: 31,
                fat: 3.6,
                carbs: 0,
                ingredients: [
                    { name: 'Куриное филе', amount: 200, unit: 'г' },
                    { name: 'Соль', amount: 5, unit: 'г' },
                    { name: 'Перец', amount: 2, unit: 'г' },
                    { name: 'Травы', amount: 5, unit: 'г' }
                ],
                instructions: 'Запекать при 180°C 25-30 минут.',
                replacements: {
                    'молочное': 'кокосовое молоко',
                    'сыр': 'тофу'
                }
            },
            'борщ': {
                name: 'Борщ',
                portions: 4,
                calories: 120,
                protein: 8,
                fat: 4,
                carbs: 15,
                ingredients: [
                    { name: 'Свекла', amount: 200, unit: 'г' },
                    { name: 'Капуста', amount: 150, unit: 'г' },
                    { name: 'Картофель', amount: 200, unit: 'г' },
                    { name: 'Мясо', amount: 200, unit: 'г' },
                    { name: 'Лук', amount: 100, unit: 'г' }
                ],
                instructions: 'Варить 40 минут.',
                replacements: {}
            }
        };
    }

    // Инициализация
    init() {
        this.bindEvents();
        this.renderMonthView();
    }

    // Привязка событий
    bindEvents() {
        // Навигация по месяцам
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));

        // Кнопки
        document.getElementById('btn-products').addEventListener('click', () => this.showView('products-view'));
        document.getElementById('btn-preparations').addEventListener('click', () => this.showView('preparations-view'));
        document.getElementById('btn-import').addEventListener('click', () => this.openModal('modal-pdf'));

        // Возврат
        document.getElementById('back-to-main').addEventListener('click', () => this.showView('main-view'));
        document.getElementById('back-to-week').addEventListener('click', () => this.showView('week-view'));
        document.getElementById('back-to-day').addEventListener('click', () => this.showView('day-view'));
        document.getElementById('back-from-products').addEventListener('click', () => this.showView('main-view'));
        document.getElementById('back-from-preps').addEventListener('click', () => this.showView('main-view'));

        // Модалка корректировки
        document.getElementById('btn-cancel-adjust').addEventListener('click', () => this.closeModal('modal-adjust'));
        document.getElementById('btn-save-adjust').addEventListener('click', () => this.saveAdjustment());

        // Модалка PDF
        document.getElementById('btn-cancel-pdf').addEventListener('click', () => this.closeModal('modal-pdf'));
        document.getElementById('btn-save-pdf').addEventListener('click', () => this.importPDF());

        // Список покупок
        document.getElementById('btn-generate-products').addEventListener('click', () => this.generateProductsList());
        document.getElementById('btn-export-products').addEventListener('click', () => this.exportProducts());

        // Заготовки
        document.getElementById('btn-add-prep').addEventListener('click', () => this.addPreparation());

        // Навигация по дням недели
        document.querySelectorAll('.week-day').forEach(el => {
            el.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                this.showDay(date);
            });
        });
    }

    // Показать вид
    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        if (viewId === 'main-view') {
            this.renderMonthView();
        } else if (viewId === 'products-view') {
            this.initProductsView();
        } else if (viewId === 'preparations-view') {
            this.renderPreparations();
        }
    }

    // Рендер месяца
    renderMonthView() {
        const grid = document.getElementById('week-grid');
        grid.innerHTML = '';

        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        document.getElementById('current-month').textContent = 
            this.currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            const dateStr = this.formatDate(date);
            const hasMeals = this.hasMeals(dateStr);

            const el = document.createElement('div');
            el.className = 'week-day' + (hasMeals ? ' has-meals' : '');
            el.dataset.date = dateStr;
            
            const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
            const dayNum = date.getDate();
            
            el.innerHTML = `<span>${dayName}</span><strong>${dayNum}</strong>`;
            grid.appendChild(el);
        }

        this.bindEvents();
    }

    // Изменение месяца
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderMonthView();
    }

    // Показать день
    showDay(dateStr) {
        this.currentDay = dateStr;
        const date = new Date(dateStr);
        document.getElementById('day-title').textContent = date.toLocaleDateString('ru-RU', { 
            weekday: 'long', day: 'numeric', month: 'long' 
        });

        const dayData = this.data.menu[dateStr];
        const container = document.getElementById('day-meals');
        container.innerHTML = '';

        const meals = [
            { key: 'breakfast', name: '🍳 Завтрак' },
            { key: 'lunch', name: '🥗 Обед' },
            { key: 'dinner', name: '🍽️ Ужин' },
            { key: 'snacks', name: '🍿 Перекус' }
        ];

        meals.forEach(meal => {
            if (dayData[meal.key].length > 0) {
                const section = document.createElement('div');
                section.className = 'meal-section';
                section.innerHTML = `<h3>${meal.name}</h3>`;

                dayData[meal.key].forEach((mealItem, idx) => {
                    const recipe = this.data.recipes[mealItem.recipeId];
                    if (recipe) {
                        const adjustments = this.data.adjustments[mealItem.id] || {};
                        const portions = adjustments.portions || recipe.portions;
                        const days = adjustments.days || 1;

                        const card = document.createElement('div');
                        card.className = 'meal-card';
                        card.innerHTML = `
                            <div class="meal-header">
                                <span class="meal-title">${recipe.name}</span>
                            </div>
                            <div class="meal-info">
                                <span>👤 ${portions} порц.</span>
                                <span>📅 ${days} дн.</span>
                                <span>🔥 ${Math.round(recipe.calories * portions)} ккал</span>
                            </div>
                            ${adjustments.comment ? `<p style="font-size:12px;color:var(--warning)">📝 ${adjustments.comment}</p>` : ''}
                            <div class="meal-actions">
                                <button class="btn-adjust" data-meal-id="${mealItem.id}">Настроить</button>
                                <button class="btn-duplicate" data-meal-id="${mealItem.id}" data-date="${dateStr}" data-type="${meal.key}">Повторить</button>
                                <button class="btn-details" data-recipe-id="${mealItem.recipeId}">Рецепт</button>
                            </div>
                        `;
                        section.appendChild(card);
                    }
                });

                container.appendChild(section);
            }
        });

        // Кнопка добавления блюда
        const addBtn = document.createElement('button');
        addBtn.className = 'btn';
        addBtn.textContent = '+ Добавить блюдо';
        addBtn.onclick = () => this.openAddMealModal(dateStr);
        container.appendChild(addBtn);

        // Привязка событий кнопок
        container.querySelectorAll('.btn-adjust').forEach(btn => {
            btn.addEventListener('click', (e) => this.openAdjustModal(e.target.dataset.mealId));
        });

        container.querySelectorAll('.btn-duplicate').forEach(btn => {
            btn.addEventListener('click', (e) => this.duplicateMeal(e.target.dataset));
        });

        container.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => this.showRecipe(e.target.dataset.recipeId));
        });

        this.showView('day-view');
    }

    // Показать рецепт
    showRecipe(recipeId) {
        const recipe = this.data.recipes[recipeId];
        if (!recipe) return;

        this.currentMeal = recipeId;
        document.getElementById('recipe-title').textContent = recipe.name;

        const container = document.getElementById('recipe-content');
        container.innerHTML = `
            <div class="recipe-meta">
                <span>🔥 ${recipe.calories} ккал</span>
                <span>💪 ${recipe.protein} бел</span>
                <span>🥑 ${recipe.fat} жир</span>
                <span>🍚 ${recipe.carbs} угл</span>
            </div>
            <div class="recipe-ingredients">
                <h4>Ингредиенты (на ${recipe.portions} порц.)</h4>
                <ul>
                    ${recipe.ingredients.map(ing => `
                        <li>
                            <span>${ing.name}</span>
                            <span>${ing.amount} ${ing.unit}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="recipe-instruction">
                <h4>Инструкция</h4>
                <p>${recipe.instructions}</p>
            </div>
        `;

        this.showView('recipe-view');
    }

    // Открыть модалку корректировки
    openAdjustModal(mealId) {
        this.adjustMealId = mealId;
        const meal = this.findMealById(mealId);
        const recipe = this.data.recipes[meal.recipeId];
        const adjustments = this.data.adjustments[mealId] || {};

        document.getElementById('adj-portions').value = adjustments.portions || recipe.portions;
        document.getElementById('adj-days').value = adjustments.days || 1;
        document.getElementById('adj-comment').value = adjustments.comment || '';

        this.openModal('modal-adjust');
    }

    // Сохранить корректировку
    saveAdjustment() {
        const portions = parseInt(document.getElementById('adj-portions').value) || 1;
        const days = parseInt(document.getElementById('adj-days').value) || 1;
        const comment = document.getElementById('adj-comment').value;

        this.data.adjustments[this.adjustMealId] = { portions, days, comment };
        this.saveData();
        this.closeModal('modal-adjust');
        this.showDay(this.currentDay);
    }

    // Дублировать блюдо
    duplicateMeal(data) {
        const { mealId, date, type } = data;
        const meal = this.findMealById(mealId);
        if (!meal) return;

        // Дублировать на следующие дни
        for (let i = 1; i < 3; i++) {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + i);
            const newDateStr = this.formatDate(newDate);

            if (this.data.menu[newDateStr]) {
                const newId = this.generateId();
                this.data.menu[newDateStr][type].push({ ...meal, id: newId });
            }
        }

        this.saveData();
        this.showDay(date);
    }

    // Открыть добавление блюда
    openAddMealModal(dateStr) {
        // TODO: Модалка выбора блюда из рецептов
        alert('Выберите блюдо из списка рецептов');
    }

    // Показать список покупок
    initProductsView() {
        const from = document.getElementById('products-from');
        const to = document.getElementById('products-to');

        if (!from.value) {
            from.value = this.formatDate(new Date());
        }
        if (!to.value) {
            const toDate = new Date();
            toDate.setDate(toDate.getDate() + 14);
            to.value = this.formatDate(toDate);
        }
    }

    // Сгенерировать список покупок
    generateProductsList() {
        const fromStr = document.getElementById('products-from').value;
        const toStr = document.getElementById('products-to').value;

        const products = {};

        // Собираем все блюда за период
        let currentDate = new Date(fromStr);
        const endDate = new Date(toStr);

        while (currentDate <= endDate) {
            const dateStr = this.formatDate(currentDate);
            const dayMenu = this.data.menu[dateStr];

            Object.values(dayMenu).flat().forEach(meal => {
                const recipe = this.data.recipes[meal.recipeId];
                if (!recipe) return;

                const adjustments = this.data.adjustments[meal.id] || {};
                const portions = adjustments.portions || recipe.portions;
                const multiplier = portions / recipe.portions;

                recipe.ingredients.forEach(ing => {
                    const key = ing.name;
                    if (!products[key]) {
                        products[key] = { amount: 0, unit: ing.unit };
                    }
                    products[key].amount += ing.amount * multiplier;
                });
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Рендер
        const container = document.getElementById('products-list');
        container.innerHTML = Object.entries(products).map(([name, data]) => `
            <div class="product-item" data-name="${name}">
                <input type="checkbox">
                <span>${name}</span>
                <span style="margin-left:auto">${Math.round(data.amount * 100) / 100} ${data.unit}</span>
            </div>
        `).join('');
    }

    // Экспорт списка покупок
    exportProducts() {
        const items = document.querySelectorAll('#products-list .product-item');
        let text = '🛒 Список покупок\n\n';
        items.forEach(item => {
            const checked = item.querySelector('input').checked ? '✓' : '○';
            const name = item.querySelector('span:first-child').textContent;
            const amount = item.querySelector('span:last-child').textContent;
            text += `${checked} ${name} - ${amount}\n`;
        });

        // Копируем в буфер
        navigator.clipboard.writeText(text).then(() => {
            alert('Список скопирован в буфер обмена!');
        });
    }

    // Рендер заготовок
    renderPreparations() {
        const container = document.getElementById('preparations-list');
        container.innerHTML = this.data.preparations.map((prep, idx) => `
            <div class="prep-card">
                <div class="prep-header">
                    <span class="prep-title">${prep.title}</span>
                    <span class="prep-status ${prep.done ? 'done' : 'pending'}">
                        ${prep.done ? '✓ Готово' : '○ Запланировано'}
                    </span>
                </div>
                <div class="prep-date">📅 ${new Date(prep.date).toLocaleDateString('ru-RU')}</div>
                <p>${prep.description || ''}</p>
            </div>
        `).join('') || '<p class="empty">Нет заготовок</p>';
    }

    // Добавить заготовку
    addPreparation() {
        const title = prompt('Название заготовки:');
        if (!title) return;

        const date = prompt('Дата (YYYY-MM-DD):', this.formatDate(new Date()));
        const description = prompt('Описание:');

        this.data.preparations.push({
            id: this.generateId(),
            title,
            date,
            description,
            done: false
        });

        this.saveData();
        this.renderPreparations();
    }

    // Импорт PDF
    importPDF() {
        const input = document.getElementById('pdf-input');
        if (!input.files[0]) {
            alert('Выберите файл');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.parseMenuText(text);
            this.closeModal('modal-pdf');
            this.renderMonthView();
        };
        reader.readAsText(input.files[0]);
    }

    // Парсинг текста меню
    parseMenuText(text) {
        // Простой парсинг - ищем строки вида "День 1: ..."
        const dayRegex = /День\s*(\d+)[:\s]*(.*?)(?=День\s*\d+|$)/gi;
        let match;

        while ((match = dayRegex.exec(text)) !== null) {
            const dayNum = parseInt(match[1]);
            const content = match[2];

            // Находим дату для этого дня
            const dates = Object.keys(this.data.menu);
            if (dates[dayNum - 1]) {
                // Парсим блюда (упрощённо)
                const meals = content.split('\n').filter(line => line.trim());
                meals.forEach(meal => {
                    // TODO: Более умный парсинг
                });
            }
        }
    }

    // Модальные окна
    openModal(id) {
        document.getElementById(id).classList.add('active');
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    // Вспомогательные
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    hasMeals(dateStr) {
        const day = this.data.menu[dateStr];
        if (!day) return false;
        return Object.values(day).some(arr => arr.length > 0);
    }

    findMealById(id) {
        for (const date in this.data.menu) {
            for (const type in this.data.menu[date]) {
                const meal = this.data.menu[date][type].find(m => m.id === id);
                if (meal) return meal;
            }
        }
        return null;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MenuPlanner();
});
