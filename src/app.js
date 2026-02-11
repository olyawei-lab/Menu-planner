// 🍽️ Meal Prep App - Full Recipe Modal with Portion Calculator
const { useState, useEffect, useMemo, useCallback } = React;

// Telegram WebApp
const TelegramWebApp = {
    isAvailable: () => typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp !== undefined,
    init: () => { if (TelegramWebApp.isAvailable()) { window.Telegram.WebApp.ready(); window.Telegram.WebApp.expand(); } },
    sendData: (data) => { if (TelegramWebApp.isAvailable()) { window.Telegram.WebApp.sendData(JSON.stringify(data)); } },
    initTelegram: () => TelegramWebApp.initTelegram ? TelegramWebApp.initTelegram : null
};

// ============== ДАННЫЕ ==============
const DEMO_RECIPES = {
    "1": { id: 1, name: "Омлет из 1 яйца", calories: 270, protein: 20, fat: 20, carbs: 5, 
           ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}, {name: "Молоко", amount: 50, unit: "мл", optional: true}],
           instructions: "1. Взбить яйцо с молоком.\n2. Вылить на разогретую сковороду.\n3. Жарить на медленном огне до готовности." },
    "2": { id: 2, name: "Цельнозерновой хлеб + сыр", calories: 200, protein: 12, fat: 10, carbs: 20,
           ingredients: [{name: "Цельнозерновой хлеб", amount: 50, unit: "г"}, {name: "Сыр твёрдый 35-50%", amount: 30, unit: "г"}],
           instructions: "1. Взять хлеб.\n2. Нарезать сыр ломтиками.\n3. Положить сыр на хлеб." },
    "3": { id: 3, name: "Творог с сухофруктами", calories: 233, protein: 20, fat: 5, carbs: 25,
           ingredients: [{name: "Творог 4-5%", amount: 140, unit: "г"}, {name: "Сухофрукты", amount: 25, unit: "г"}],
           instructions: "1. Смешать творог с сухофруктами.\n2. Дать настояться 10 минут." },
    "4": { id: 4, name: "Крупа на выбор", calories: 200, protein: 7, fat: 2, carbs: 40,
           ingredients: [{name: "Крупа (греча/булгур/полба/геркулес/рис/киноа)", amount: 65, unit: "г сух"}, {name: "Вода", amount: 300, unit: "мл"}],
           instructions: "1. Промыть крупу.\n2. Залить водой.\n3. Варить до готовности (15-20 минут)." },
    "5": { id: 5, name: "Курица без кожи", calories: 165, protein: 31, fat: 4, carbs: 0,
           ingredients: [{name: "Курица (бедро/голень без кожи)", amount: 100, unit: "г в готовом"}],
           instructions: "1. Промыть курицу.\n2. Нарезать на кусочки.\n3. Тушить на сковороде с водой, томатной пастой, луком и морковью 20-30 минут." },
    "6": { id: 6, name: "Салат овощной", calories: 80, protein: 2, fat: 5, carbs: 8,
           ingredients: [{name: "Овощи (зелё/огурцы/помидоры/перец/капуста/редис/лук)", amount: 200, unit: "г"}, {name: "Масло растительное", amount: 5, unit: "мл"}],
           instructions: "1. Помыть и нарезать овощи.\n2. Смешать в миске.\n3. Заправить маслом." },
    "7": { id: 7, name: "Яблоко", calories: 60, protein: 0, fat: 0, carbs: 15,
           ingredients: [{name: "Яблоко", amount: 100, unit: "г"}],
           instructions: "Помыть и съесть." },
    "8": { id: 8, name: "Салат с моцареллой", calories: 224, protein: 10, fat: 18, carbs: 8,
           ingredients: [{name: "Овощи и зелень", amount: 200, unit: "г"}, {name: "Масло", amount: 10, unit: "мл"}, {name: "Моцарелла", amount: 20, unit: "г"}, {name: "Авокадо", amount: 40, unit: "г", optional: true}],
           instructions: "1. Нарезать овощи и зелень.\n2. Добавить моцареллу.\n3. Полить маслом, добавить авокадо по желанию." },
    "9": { id: 9, name: "Вареное яйцо", calories: 70, protein: 6, fat: 5, carbs: 0.5,
           ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}],
           instructions: "1. Положить яйцо в холодную воду.\n2. Довести до кипения.\n3. Варить 10 минут." },
    "10": { id: 10, name: "Куриная грудка", calories: 130, protein: 30, fat: 2, carbs: 0,
            ingredients: [{name: "Куриная грудка", amount: 130, unit: "г"}],
            instructions: "1. Промыть грудку.\n2. Запечь в духовке при 180°С 25-30 минут или обжарить на сковороде." }
};

const DEMO_MENU = {
    "2026-02-09": {
        "завтрак": [
            {id: 1, recipe_id: "1", portions_multiplier: 1, calories: 270, text: "Омлет из 1 яйца"},
            {id: 2, recipe_id: "2", portions_multiplier: 1, calories: 200, text: "Хлеб + сыр"}
        ],
        "перекус": [
            {id: 3, recipe_id: "3", portions_multiplier: 1, calories: 233, text: "Творог с сухофруктами"}
        ],
        "обед": [
            {id: 4, recipe_id: "4", portions_multiplier: 1, calories: 200, text: "Крупа"},
            {id: 5, recipe_id: "5", portions_multiplier: 1, calories: 165, text: "Курица"},
            {id: 6, recipe_id: "6", portions_multiplier: 1, calories: 80, text: "Салат"},
            {id: 7, recipe_id: "7", portions_multiplier: 1, calories: 60, text: "Яблоко"}
        ],
        "ужин": [
            {id: 8, recipe_id: "8", portions_multiplier: 1, calories: 224, text: "Салат с моцареллой"}
        ]
    }
};

// ============== HOOKS ==============
const useTelegramSync = () => {
    const [syncStatus, setSyncStatus] = useState('idle');
    const [remoteRecipes, setRemoteRecipes] = useState(null);
    
    const sendToBot = useCallback((data) => {
        setSyncStatus('sending');
        try {
            TelegramWebApp.sendData({ type: data.type || 'update_plan', ...data });
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (e) {
            setSyncStatus('error');
        }
    }, []);
    
    // Загрузить рецепты с бэкенда
    const loadRecipes = useCallback(async () => {
        try {
            const response = await fetch('/tmp/mealprep_sync.json');
            if (response.ok) {
                const data = await response.json();
                if (data.recipes) {
                    setRemoteRecipes(data.recipes);
                    return data.recipes;
                }
            }
        } catch (e) {
            console.log('Бэкенд недоступен, используем демо');
        }
        return DEMO_RECIPES;
    }, []);
    
    return { syncStatus, setSyncStatus, sendToBot, loadRecipes, remoteRecipes, setRemoteRecipes };
};

// ============== КОМПОНЕНТЫ ==============

// Календарь
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
        <div class="pb-24">
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

// Модальное окно рецепта с калькулятором порций
const RecipeModal = ({ recipe, portions, onClose, onPortionChange }) => {
    if (!recipe) return null;
    
    // Пересчёт ингредиентов
    const scaledIngredients = recipe.ingredients?.map(ing => ({
        ...ing,
        scaledAmount: Math.round((ing.amount || 0) * portions * 100) / 100
    })) || [];
    
    // Общие КБЖУ
    const totalCalories = Math.round((recipe.calories || 0) * portions);
    const totalProtein = Math.round((recipe.protein || 0) * portions);
    const totalFat = Math.round((recipe.fat || 0) * portions);
    const totalCarbs = Math.round((recipe.carbs || 0) * portions);
    
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/40" onClick={onClose}></div>
            
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                {/* Заголовок */}
                <div class="px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <button onClick={onClose} class="absolute right-4 top-4 text-muted hover:text-text">✕</button>
                    <h2 class="text-xl font-medium pr-8">{recipe.name}</h2>
                    <p class="text-xs text-muted mt-1">📱 Нажми на ингредиент для деталей</p>
                </div>
                
                {/* КБЖУ */}
                <div class="px-6 py-3 bg-primary/30 flex-shrink-0">
                    <div class="flex justify-between text-center">
                        <div><div class="text-lg font-medium text-accent">{totalCalories}</div><div class="text-xs text-muted">ккал</div></div>
                        <div><div class="text-lg font-medium">{totalProtein}</div><div class="text-xs text-muted">бел</div></div>
                        <div><div class="text-lg font-medium">{totalFat}</div><div class="text-xs text-muted">жир</div></div>
                        <div><div class="text-lg font-medium">{totalCarbs}</div><div class="text-xs text-muted">угл</div></div>
                    </div>
                </div>
                
                {/* Порции */}
                <div class="px-6 py-3 border-b border-gray-100 flex-shrink-0">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-muted">Порции:</span>
                        <div class="flex items-center gap-3">
                            <button onClick={() => onPortionChange(Math.max(0.5, portions - 0.5))} 
                                    class="w-8 h-8 bg-red-100 text-red-600 rounded-full text-lg font-medium">−</button>
                            <span class="w-8 text-center font-medium">{portions}</span>
                            <button onClick={() => onPortionChange(portions + 0.5)} 
                                    class="w-8 h-8 bg-green-100 text-green-600 rounded-full text-lg font-medium">+</button>
                        </div>
                    </div>
                </div>
                
                {/* Ингредиенты */}
                <div class="flex-1 overflow-y-auto px-6 py-4">
                    <h3 class="text-sm font-medium mb-3">🥗 Ингредиенты</h3>
                    <div class="space-y-2">
                        {scaledIngredients.map((ing, idx) => (
                            <div key={idx} class="flex justify-between py-2 border-b border-gray-100">
                                <span class="flex-1">{ing.name}{ing.optional ? <span class="text-xs text-muted ml-1">(опц.)</span> : ''}</span>
                                <span class="text-muted whitespace-nowrap">{ing.scaledAmount} {ing.unit}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Инструкции */}
                    {recipe.instructions && (
                        <>
                            <h3 class="text-sm font-medium mt-6 mb-3">👨‍🍳 Инструкция</h3>
                            <div class="text-sm text-muted whitespace-pre-line bg-primary/20 p-4 rounded-xl">
                                {recipe.instructions}
                            </div>
                        </>
                    )}
                </div>
                
                {/* Кнопка закрытия */}
                <div class="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose} class="w-full py-3 bg-primary text-text rounded-xl">Закрыть</button>
                </div>
            </div>
        </div>
    );
};

// День в календаре
const DayDrawer = ({ date, meals, onClose, onMealClick, onUpdatePortion }) => {
    const mealTypes = [
        { key: 'завтрак', name: '🥣 Завтрак', color: 'amber' },
        { key: 'перекус', name: '🍿 Перекус', color: 'purple' },
        { key: 'обед', name: '🥗 Обед', color: 'green' },
        { key: 'ужин', name: '🍽️ Ужин', color: 'blue' }
    ];
    
    const dateObj = date ? new Date(date + 'T00:00:00') : null;
    const dateStr = dateObj?.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    const totalCalories = Object.values(meals).flat().reduce((sum, m) => sum + (m.calories || 0) * m.portions_multiplier, 0);
    
    return (
        <div class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/20" onClick={onClose}></div>
            <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden">
                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>
                <div class="px-6 py-3 border-b border-gray-100">
                    <h2 class="text-lg font-medium text-text capitalize">{dateStr}</h2>
                    <p class="text-sm text-muted">🔥 {Math.round(totalCalories)} ккал</p>
                </div>
                <div class="overflow-y-auto max-h-[calc(80vh-80px)] pb-20">
                    {mealTypes.map(({ key, name }) => {
                        const mealItems = meals[key] || [];
                        const typeCalories = mealItems.reduce((sum, m) => sum + (m.calories || 0) * m.portions_multiplier, 0);
                        
                        return (
                            <div key={key} class="px-6 py-3 border-b border-gray-50">
                                <h3 class="text-xs text-muted uppercase tracking-wider mb-2 flex justify-between">
                                    <span>{name}</span>
                                    <span class="text-accent">{Math.round(typeCalories)} ккал</span>
                                </h3>
                                {mealItems.length > 0 ? (
                                    <div class="space-y-2">
                                        {mealItems.map((meal, idx) => (
                                            <div key={idx} class="p-3 bg-primary/30 rounded-xl">
                                                <div class="flex justify-between items-start">
                                                    <div class="flex-1" onClick={() => onMealClick(meal)}>
                                                        <span class="font-medium text-text">{meal.text || meal.recipe_name}</span>
                                                        <div class="flex items-center gap-2 mt-1">
                                                            <span class="text-xs text-muted">🔥 {Math.round(meal.calories * meal.portions_multiplier)} ккал</span>
                                                            <span class="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">×{meal.portions_multiplier}</span>
                                                        </div>
                                                    </div>
                                                    <div class="flex gap-1 ml-2">
                                                        <button onClick={() => onUpdatePortion(meal, -0.5)} class="w-7 h-7 bg-red-100 text-red-600 rounded-full text-sm">−</button>
                                                        <button onClick={() => onUpdatePortion(meal, 0.5)} class="w-7 h-7 bg-green-100 text-green-600 rounded-full text-sm">+</button>
                                                    </div>
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

// Настройки
const Settings = ({ onBack, onSync, syncStatus, onLoadDemo }) => {
    const [url, setUrl] = useState('');
    
    return (
        <div class="fixed inset-0 bg-surface z-50 p-6">
            <div class="max-w-md mx-auto">
                <div class="flex items-center mb-6">
                    <button onClick={onBack} class="p-2 -ml-2"><span>←</span></button>
                    <h1 class="text-xl font-medium ml-2">Настройки</h1>
                </div>
                
                <div class="space-y-4">
                    {/* Telegram Status */}
                    <div class="p-4 bg-primary/30 rounded-xl">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">📱</span>
                            <div>
                                <p class="font-medium">Telegram WebApp</p>
                                <p class="text-xs text-muted">{TelegramWebApp.isAvailable() ? '✅ Подключён' : '🔒 Офлайн'}</p>
                            </div>
                        </div>
                        {TelegramWebApp.isAvailable() && (
                            <button onClick={onSync} disabled={syncStatus === 'sending'} class="w-full mt-3 py-2 bg-accent text-white rounded-xl text-sm">
                                {syncStatus === 'sending' ? '🔄 Синхронизация...' : '🔄 Синхронизировать'}
                            </button>
                        )}
                    </div>
                    
                    <hr class="border-gray-200 my-4" />
                    
                    <button onClick={onLoadDemo} class="w-full py-3 bg-green-500 text-white rounded-xl">
                        🎮 Демо-меню
                    </button>
                    <p class="text-xs text-muted mt-2 text-center">Работает без бота</p>
                </div>
            </div>
        </div>
    );
};

// ============== ГЛАВНОЕ ПРИЛОЖЕНИЕ ==============
const App = () => {
    const [view, setView] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [modalPortions, setModalPortions] = useState(1);
    const { syncStatus, setSyncStatus, sendToBot, loadRecipes, setRemoteRecipes } = useTelegramSync();
    
    // Загрузка при старте
    useEffect(() => {
        TelegramWebApp.init();
        
        const saved = localStorage.getItem('meal_plan');
        if (saved) {
            try { setMeals(JSON.parse(saved)); } 
            catch { setMeals(DEMO_MENU); }
        } else {
            setMeals(DEMO_MENU);
        }
        
        // Пробуем загрузить рецепты с бэкенда
        loadRecipes().then(recipes => {
            if (recipes !== DEMO_RECIPES) {
                setRemoteRecipes(recipes);
            }
        });
    }, []);
    
    // Сохранение в localStorage
    useEffect(() => {
        if (Object.keys(meals).length > 0) {
            localStorage.setItem('meal_plan', JSON.stringify(meals));
        }
    }, [meals]);
    
    // Открытие рецепта
    const handleMealClick = (meal) => {
        setSelectedMeal({ ...meal, portions: meal.portions_multiplier });
        setModalPortions(meal.portions_multiplier || 1);
    };
    
    // Изменение порции
    const handleUpdatePortion = (meal, delta) => {
        setMeals(prev => {
            const updated = { ...prev };
            if (!updated[selectedDate]) return prev;
            
            Object.keys(updated[selectedDate]).forEach(mealType => {
                updated[selectedDate][mealType] = updated[selectedDate][mealType].map(m => {
                    if (m.id === meal.id) {
                        const newPortions = Math.max(0.5, (m.portions_multiplier || 1) + delta);
                        return { ...m, portions_multiplier: newPortions };
                    }
                    return m;
                });
            });
            return updated;
        });
    };
    
    // Изменение порции в модалке
    const handleModalPortionChange = (newPortions) => {
        setModalPortions(newPortions);
        setSelectedMeal(prev => ({ ...prev, portions: newPortions }));
        
        // Обновляем в плане
        setMeals(prev => {
            const updated = { ...prev };
            if (!updated[selectedDate]) return prev;
            
            Object.keys(updated[selectedDate]).forEach(mealType => {
                updated[selectedDate][mealType] = updated[selectedDate][mealType].map(m => {
                    if (m.id === selectedMeal.id) {
                        return { ...m, portions_multiplier: newPortions };
                    }
                    return m;
                });
            });
            return updated;
        });
    };
    
    // Синхронизация с ботом
    const handleSync = () => {
        setSyncStatus('sending');
        sendToBot({
            type: 'update_plan',
            date: selectedDate || new Date().toISOString().split('T')[0],
            plan: meals,
            timestamp: new Date().toISOString()
        });
    };
    
    // Загрузка демо
    const loadDemo = () => {
        setMeals(DEMO_MENU);
        setView('calendar');
    };
    
    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };
    
    // Получить рецепт - ищем по recipe_id или по строке
    const getRecipe = (recipeId) => {
        // Сначала пробуем selectedMeal.recipe_id
        const id = recipeId || selectedMeal?.recipe_id || selectedMeal?.recipe_key;
        if (id && DEMO_RECIPES[id]) {
            return DEMO_RECIPES[id];
        }
        // Пробуем как строку
        if (id && DEMO_RECIPES[String(id)]) {
            return DEMO_RECIPES[String(id)];
        }
        return { name: 'Рецепт', ingredients: [], instructions: '' };
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
                        <button class="p-3 bg-surface shadow rounded-full" onClick={() => alert('🛒 Составьте план!')}>
                            <span class="text-gray-400">🛒</span>
                        </button>
                        <button onClick={() => setView('settings')} class="p-3 bg-surface shadow rounded-full">
                            <span class="text-gray-400">⚙️</span>
                        </button>
                    </div>
                    
                    {selectedDate && (
                        <DayDrawer date={selectedDate} meals={meals[selectedDate] || {}} onClose={() => setSelectedDate(null)} 
                                   onMealClick={handleMealClick} onUpdatePortion={handleUpdatePortion} />
                    )}
                    
                    {selectedMeal && (
                        <RecipeModal recipe={getRecipe(selectedMeal.recipe_id || selectedMeal.recipe_key)} 
                                    portions={modalPortions} 
                                    onClose={() => setSelectedMeal(null)}
                                    onPortionChange={handleModalPortionChange} />
                    )}
                </>
            )}
            
            {view === 'settings' && (
                <Settings onBack={() => setView('calendar')} onSync={handleSync} 
                         syncStatus={syncStatus} onLoadDemo={loadDemo} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
