// 🍽️ Meal Prep App - Main Application

const { useState, useEffect, useMemo } = React;

// Демо-данные меню (1250 ккал) - по структуре PDF
const DEMO_MENU = {
    "2026-02-09": {
        "завтрак": [{ id: 1, recipe_id: 1, recipe_name: "Омлет из 1 яйца", portions_multiplier: 1, calories: 270 }],
        "перекус": [{ id: 2, recipe_id: 2, recipe_name: "Творог с сухофруктами", portions_multiplier: 1, calories: 233 }],
        "обед": [
            { id: 3, recipe_id: 3, recipe_name: "Крупа на выбор (греча/булгур/полба/геркулес/бурый рис/киноа)", portions_multiplier: 1, calories: 200 },
            { id: 4, recipe_id: 4, recipe_name: "Курица без кожи (100г в готовом виде)", portions_multiplier: 1, calories: 165 },
            { id: 5, recipe_id: 5, recipe_name: "Салат овощной (200г) + ½ ч.л. масла", portions_multiplier: 1, calories: 80 },
            { id: 6, recipe_id: 6, recipe_name: "Яблоко 1 шт. (100-130г)", portions_multiplier: 1, calories: 70 }
        ],
        "ужин": [{ id: 7, recipe_id: 7, recipe_name: "Салат овощной (200г) + 1 ч.л. масла + моцарелла 20г + авокадо 40г", portions_multiplier: 1, calories: 224 }]
    },
    "2026-02-10": {
        "завтрак": [{ id: 8, recipe_id: 8, recipe_name: "Цельнозерновой хлеб 50г + сыр 30г", portions_multiplier: 1, calories: 200 }],
        "перекус": [{ id: 9, recipe_id: 2, recipe_name: "Творог с сухофруктами", portions_multiplier: 1, calories: 233 }],
        "обед": [
            { id: 10, recipe_id: 3, recipe_name: "Макароны твёрдых сортов 190г вар.", portions_multiplier: 1, calories: 200 },
            { id: 11, recipe_id: 4, recipe_name: "Курица без кожи (100г)", portions_multiplier: 1, calories: 165 },
            { id: 12, recipe_id: 5, recipe_name: "Салат овощной (200г) + ½ ч.л. масла", portions_multiplier: 1, calories: 80 },
            { id: 13, recipe_id: 6, recipe_name: "Груша", portions_multiplier: 1, calories: 60 }
        ],
        "ужин": [{ id: 14, recipe_id: 7, recipe_name: "Салат овощной (200г) + 1 ч.л. масла + моцарелла 20г", portions_multiplier: 1, calories: 190 }]
    },
    "2026-02-11": {
        "завтрак": [{ id: 15, recipe_id: 1, recipe_name: "Омлет из 1 яйца", portions_multiplier: 1, calories: 270 }],
        "перекус": [{ id: 16, recipe_id: 6, recipe_name: "Яблоко", portions_multiplier: 1, calories: 70 }],
        "обед": [
            { id: 17, recipe_id: 3, recipe_name: "Греча 65г сухое", portions_multiplier: 1, calories: 200 },
            { id: 18, recipe_id: 4, recipe_name: "Курица (100г)", portions_multiplier: 1, calories: 165 },
            { id: 19, recipe_id: 5, recipe_name: "Салат (200г) + ½ ч.л. масла", portions_multiplier: 1, calories: 80 },
            { id: 20, recipe_id: 6, recipe_name: "Апельсин", portions_multiplier: 1, calories: 60 }
        ],
        "ужин": [{ id: 21, recipe_id: 7, recipe_name: "Салат + 1 ч.л. масла + моцарелла 20г + авокадо 40г", portions_multiplier: 1, calories: 224 }]
    }
};

const DEMO_RECIPES = {
    1: { id: 1, name: "Омлет из 1 яйца", portions_base: 1, calories_per_portion: 270, protein: 20, fat: 20, carbs: 5, 
        ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}, {name: "Молоко", amount: 50, unit: "мл", optional: true}], 
        instructions: "Взбить яйцо с молоком, обжарить на сковороде. Можно без молока." },
    2: { id: 2, name: "Творог с сухофруктами", portions_base: 1, calories_per_portion: 233, protein: 20, fat: 5, carbs: 25,
        ingredients: [{name: "Творог 4-5%", amount: 140, unit: "г"}, {name: "Сухофрукты", amount: 25, unit: "г"}],
        instructions: "Смешать творог с сухофруктами." },
    3: { id: 3, name: "Крупа на выбор", portions_base: 1, calories_per_portion: 200, protein: 7, fat: 2, carbs: 40,
        ingredients: [{name: "Крупа (греча/булгур/полба/геркулес/рис/киноа)", amount: 65, unit: "г"}, {name: "Вода", amount: 300, unit: "мл"}],
        instructions: "Отварить крупу в воде. Или макароны твёрдых сортов: 65г сухих = 190г варёных." },
    4: { id: 4, name: "Курица без кожи", portions_base: 1, calories_per_portion: 165, protein: 31, fat: 4, carbs: 0,
        ingredients: [{name: "Курица (бедро/голень без кожи)", amount: 100, unit: "г в готовом виде"}],
        instructions: "Приготовить: тушить в сковороде с водой/томатной пастой/луком/морковью/травами." },
    5: { id: 5, name: "Салат овощной", portions_base: 1, calories_per_portion: 80, protein: 2, fat: 5, carbs: 8,
        ingredients: [{name: "Овощи (зелень/огурцы/помидоры/перец/капуста/редис/лук)", amount: 200, unit: "г"}, {name: "Масло растительное", amount: 5, unit: "мл (½ ч.л.)"}],
        instructions: "Нарезать овощи, заправить маслом. Можно салатом или нарезкой." },
    6: { id: 6, name: "Фрукт", portions_base: 1, calories_per_portion: 60, protein: 0, fat: 0, carbs: 15,
        ingredients: [{name: "Яблоко/груша/апельсин/киви 2шт/ягоды 100г/банан", amount: 100, unit: "г"}],
        instructions: "Съесть фрукт." },
    7: { id: 7, name: "Ужин: Салат с моцареллой", portions_base: 1, calories_per_portion: 224, protein: 10, fat: 18, carbs: 8,
        ingredients: [{name: "Овощи и зелень", amount: 200, unit: "г"}, {name: "Масло", amount: 10, unit: "мл (1 ч.л.)"}, {name: "Моцарелла", amount: 20, unit: "г"}, {name: "Авокадо", amount: 40, unit: "г", optional: true}],
        instructions: "Нарезать овощи, добавить масло, моцареллу. Авокадо можно не добавлять, тогда +1 ч.л. масла." }
};

const Icons = {
    Breakfast: () => <span class="text-amber-500">🥣</span>,
    Lunch: () => <span class="text-green-500">🥗</span>,
    Dinner: () => <span class="text-blue-500">🍽️</span>,
    Snack: () => <span class="text-purple-500">🍿</span>,
    Settings: () => <span class="text-gray-400">⚙️</span>,
    Shopping: () => <span class="text-gray-400">🛒</span>,
    ArrowLeft: () => <span>←</span>,
    ArrowRight: () => <span>→</span>
};

const useApi = () => {
    const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || '');
    
    const saveUrl = (url) => {
        localStorage.setItem('apiUrl', url);
        setApiUrl(url);
    };
    
    const fetch = async (endpoint, options = {}) => {
        if (!apiUrl) throw new Error('API URL не настроен');
        const response = await fetch(apiUrl + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    };
    
    return { apiUrl, setApiUrl: saveUrl, fetch };
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
            days.push({
                date: dateStr,
                day: d,
                isToday: dateStr === today,
                meals: meals[dateStr] || {}
            });
        }
        
        return { days, month: firstDay.toLocaleString('ru', { month: 'long', year: 'numeric' }) };
    }, [currentDate, meals]);
    
    return (
        <div class="pb-20">
            <div class="px-6 py-4 flex items-center justify-between">
                <h1 class="text-xl font-light text-text">{calendarData.month}</h1>
            </div>
            
            <div class="grid grid-cols-7 px-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} class="text-center text-xs text-muted py-2 font-medium">{day}</div>
                ))}
            </div>
            
            <div class="grid grid-cols-7 gap-1 px-2">
                {calendarData.days.map((day, idx) => (
                    <div 
                        key={idx}
                        className={"aspect-square flex flex-col items-center justify-center relative rounded-full transition-all duration-200 " + (day ? 'cursor-pointer hover:bg-primary/50 ' : '') + (day?.isToday ? 'bg-accent text-white ' : '') + (day && !day.isToday ? 'text-text ' : '')}
                        onClick={() => day && onDayClick(day)}
                    >
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
        { key: 'завтрак', name: '🥣 Завтрак (≈270 ккал)', empty: 'Нет завтрака' },
        { key: 'перекус', name: '🍿 Перекус (≈230 ккал)', empty: 'Нет перекуса' },
        { key: 'обед', name: '🥗 Обед (≈520 ккал)', empty: 'Нет обеда' },
        { key: 'ужин', name: '🍽️ Ужин (≈220 ккал)', empty: 'Нет ужина' }
    ];
    
    const dateObj = date ? new Date(date + 'T00:00:00') : null;
    const dateStr = dateObj?.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
        <div class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/20" onClick={onClose}></div>
            <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden">
                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>
                <div class="px-6 py-3 border-b border-gray-100">
                    <h2 class="text-lg font-medium text-text capitalize">{dateStr}</h2>
                </div>
                <div class="overflow-y-auto max-h-[calc(80vh-80px)] pb-20">
                    {mealTypes.map(({ key, name, empty }) => (
                        <div key={key} class="px-6 py-3 border-b border-gray-50">
                            <h3 class="text-xs text-muted uppercase tracking-wider mb-2">{name}</h3>
                            {meals[key]?.length > 0 ? (
                                <div class="space-y-2">
                                    {meals[key].map((meal, idx) => (
                                        <div 
                                            key={idx}
                                            class="p-3 bg-primary/30 rounded-xl cursor-pointer active:bg-primary/50 transition"
                                            onClick={() => onMealClick(meal)}
                                        >
                                            <span class="font-medium text-text">{meal.recipe_name}</span>
                                            <div class="flex items-center gap-2 mt-1">
                                                <span class="text-xs text-muted">🔥 {meal.calories} ккал</span>
                                                {meal.portions_multiplier > 1 && (
                                                    <span class="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">×{meal.portions_multiplier}</span>
                                                )}
                                                {meal.note && (
                                                    <span class="text-xs text-amber-600">📝 {meal.note}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p class="text-sm text-muted/70 italic">{empty}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RecipeCard = ({ recipe, onClose }) => {
    if (!recipe) return null;
    
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/30" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[70vh] overflow-y-auto">
                <h2 class="text-xl font-medium mb-2">{recipe.name}</h2>
                <div class="flex gap-4 text-sm text-muted mb-4">
                    <span>🔥 {recipe.calories_per_portion || recipe.calories} ккал</span>
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
                        <input 
                            type="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://твой-сервер.ru"
                            class="w-full px-4 py-3 bg-primary/30 rounded-xl"
                        />
                        <p class="text-xs text-muted mt-2">URL бэкенда для загрузки PDF</p>
                    </div>
                    
                    <button onClick={() => onSave(url)} class="w-full py-3 bg-accent text-white rounded-xl">Сохранить</button>
                    
                    <hr class="border-gray-200 my-4" />
                    
                    <div>
                        <label class="block text-sm text-muted mb-2">📄 Загрузить PDF меню</label>
                        <input type="file" accept=".pdf" id="pdf-upload" class="hidden"
                            onChange={(e) => {
                                if (e.target.files[0]) {
                                    alert('Загрузка PDF на бэкенд... (функция в разработке)');
                                }
                            }}
                        />
                        <label htmlFor="pdf-upload" class="block w-full py-3 bg-primary/50 text-text text-center rounded-xl cursor-pointer">
                            📄 Выбрать файл
                        </label>
                    </div>
                    
                    <hr class="border-gray-200 my-4" />
                    
                    <div>
                        <button onClick={onLoadDemo} class="w-full py-3 bg-green-500 text-white rounded-xl">
                            🎮 Попробовать демо-меню
                        </button>
                        <p class="text-xs text-muted mt-2 text-center">Загрузить пример меню на 1250 ккал</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShoppingList = ({ meals, recipes, onBack }) => {
    const [checked, setChecked] = useState({});
    
    const shoppingList = useMemo(() => {
        const items = {};
        Object.values(meals).flatMap(day => Object.values(day)).flat().forEach(meal => {
            const recipe = recipes[meal.recipe_id];
            if (!recipe?.ingredients) return;
            recipe.ingredients.forEach(ing => {
                const key = ing.name;
                if (!items[key]) items[key] = { amount: 0, unit: ing.unit };
                items[key].amount += (ing.amount || 0) * (meal.portions_multiplier || 1);
            });
        });
        return Object.entries(items).map(([name, data]) => ({
            name,
            amount: Math.round(data.amount * 100) / 100,
            unit: data.unit
        }));
    }, [meals, recipes]);
    
    const toggle = (idx) => {
        setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
    };
    
    return (
        <div class="fixed inset-0 bg-surface z-50 p-6">
            <div class="max-w-md mx-auto">
                <div class="flex items-center mb-6">
                    <button onClick={onBack} class="p-2 -ml-2"><span>←</span></button>
                    <h1 class="text-xl font-medium ml-2">🛒 Список покупок</h1>
                </div>
                
                {shoppingList.length > 0 ? (
                    <div class="space-y-2">
                        {shoppingList.map((item, idx) => (
                            <label 
                                key={idx}
                                className={"flex items-center gap-3 p-3 rounded-xl cursor-pointer transition " + (checked[idx] ? 'bg-green-50 line-through text-muted' : 'bg-primary/30')}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={checked[idx] || false}
                                    onChange={() => toggle(idx)}
                                    class="w-5 h-5 rounded border-gray-300"
                                />
                                <span class="flex-1">{item.name}</span>
                                <span class="text-sm text-muted">{item.amount} {item.unit}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p class="text-muted text-center py-8">Нет блюд в календаре.<br/>Добавь меню чтобы увидеть список.</p>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [view, setView] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [recipes, setRecipes] = useState({});
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const { apiUrl, setApiUrl } = useApi();
    
    const loadDemo = () => {
        setMeals(DEMO_MENU);
        setRecipes(DEMO_RECIPES);
        setView('calendar');
        alert('Демо-меню загружено! Нажми на дни чтобы увидеть блюда.');
    };
    
    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };
    
    const handleDayClick = (day) => {
        setSelectedDate(day.date);
    };
    
    const handleMealClick = (meal) => {
        setSelectedRecipe(recipes[meal.recipe_id] || { ...meal, ingredients: [], instructions: 'Детали рецепта...' });
    };
    
    const closeDrawer = () => {
        setSelectedDate(null);
        setSelectedRecipe(null);
    };
    
    return (
        <div class="min-h-screen bg-surface">
            {view === 'calendar' && (
                <>
                    <Calendar currentDate={currentDate} meals={meals} onDayClick={handleDayClick} />
                    
                    <div class="fixed bottom-6 left-6 right-6 flex justify-between items-center">
                        <button onClick={() => changeMonth(-1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95">
                            <span>←</span>
                        </button>
                        <button onClick={() => changeMonth(1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95">
                            <span>→</span>
                        </button>
                    </div>
                    
                    <div class="fixed bottom-24 left-6 right-6 flex justify-between px-4">
                        <button onClick={() => setView('shopping')} class="p-3 bg-surface shadow rounded-full active:scale-95">
                            <span class="text-gray-400">🛒</span>
                        </button>
                        <button onClick={() => setView('settings')} class="p-3 bg-surface shadow rounded-full active:scale-95">
                            <span class="text-gray-400">⚙️</span>
                        </button>
                    </div>
                    
                    {selectedDate && (
                        <DayDrawer 
                            date={selectedDate}
                            meals={meals[selectedDate] || {}}
                            onClose={closeDrawer}
                            onMealClick={handleMealClick}
                        />
                    )}
                    
                    {selectedRecipe && (
                        <RecipeCard recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
                    )}
                </>
            )}
            
            {view === 'settings' && (
                <Settings apiUrl={apiUrl} onSave={setApiUrl} onBack={() => setView('calendar')} onLoadDemo={loadDemo} />
            )}
            
            {view === 'shopping' && (
                <ShoppingList meals={meals} recipes={recipes} onBack={() => setView('calendar')} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
