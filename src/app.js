// 🍽️ Meal Prep App - Main Application

const { useState, useEffect, useMemo } = React;

// Icons
const Icons = {
    Breakfast: () => <span class="text-amber-500">🥣</span>,
    Lunch: () => <span class="text-green-500">🥗</span>,
    Dinner: () => <span class="text-blue-500">🍽️</span>,
    Snack: () => <span class="text-purple-500">🍿</span>,
    Settings: () => <span class="text-gray-400">⚙️</span>,
    Shopping: () => <span class="text-gray-400">🛒</span>,
    ArrowLeft: () => <span>←</span>,
    ArrowRight: () => <span>→</span>,
    Plus: () => <span>+</span>,
    Check: () => <span>✓</span>
};

// API Configuration
const useApi = () => {
    const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || '');
    
    const saveUrl = (url) => {
        localStorage.setItem('apiUrl', url);
        setApiUrl(url);
    };
    
    const fetch = async (endpoint, options = {}) => {
        if (!apiUrl) throw new Error('API URL not настроен');
        const response = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };
    
    return { apiUrl, setApiUrl: saveUrl, fetch };
};

// Calendar Component
const Calendar = ({ currentDate, meals, onDayClick }) => {
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date().toISOString().split('T')[0];
        
        // День недели первого дня (0 = Вс, 6 = Сб)
        // Преобразуем: Пн = 0
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek < 0) firstDayOfWeek = 6;
        
        const days = [];
        
        // Пустые ячейки до первого дня
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        
        // Дни месяца
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({
                date: dateStr,
                day: d,
                isToday: dateStr === today,
                meals: meals[dateStr] || []
            });
        }
        
        return { days, month: firstDay.toLocaleString('ru', { month: 'long', year: 'numeric' }) };
    }, [currentDate, meals]);
    
    return (
        <div class="pb-20">
            {/* Header */}
            <div class="px-6 py-4 flex items-center justify-between">
                <h1 class="text-xl font-light text-text">{calendarData.month}</h1>
            </div>
            
            {/* Week Days Header */}
            <div class="grid grid-cols-7 px-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} class="text-center text-xs text-muted py-2 font-medium">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar Grid */}
            <div class="grid grid-cols-7 gap-1 px-2">
                {calendarData.days.map((day, idx) => (
                    <div 
                        key={idx}
                        class={`
                            aspect-square flex flex-col items-center justify-center
                            relative rounded-full transition-all duration-200
                            ${day ? 'cursor-pointer hover:bg-primary/50' : ''}
                            ${day?.isToday ? 'bg-accent text-white' : ''}
                            ${day && !day.isToday ? 'text-text' : ''}
                        `}
                        onClick={() => day && onDayClick(day)}
                    >
                        {day && (
                            <>
                                <span class="text-sm font-medium">{day.day}</span>
                                {/* Meal Indicators */}
                                <div class="flex gap-0.5 mt-0.5">
                                    {day.meals?.breakfast?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                                    {day.meals?.lunch?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                                    {day.meals?.dinner?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                    {day.meals?.snack?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Day Drawer
const DayDrawer = ({ date, meals, onClose, onMealClick }) => {
    const mealTypes = [
        { key: 'breakfast', name: '🥣 Завтрак', empty: 'Нет завтрака' },
        { key: 'lunch', name: '🥗 Обед', empty: 'Нет обеда' },
        { key: 'dinner', name: '🍽️ Ужин', empty: 'Нет ужина' },
        { key: 'snack', name: '🍿 Перекус', empty: 'Нет перекуса' }
    ];
    
    const dateObj = date ? new Date(date + 'T00:00:00') : null;
    const dateStr = dateObj?.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
        <div class="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
                class="absolute inset-0 bg-black/20 transition-opacity"
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden drawer-enter-active">
                {/* Handle */}
                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
                
                {/* Header */}
                <div class="px-6 py-3 border-b border-gray-100">
                    <h2 class="text-lg font-medium text-text capitalize">{dateStr}</h2>
                </div>
                
                {/* Meals */}
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
                                            <span class="font-medium text-text">{meal.recipe_name || meal.name}</span>
                                            {meal.portions_multiplier > 1 && (
                                                <span class="text-xs text-muted ml-2">
                                                    ×{meal.portions_multiplier}
                                                </span>
                                            )}
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

// Settings Page
const Settings = ({ apiUrl, onSave, onBack }) => {
    const [url, setUrl] = useState(apiUrl);
    
    return (
        <div class="fixed inset-0 bg-surface z-50 p-6">
            <div class="max-w-md mx-auto">
                <div class="flex items-center mb-6">
                    <button onClick={onBack} class="p-2 -ml-2">
                        <Icons.ArrowLeft />
                    </button>
                    <h1 class="text-xl font-medium ml-2">Настройки</h1>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-muted mb-2">API URL</label>
                        <input 
                            type="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://meal-prep.твойдомен.ru"
                            class="w-full px-4 py-3 bg-primary/30 rounded-xl border-none focus:ring-2 focus:ring-accent/50"
                        />
                        <p class="text-xs text-muted mt-2">
                            Введи URL Cloudflare Tunnel Raspberry Pi
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => onSave(url)}
                        class="w-full py-3 bg-accent text-white rounded-xl font-medium active:bg-accent/80"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

// Shopping List
const ShoppingList = ({ apiUrl, onBack }) => {
    const [items, setItems] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const { fetch } = useApi();
    
    const generateList = async () => {
        if (!dateRange.start || !dateRange.end || !apiUrl) return;
        setLoading(true);
        try {
            const result = await fetch(`/shopping-list?start_date=${dateRange.start}&end_date=${dateRange.end}`);
            const itemsList = result.items || {};
            setItems(Object.entries(itemsList).map(([name, data]) => ({
                name,
                amount: data.amount,
                unit: data.unit,
                checked: false
            })));
        } catch (e) {
            console.error('Error:', e);
        }
        setLoading(false);
    };
    
    const toggleItem = (idx) => {
        setItems(prev => prev.map((item, i) => 
            i === idx ? { ...item, checked: !item.checked } : item
        ));
    };
    
    return (
        <div class="fixed inset-0 bg-surface z-50 p-6">
            <div class="max-w-md mx-auto">
                <div class="flex items-center mb-6">
                    <button onClick={onBack} class="p-2 -ml-2">
                        <Icons.ArrowLeft />
                    </button>
                    <h1 class="text-xl font-medium ml-2">🛒 Список покупок</h1>
                </div>
                
                {/* Date Range */}
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label class="block text-xs text-muted mb-1">С</label>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            class="w-full px-3 py-2 bg-primary/30 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-xs text-muted mb-1">По</label>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            class="w-full px-3 py-2 bg-primary/30 rounded-lg"
                        />
                    </div>
                </div>
                
                <button 
                    onClick={generateList}
                    disabled={loading}
                    class="w-full py-3 bg-accent text-white rounded-xl font-medium active:bg-accent/80 disabled:opacity-50 mb-4"
                >
                    {loading ? 'Загрузка...' : 'Сформировать'}
                </button>
                
                {/* List */}
                {items.length > 0 && (
                    <div class="space-y-2">
                        {items.map((item, idx) => (
                            <label 
                                key={idx}
                                class={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                                    item.checked ? 'bg-green-50 line-through text-muted' : 'bg-primary/30'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={item.checked}
                                    onChange={() => toggleItem(idx)}
                                    class="w-5 h-5 rounded border-gray-300"
                                />
                                <span class="flex-1">{item.name}</span>
                                <span class="text-sm text-muted">{item.amount} {item.unit}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [view, setView] = useState('calendar'); // calendar, settings, shopping
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [mealData, setMealData] = useState(null);
    const { apiUrl, setApiUrl, fetch } = useApi();
    
    // Load meals for month
    const loadMeals = async () => {
        if (!apiUrl) return;
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const end = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
            
            const data = await fetch(`/calendar?start_date=${start}&end_date=${end}`);
            setMeals(data);
        } catch (e) {
            console.error('Error loading meals:', e);
        }
    };
    
    useEffect(() => {
        loadMeals();
    }, [apiUrl, currentDate]);
    
    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };
    
    const handleDayClick = (day) => {
        setSelectedDate(day.date);
        // Load detailed meal data for drawer
    };
    
    const handleMealClick = async (meal) => {
        if (!apiUrl) return;
        try {
            const data = await fetch(`/recipes/${meal.recipe_id}`);
            setMealData(data);
        } catch (e) {
            console.error('Error:', e);
        }
    };
    
    const closeDrawer = () => {
        setSelectedDate(null);
        setMealData(null);
    };
    
    return (
        <div class="min-h-screen bg-surface">
            {/* Calendar View */}
            {view === 'calendar' && (
                <>
                    <Calendar 
                        currentDate={currentDate}
                        meals={meals}
                        onDayClick={handleDayClick}
                    />
                    
                    {/* Month Navigation */}
                    <div class="fixed bottom-6 left-6 right-6 flex justify-between items-center">
                        <button 
                            onClick={() => changeMonth(-1)}
                            class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95"
                        >
                            <Icons.ArrowLeft />
                        </button>
                        <button 
                            onClick={() => changeMonth(1)}
                            class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center text-text active:scale-95"
                        >
                            <Icons.ArrowRight />
                        </button>
                    </div>
                    
                    {/* Bottom Actions */}
                    <div class="fixed bottom-24 left-6 right-6 flex justify-between px-4">
                        <button 
                            onClick={() => setView('shopping')}
                            class="p-3 bg-surface shadow rounded-full active:scale-95"
                        >
                            <Icons.Shopping />
                        </button>
                        <button 
                            onClick={() => setView('settings')}
                            class="p-3 bg-surface shadow rounded-full active:scale-95"
                        >
                            <Icons.Settings />
                        </button>
                    </div>
                    
                    {/* Drawer */}
                    {selectedDate && (
                        <DayDrawer 
                            date={selectedDate}
                            meals={meals[selectedDate] || {}}
                            onClose={closeDrawer}
                            onMealClick={handleMealClick}
                        />
                    )}
                    
                    {/* Meal Detail Modal (simplified) */}
                    {mealData && (
                        <div class="fixed inset-0 z-50 flex items-end justify-center">
                            <div class="absolute inset-0 bg-black/30" onClick={() => setMealData(null)} />
                            <div class="relative bg-surface rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[70vh] overflow-y-auto">
                                <h2 class="text-xl font-medium mb-4">{mealData.name}</h2>
                                {mealData.ingredients?.map((ing, i) => (
                                    <div key={i} class="flex justify-between py-2 border-b border-gray-100">
                                        <span>{ing.name}</span>
                                        <span class="text-muted">{ing.amount} {ing.unit}</span>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setMealData(null)}
                                    class="w-full mt-4 py-3 bg-primary text-text rounded-xl"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            
            {/* Settings */}
            {view === 'settings' && (
                <Settings 
                    apiUrl={apiUrl}
                    onSave={setApiUrl}
                    onBack={() => setView('calendar')}
                />
            )}
            
            {/* Shopping List */}
            {view === 'shopping' && (
                <ShoppingList 
                    apiUrl={apiUrl}
                    onBack={() => setView('calendar')}
                />
            )}
        </div>
    );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
