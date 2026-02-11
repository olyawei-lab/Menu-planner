// 🍽️ Meal Prep App - Main Application

const { useState, useEffect, useMemo } = React;

// Полная база рецептов из PDF меню (1250 ккал)
const DEMO_RECIPES = {
    "омлет": { name: "Омлет из 1 яйца", calories_per_portion: 270, protein: 20, fat: 20, carbs: 5, ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}, {name: "Молоко", amount: 50, unit: "мл", optional: true}], instructions: "Взбить яйцо с молоком, обжарить на сковороде." },
    "яйцо-вареное": { name: "Вареное яйцо", calories_per_portion: 70, protein: 6, fat: 5, carbs: 0.5, ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}], instructions: "Отварить яйцо 10 минут." },
    "омлет-2-яйца": { name: "Омлет из 2 яиц", calories_per_portion: 294, protein: 24, fat: 22, carbs: 2, ingredients: [{name: "Яйца", amount: 2, unit: "шт"}], instructions: "Взбить яйца, обжарить на сковороде." },
    "хлеб-сыр": { name: "Хлеб + сыр", calories_per_portion: 200, protein: 12, fat: 10, carbs: 20, ingredients: [{name: "Цельнозерновой хлеб", amount: 50, unit: "г"}, {name: "Сыр твёрдый 35-50%", amount: 30, unit: "г"}], instructions: "Хлеб с сыром." },
    "творог-сухофрукты": { name: "Творог с сухофруктами", calories_per_portion: 233, protein: 20, fat: 5, carbs: 25, ingredients: [{name: "Творог 4-5%", amount: 140, unit: "г"}, {name: "Сухофрукты", amount: 25, unit: "г"}], instructions: "Смешать творог с сухофруктами." },
    "творог-ягоды": { name: "Творог с ягодами", calories_per_portion: 230, protein: 18, fat: 5, carbs: 22, ingredients: [{name: "Творог 5%", amount: 110, unit: "г"}, {name: "Ягоды свежие", amount: 100, unit: "г"}], instructions: "Смешать творог с ягодами." },
    "крупа": { name: "Крупа на выбор", calories_per_portion: 200, protein: 7, fat: 2, carbs: 40, ingredients: [{name: "Крупа (греча/булгур/полба/геркулес/рис/киноа)", amount: 65, unit: "г сух"}, {name: "Вода", amount: 300, unit: "мл"}], instructions: "Отварить крупу в воде." },
    "макароны": { name: "Макароны твёрдых сортов", calories_per_portion: 200, protein: 7, fat: 1, carbs: 42, ingredients: [{name: "Макароны из твёрдых сортов", amount: 65, unit: "г сух"}], instructions: "Отварить макароны до готовности." },
    "курица": { name: "Курица без кожи", calories_per_portion: 165, protein: 31, fat: 4, carbs: 0, ingredients: [{name: "Курица (бедро/голень)", amount: 100, unit: "г в готовом"}], instructions: "Тушить с овощами/томатной пастой." },
    "куриная-грудка": { name: "Куриная грудка", calories_per_portion: 130, protein: 30, fat: 2, carbs: 0, ingredients: [{name: "Куриная грудка", amount: 130, unit: "г"}], instructions: "Запечь, потушить или обжарить." },
    "рыба": { name: "Рыба (семга/хек/скумбрия)", calories_per_portion: 180, protein: 25, fat: 10, carbs: 0, ingredients: [{name: "Рыба", amount: 120, unit: "г в готовом"}], instructions: "Запечь в фольге или на пару." },
    "салат-овощной": { name: "Салат овощной", calories_per_portion: 80, protein: 2, fat: 5, carbs: 8, ingredients: [{name: "Овощи (зелё/огурцы/помидоры/перец)", amount: 200, unit: "г"}, {name: "Масло", amount: 5, unit: "мл"}], instructions: "Нарезать овощи, заправить маслом." },
    "салат-моцарелла": { name: "Салат с моцареллой", calories_per_portion: 224, protein: 10, fat: 18, carbs: 8, ingredients: [{name: "Овощи и зелень", amount: 200, unit: "г"}, {name: "Масло", amount: 10, unit: "мл"}, {name: "Моцарелла", amount: 20, unit: "г"}, {name: "Авокадо", amount: 40, unit: "г", optional: true}], instructions: "Нарезать овощи, добавить масло и моцареллу." },
    "фрукт": { name: "Фрукт", calories_per_portion: 60, protein: 0, fat: 0, carbs: 15, ingredients: [{name: "Яблоко/груша/апельсин/ягоды", amount: 100, unit: "г"}], instructions: "Съесть фрукт." },
    "гречка": { name: "Греча", calories_per_portion: 200, protein: 7, fat: 2, carbs: 40, ingredients: [{name: "Греча", amount: 65, unit: "г сух"}], instructions: "Отварить гречу." },
    "овсянка": { name: "Овсянка (Геркулес)", calories_per_portion: 150, protein: 5, fat: 3, carbs: 28, ingredients: [{name: "Геркулес", amount: 30, unit: "г сух"}, {name: "Изюм/ягоды", amount: 20, unit: "г"}, {name: "Мёд", amount: 5, unit: "г"}], instructions: "Сварить кашу, добавить изюм и мёд." },
    "батончик-злаковый": { name: "Батончик злаковый", calories_per_portion: 180, protein: 8, fat: 6, carbs: 28, ingredients: [{name: "Батончик (без сахара)", amount: 45, unit: "г"}], instructions: "Съесть как перекус." },
    "орехи": { name: "Орехи", calories_per_portion: 180, protein: 6, fat: 16, carbs: 6, ingredients: [{name: "Орехи микс", amount: 30, unit: "г"}], instructions: "Съесть порцию орехов." },
    "ряженка": { name: "Ряженка / Йогурт", calories_per_portion: 150, protein: 8, fat: 6, carbs: 15, ingredients: [{name: "Ряженка 4%", amount: 250, unit: "мл"}], instructions: "Выпить." },
    "запеченный-картофель": { name: "Запеченный картофель", calories_per_portion: 100, protein: 3, fat: 1, carbs: 22, ingredients: [{name: "Картофель", amount: 100, unit: "г"}], instructions: "Запечь в духовке при 180°С." },
    "стейк-индейки": { name: "Индейка", calories_per_portion: 140, protein: 28, fat: 3, carbs: 0, ingredients: [{name: "Филе индейки", amount: 110, unit: "г в готовом"}], instructions: "Запечь или потушить." },
    "салат-греческий": { name: "Салат греческий", calories_per_portion: 250, protein: 12, fat: 18, carbs: 12, ingredients: [{name: "Огурцы/помидоры/перец", amount: 200, unit: "г"}, {name: "Фетакса/моцарелла", amount: 40, unit: "г"}, {name: "Маслины", amount: 20, unit: "г"}, {name: "Масло", amount: 10, unit: "мл"}], instructions: "Нарезать, добавить сыр и масло." }
};

const DEMO_MENU = {
    "2026-02-09": {
        "завтрак": [{id: 1, recipe_key: "омлет", portions_multiplier: 1, calories: 270, text: "Омлет из 1 яйца (можно с молоком до 50 мл или без)"}],
        "перекус": [{id: 2, recipe_key: "творог-сухофрукты", portions_multiplier: 1, calories: 233, text: "Творог 4-5% 140 г с сухофруктами 25 г"}],
        "обед": [
            {id: 3, recipe_key: "крупа", portions_multiplier: 1, calories: 200, text: "Крупа на выбор 65 г сух"},
            {id: 4, recipe_key: "курица", portions_multiplier: 1, calories: 165, text: "Курица без кожи 100 г"},
            {id: 5, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 80, text: "Салат 200 г + ½ ч.л. масла"},
            {id: 6, recipe_key: "фрукт", portions_multiplier: 1, calories: 70, text: "Яблоко 1 шт (100-130 г)"}
        ],
        "ужин": [{id: 7, recipe_key: "салат-моцарелла", portions_multiplier: 1, calories: 224, text: "Салат 200 г + 1 ч.л. масла + моцарелла 20 г + авокадо 40 г"}]
    },
    "2026-02-10": {
        "завтрак": [{id: 8, recipe_key: "хлеб-сыр", portions_multiplier: 1, calories: 200, text: "Хлеб зерновой 25 г + сыр 30 г"}, {id: 9, recipe_key: "яйцо-вареное", portions_multiplier: 1, calories: 70, text: "Вареное яйцо 1 шт"}],
        "перекус": [{id: 10, recipe_key: "творог-сухофрукты", portions_multiplier: 1, calories: 233, text: "Творог мягкий 4% 130 г + сухофрукты 15 г"}],
        "обед": [{id: 11, recipe_key: "крупа", portions_multiplier: 1, calories: 200, text: "Крупа 60 г сух"}, {id: 12, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 80, text: "Салат 200 г"}, {id: 13, recipe_key: "куриная-грудка", portions_multiplier: 1, calories: 165, text: "Куриная грудка 130 г"}, {id: 14, recipe_key: "фрукт", portions_multiplier: 1, calories: 100, text: "Зефир 1 шт / шоколад 15-20 г"}],
        "ужин": [{id: 15, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 80, text: "Салат 200 г + соус"}, {id: 16, recipe_key: "курица", portions_multiplier: 1, calories: 165, text: "Курица 130 г"}]
    },
    "2026-02-11": {
        "завтрак": [{id: 17, recipe_key: "омлет-2-яйца", portions_multiplier: 1, calories: 294, text: "Омлет из 2 яиц"}, {id: 18, recipe_key: "хлеб-сыр", portions_multiplier: 1, calories: 180, text: "Хлеб 20 г + творожный сыр 25 г + семга 30 г"}],
        "перекус": [{id: 19, recipe_key: "батончик-злаковый", portions_multiplier: 1, calories: 180, text: "Батончик злаковый 45-50 г"}, {id: 20, recipe_key: "фрукт", portions_multiplier: 1, calories: 60, text: "Фрукт 1 шт"}],
        "обед": [{id: 21, recipe_key: "крупа", portions_multiplier: 1, calories: 200, text: "Крупа 60 г сух"}, {id: 22, recipe_key: "рыба", portions_multiplier: 1, calories: 180, text: "Семга/скумбрия 120 г"}, {id: 23, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 60, text: "Салат 150 г + йогурт"}],
        "ужин": [{id: 24, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 80, text: "Салат из свеклы с черносливом"}, {id: 25, recipe_key: "рыба", portions_multiplier: 1, calories: 180, text: "Рыба 130 г"}]
    }
};

const getRecipe = (key) => DEMO_RECIPES[key] || {name: key, ingredients: [], instructions: "Рецепт..."};

const useApi = () => {
    const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || '');
    const saveUrl = (url) => { localStorage.setItem('apiUrl', url); setApiUrl(url); };
    return { apiUrl, setApiUrl: saveUrl };
};

const Calendar = ({ currentDate, meals, onDayClick }) => {
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date().toISOString().split('T')[0];
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek < 0) firstDayOfWeek = 6;
        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            days.push({ date: dateStr, day: d, isToday: dateStr === today, meals: meals[dateStr] || {} });
        }
        return { days, month: firstDay.toLocaleString('ru', { month: 'long', year: 'numeric' }) };
    }, [currentDate, meals]);
    
    return (
        <div class="pb-20">
            <div class="px-6 py-4 flex items-center justify-between">
                <h1 class="text-xl font-light text-text">{calendarData.month}</h1>
            </div>
            <div class="grid grid-cols-7 px-2 mb-2">
                {weekDays.map(day => <div key={day} class="text-center text-xs text-muted py-2 font-medium">{day}</div>)}
            </div>
            <div class="grid grid-cols-7 gap-1 px-2">
                {calendarData.days.map((day, idx) => (
                    <div key={idx} className={"aspect-square flex flex-col items-center justify-center relative rounded-full transition-all duration-200 " + (day ? 'cursor-pointer hover:bg-primary/50 ' : '') + (day?.isToday ? 'bg-accent text-white ' : '') + (day && !day.isToday ? 'text-text ' : '')} onClick={() => day && onDayClick(day)}>
                        {day && (
                            <>
                                <span class="text-sm font-medium">{day.day}</span>
                                <div class="flex gap-0.5 mt-0.5">
                                    {day.meals?.завтрак?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                                    {day.meals?.перекус?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                                    {day.meals?.обед?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                                    {day.meals?.ужин?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DayDrawer = ({ date, meals, onClose, onMealClick }) => {
    const mealTypes = [
        { key: 'завтрак', name: '🥣 Завтрак', color: 'amber' },
        { key: 'перекус', name: '🍿 Перекус', color: 'purple' },
        { key: 'обед', name: '🥗 Обед', color: 'green' },
        { key: 'ужин', name: '🍽️ Ужин', color: 'blue' }
    ];
    
    const dateObj = date ? new Date(date + 'T00:00:00') : null;
    const dateStr = dateObj?.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    const totalCalories = Object.values(meals).flat().reduce((sum, m) => sum + (m.calories || 0), 0);
    
    return (
        <div class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/20" onClick={onClose}></div>
            <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden">
                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>
                <div class="px-6 py-3 border-b border-gray-100">
                    <h2 class="text-lg font-medium text-text capitalize">{dateStr}</h2>
                    <p class="text-sm text-muted">🔥 {totalCalories} ккал / день</p>
                </div>
                <div class="overflow-y-auto max-h-[calc(80vh-80px)] pb-20">
                    {mealTypes.map(({ key, name }) => {
                        const mealItems = meals[key] || [];
                        const typeCalories = mealItems.reduce((sum, m) => sum + (m.calories || 0), 0);
                        return (
                            <div key={key} class="px-6 py-3 border-b border-gray-50">
                                <h3 class="text-xs text-muted uppercase tracking-wider mb-2 flex justify-between">
                                    <span>{name}</span>
                                    <span class="text-accent">{typeCalories} ккал</span>
                                </h3>
                                {mealItems.length > 0 ? (
                                    <div class="space-y-2">
                                        {mealItems.map((meal, idx) => (
                                            <div key={idx} class="p-3 bg-primary/30 rounded-xl cursor-pointer active:bg-primary/50 transition" onClick={() => onMealClick(meal)}>
                                                <span class="font-medium text-text">{meal.text || meal.recipe_name}</span>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span class="text-xs text-muted">🔥 {meal.calories} ккал</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p class="text-sm text-muted/70 italic">—</p>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const RecipeCard = ({ meal, onClose }) => {
    if (!meal) return null;
    const recipe = getRecipe(meal.recipe_key);
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/30" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[70vh] overflow-y-auto">
                <h2 class="text-xl font-medium mb-2">{recipe.name}</h2>
                <div class="flex gap-4 text-sm text-muted mb-4">
                    <span>🔥 {meal.calories} ккал</span>
                    <span>💪 {recipe.protein} бел</span>
                    <span>🥑 {recipe.fat} жир</span>
                    <span>🍚 {recipe.carbs} угл</span>
                </div>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <>
                        <h3 class="text-sm font-medium mb-2">Ингредиенты:</h3>
                        <div class="space-y-1 mb-4">
                            {recipe.ingredients.map((ing, i) => (
                                <div key={i} class="flex justify-between py-1 border-b border-gray-100 text-sm">
                                    <span>{ing.name}{ing.optional ? ' (опц.)' : ''}</span>
                                    <span class="text-muted">{ing.amount} {ing.unit}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {recipe.instructions && (
                    <>
                        <h3 class="text-sm font-medium mb-2">Инструкция:</h3>
                        <p class="text-sm text-muted">{recipe.instructions}</p>
                    </>
                )}
                <button onClick={onClose} class="w-full mt-4 py-3 bg-primary text-text rounded-xl">Закрыть</button>
            </div>
        </div>
    );
};

const Settings = ({ apiUrl, onSave, onBack, onLoadDemo }) => {
    const [url, setUrl] = useState(apiUrl);
    return (
        <div class="fixed inset-0 bg-surface z-50 p-6">
            <div class="max-w-md mx-auto">
                <div class="flex items-center mb-6">
                    <button onClick={onBack} class="p-2 -ml-2"><span>←</span></button>
                    <h1 class="text-xl font-medium ml-2">Настройки</h1>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-muted mb-2">API URL</label>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://сервер" class="w-full px-4 py-3 bg-primary/30 rounded-xl" />
                        <p class="text-xs text-muted mt-2">URL бэкенда для загрузки PDF</p>
                    </div>
                    <button onClick={() => onSave(url)} class="w-full py-3 bg-accent text-white rounded-xl">Сохранить</button>
                    <hr class="border-gray-200 my-4" />
                    <div>
                        <input type="file" accept=".pdf" id="pdf-upload" class="hidden" onChange={(e) => { if (e.target.files[0]) alert('Загрузка PDF...'); }} />
                        <label htmlFor="pdf-upload" class="block w-full py-3 bg-primary/50 text-text text-center rounded-xl cursor-pointer">📄 Загрузить PDF меню</label>
                    </div>
                    <hr class="border-gray-200 my-4" />
                    <div>
                        <button onClick={onLoadDemo} class="w-full py-3 bg-green-500 text-white rounded-xl">🎮 Демо-меню (1250 ккал)</button>
                        <p class="text-xs text-muted mt-2 text-center">3 дня из меню</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [view, setView] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [selectedMeal, setSelectedMeal] = useState(null);
    const { apiUrl, setApiUrl } = useApi();
    
    const loadDemo = () => {
        setMeals(DEMO_MENU);
        setView('calendar');
        alert('Демо-меню загружено! Нажми на дни.');
    };
    
    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };
    
    return (
        <div class="min-h-screen bg-surface">
            {view === 'calendar' && (
                <>
                    <Calendar currentDate={currentDate} meals={meals} onDayClick={(day) => setSelectedDate(day.date)} />
                    <div class="fixed bottom-6 left-6 right-6 flex justify-between items-center">
                        <button onClick={() => changeMonth(-1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95"><span>←</span></button>
                        <button onClick={() => changeMonth(1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95"><span>→</span></button>
                    </div>
                    <div class="fixed bottom-24 left-6 right-6 flex justify-between px-4">
                        <button class="p-3 bg-surface shadow rounded-full"><span class="text-gray-400">🛒</span></button>
                        <button onClick={() => setView('settings')} class="p-3 bg-surface shadow rounded-full"><span class="text-gray-400">⚙️</span></button>
                    </div>
                    {selectedDate && <DayDrawer date={selectedDate} meals={meals[selectedDate] || {}} onClose={() => setSelectedDate(null)} onMealClick={setSelectedMeal} />}
                    {selectedMeal && <RecipeCard meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
                </>
            )}
            {view === 'settings' && <Settings apiUrl={apiUrl} onSave={setApiUrl} onBack={() => setView('calendar')} onLoadDemo={loadDemo} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
