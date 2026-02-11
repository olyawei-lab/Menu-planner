// 🍽️ Meal Prep App - Telegram WebApp Integration
// Работает с ботом через Telegram.WebApp API (без прямых API запросов!)

const { useState, useEffect, useMemo, useCallback } = React;

// ============== КОНФИГУРАЦИЯ ==============
const DEFAULT_MENU_URL = "https://olyawei-lab.github.io/Menu-planner/";

// ============== TELEGRAM WEBAPP UTILS ==============
const TelegramWebApp = {
    isAvailable: () => {
        return typeof window !== 'undefined' && 
               window.Telegram && 
               window.Telegram.WebApp !== undefined;
    },
    
    init: () => {
        if (TelegramWebApp.isAvailable()) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            console.log('📱 Telegram WebApp initialized');
        }
    },
    
    sendData: (data) => {
        if (TelegramWebApp.isAvailable()) {
            window.Telegram.WebApp.sendData(JSON.stringify(data));
            console.log('📤 Sent data to bot:', data);
        } else {
            console.warn('Telegram WebApp not available');
        }
    },
    
    onEvent: (eventType, callback) => {
        if (TelegramWebApp.isAvailable()) {
            window.Telegram.WebApp.onEvent(eventType, callback);
        }
    },
    
    getUserData: () => {
        if (TelegramWebApp.isAvailable()) {
            return window.Telegram.WebApp.initDataUnsafe?.user || null;
        }
        return null;
    },
    
    close: () => {
        if (TelegramWebApp.isAvailable()) {
            window.Telegram.WebApp.close();
        }
    }
};

// ============== DEMO DATA ==============
const DEMO_RECIPES = {
    "омлет": { name: "Омлет из 1 яйца", calories_per_portion: 270, protein: 20, fat: 20, carbs: 5 },
    "яйцо-вареное": { name: "Вареное яйцо", calories_per_portion: 70, protein: 6, fat: 5, carbs: 0.5 },
    "творог-сухофрукты": { name: "Творог с сухофруктами", calories_per_portion: 233, protein: 20, fat: 5, carbs: 25 },
    "крупа": { name: "Крупа на выбор", calories_per_portion: 200, protein: 7, fat: 2, carbs: 40 },
    "курица": { name: "Курица без кожи", calories_per_portion: 165, protein: 31, fat: 4, carbs: 0 },
    "салат-овощной": { name: "Салат овощной", calories_per_portion: 80, protein: 2, fat: 5, carbs: 8 },
    "фрукт": { name: "Фрукт", calories_per_portion: 60, protein: 0, fat: 0, carbs: 15 },
    "рыба": { name: "Рыба", calories_per_portion: 180, protein: 25, fat: 10, carbs: 0 },
    "хлеб-сыр": { name: "Хлеб + сыр", calories_per_portion: 200, protein: 12, fat: 10, carbs: 20 },
    "салат-моцарелла": { name: "Салат с моцареллой", calories_per_portion: 224, protein: 10, fat: 18, carbs: 8 },
};

const DEMO_MENU = {
    "2026-02-09": {
        "завтрак": [
            {id: 1, recipe_key: "омлет", portions_multiplier: 1, calories: 270, text: "Омлет из 1 яйца"},
            {id: 2, recipe_key: "хлеб-сыр", portions_multiplier: 1, calories: 200, text: "Хлеб + сыр"}
        ],
        "перекус": [
            {id: 3, recipe_key: "творог-сухофрукты", portions_multiplier: 1, calories: 233, text: "Творог с сухофруктами"}
        ],
        "обед": [
            {id: 4, recipe_key: "крупа", portions_multiplier: 1, calories: 200, text: "Крупа"},
            {id: 5, recipe_key: "курица", portions_multiplier: 1, calories: 165, text: "Курица"},
            {id: 6, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 80, text: "Салат"},
            {id: 7, recipe_key: "фрукт", portions_multiplier: 1, calories: 60, text: "Фрукт"}
        ],
        "ужин": [
            {id: 8, recipe_key: "салат-моцарелла", portions_multiplier: 1, calories: 224, text: "Салат с моцареллой"}
        ]
    },
    "2026-02-10": {
        "завтрак": [
            {id: 9, recipe_key: "хлеб-сыр", portions_multiplier: 1, calories: 200, text: "Хлеб + сыр"},
            {id: 10, recipe_key: "яйцо-вареное", portions_multiplier: 1, calories: 70, text: "Яйцо"}
        ],
        "перекус": [
            {id: 11, recipe_key: "творог-сухофрукты", portions_multiplier: 1, calories: 233, text: "Творог"}
        ],
        "обед": [
            {id: 12, recipe_key: "крупа", portions_multiplier: 1, calories: 200, text: "Крупа"},
            {id: 13, recipe_key: "курица", portions_multiplier: 1, calories: 165, text: "Курица"},
            {id: 14, recipe_key: "салат-овощной", portions_multiplier: 1, calories: 80, text: "Салат"},
            {id: 15, recipe_key: "фрукт", portions_multiplier: 1, calories: 60, text: "Фрукт"}
        ],
        "ужин": [
            {id: 16, recipe_key: "рыба", portions_multiplier: 1, calories: 180, text: "Рыба"}
        ]
    }
};

// ============== HOOKS ==============
const useTelegramSync = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, sending, success, error
    const [remoteData, setRemoteData] = useState(null);
    
    // Отправить данные на сервер (боту)
    const sendToBot = useCallback((data) => {
        setSyncStatus('sending');
        try {
            TelegramWebApp.sendData({
                type: data.type || 'update_plan',
                ...data
            });
            setSyncStatus('success');
        } catch (error) {
            console.error('Send error:', error);
            setSyncStatus('error');
        }
    }, []);
    
    // Запросить синхронизацию
    const requestSync = useCallback(() => {
        setSyncStatus('sending');
        TelegramWebApp.sendData({
            type: 'sync_request',
            timestamp: new Date().toISOString()
        });
    }, []);
    
    return {
        isLoading,
        setIsLoading,
        syncStatus,
        setSyncStatus,
        remoteData,
        setRemoteData,
        sendToBot,
        requestSync
    };
};

// ============== API HOOK (С ИНТЕГРАЦИЕЙ TELEGRAM) ==============
const useApi = () => {
    const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || '');
    
    const saveUrl = (url) => {
        localStorage.setItem('apiUrl', url);
        setApiUrl(url);
    };
    
    // Если есть Telegram WebApp — используем его
    if (TelegramWebApp.isAvailable()) {
        return {
            apiUrl: 'telegram',
            setApiUrl,
            fetch: async (endpoint, options = {}) => {
                // Через Telegram WebApp данные идут через sendData
                throw new Error('Используйте sendToBot для отправки данных');
            },
            isTelegram: true
        };
    }
    
    // Иначе используем прямой API
    return {
        apiUrl,
        setApiUrl: saveUrl,
        fetch: async (endpoint, options = {}) => {
            if (!apiUrl) throw new Error('API URL не настроен');
            const response = await fetch(apiUrl + endpoint, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        },
        isTelegram: false
    };
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
                <span class="text-xs text-muted bg-primary/50 px-2 py-1 rounded">📱 Telegram</span>
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

// День в календаре
const DayDrawer = ({ date, meals, onClose, onMealClick, onUpdatePortion, onRemoveDish }) => {
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
                                                        <button 
                                                            onClick={() => onUpdatePortion(meal, -0.5)}
                                                            class="w-7 h-7 bg-red-100 text-red-600 rounded-full text-sm"
                                                        >−</button>
                                                        <button 
                                                            onClick={() => onUpdatePortion(meal, 0.5)}
                                                            class="w-7 h-7 bg-green-100 text-green-600 rounded-full text-sm"
                                                        >+</button>
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

// Карточка рецепта
const RecipeCard = ({ recipe, meal, onClose }) => {
    if (!recipe) return null;
    
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/30" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[70vh] overflow-y-auto">
                <h2 class="text-xl font-medium mb-2">{recipe.name}</h2>
                <div class="flex gap-4 text-sm text-muted mb-4">
                    <span>🔥 {meal?.calories || recipe.calories_per_portion} ккал</span>
                    <span>💪 {recipe.protein} бел</span>
                    <span>🥑 {recipe.fat} жир</span>
                    <span>🍚 {recipe.carbs} угл</span>
                </div>
                <button onClick={onClose} class="w-full mt-4 py-3 bg-primary text-text rounded-xl">Закрыть</button>
            </div>
        </div>
    );
};

// Настройки
const Settings = ({ apiUrl, onSave, onBack, onLoadDemo, onSync, syncStatus }) => {
    const [url, setUrl] = useState(apiUrl);
    
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
                                <p class="text-xs text-muted">
                                    {TelegramWebApp.isAvailable() ? '✅ Подключён' : '🔒 Офлайн режим'}
                                </p>
                            </div>
                        </div>
                        {TelegramWebApp.isAvailable() && (
                            <button 
                                onClick={onSync}
                                disabled={syncStatus === 'sending'}
                                class="w-full mt-3 py-2 bg-accent text-white rounded-xl text-sm"
                            >
                                {syncStatus === 'sending' ? '🔄 Синхронизация...' : '🔄 Синхронизировать с ботом'}
                            </button>
                        )}
                        {syncStatus === 'success' && <p class="text-xs text-green-600 mt-2">✅ Данные отправлены боту</p>}
                        {syncStatus === 'error' && <p class="text-xs text-red-600 mt-2">❌ Ошибка отправки</p>}
                    </div>
                    
                    <hr class="border-gray-200 my-4" />
                    
                    <button onClick={onLoadDemo} class="w-full py-3 bg-green-500 text-white rounded-xl">
                        🎮 Демо-меню (1250 ккал)
                    </button>
                    <p class="text-xs text-muted mt-2 text-center">Без подключения к боту</p>
                    
                    <hr class="border-gray-200 my-4" />
                    
                    <div>
                        <label class="block text-sm text-muted mb-2">📄 Загрузить PDF меню</label>
                        <input type="file" accept=".pdf" id="pdf-upload" class="hidden"
                            onChange={(e) => {
                                if (e.target.files[0]) {
                                    alert('📤 PDF отправляется боту на обработку...');
                                    TelegramWebApp.sendData({
                                        type: 'upload_pdf',
                                        filename: e.target.files[0].name
                                    });
                                }
                            }}
                        />
                        <label htmlFor="pdf-upload" class="block w-full py-3 bg-primary/50 text-text text-center rounded-xl cursor-pointer">
                            📄 Загрузить PDF
                        </label>
                    </div>
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
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const { isTelegram, setApiUrl } = useApi();
    const { syncStatus, setSyncStatus, sendToBot, requestSync } = useTelegramSync();
    
    // Инициализация Telegram WebApp
    useEffect(() => {
        TelegramWebApp.init();
        
        // Слушаем данные от бота
        TelegramWebApp.onEvent('viewportChanged', () => {
            console.log('Viewport changed');
        });
    }, []);
    
    // Загружаем демо-данные по умолчанию
    useEffect(() => {
        const saved = localStorage.getItem('meal_plan');
        if (saved) {
            try {
                setMeals(JSON.parse(saved));
            } catch(e) {
                setMeals(DEMO_MENU);
            }
        } else {
            setMeals(DEMO_MENU);
        }
    }, []);
    
    // Сохраняем в localStorage при изменении
    useEffect(() => {
        if (Object.keys(meals).length > 0) {
            localStorage.setItem('meal_plan', JSON.stringify(meals));
        }
    }, [meals]);
    
    // Обработчик изменения порций
    const handleUpdatePortion = (meal, delta) => {
        if (!selectedDate) return;
        
        setMeals(prev => {
            const updated = { ...prev };
            if (!updated[selectedDate]) updated[selectedDate] = {};
            
            const mealType = Object.keys(updated[selectedDate]).find(type => 
                updated[selectedDate][type]?.some(m => m.id === meal.id)
            );
            
            if (mealType) {
                updated[selectedDate][mealType] = updated[selectedDate][mealType].map(m => {
                    if (m.id === meal.id) {
                        const newPortions = Math.max(0.5, m.portions_multiplier + delta);
                        return { ...m, portions_multiplier: newPortions };
                    }
                    return m;
                });
            }
            
            return updated;
        });
    };
    
    // Отправка изменений боту
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
    
    // Получить рецепт по ключу
    const getRecipe = (key) => DEMO_RECIPES[key] || { name: key, protein: '-', fat: '-', carbs: '-' };
    
    return (
        <div class="min-h-screen bg-surface">
            {view === 'calendar' && (
                <>
                    <Calendar currentDate={currentDate} meals={meals} onDayClick={(day) => setSelectedDate(day.date)} />
                    
                    <div class="fixed bottom-6 left-6 right-6 flex justify-between items-center">
                        <button onClick={() => changeMonth(-1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95">
                            <span>←</span>
                        </button>
                        <button onClick={() => changeMonth(1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95">
                            <span>→</span>
                        </button>
                    </div>
                    
                    <div class="fixed bottom-24 left-6 right-6 flex justify-between px-4">
                        <button class="p-3 bg-surface shadow rounded-full" onClick={() => alert('🛒 Список покупок\n\nСоставьте план чтобы увидеть покупки!')}>
                            <span class="text-gray-400">🛒</span>
                        </button>
                        <button onClick={() => setView('settings')} class="p-3 bg-surface shadow rounded-full">
                            <span class="text-gray-400">⚙️</span>
                        </button>
                    </div>
                    
                    {selectedDate && (
                        <DayDrawer 
                            date={selectedDate}
                            meals={meals[selectedDate] || {}}
                            onClose={() => setSelectedDate(null)}
                            onMealClick={(meal) => setSelectedRecipe(getRecipe(meal.recipe_key))}
                            onUpdatePortion={handleUpdatePortion}
                        />
                    )}
                    
                    {selectedRecipe && (
                        <RecipeCard 
                            recipe={selectedRecipe} 
                            meal={selectedRecipe}
                            onClose={() => setSelectedRecipe(null)} 
                        />
                    )}
                </>
            )}
            
            {view === 'settings' && (
                <Settings 
                    apiUrl="" 
                    onSave={setApiUrl} 
                    onBack={() => setView('calendar')} 
                    onLoadDemo={loadDemo}
                    onSync={handleSync}
                    syncStatus={syncStatus}
                />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
