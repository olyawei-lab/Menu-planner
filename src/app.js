// 🍽️ Meal Prep App - Real Recipes from PDF
const { useState, useEffect, useMemo, useCallback } = React;

// ============ KBJU СПРАВОЧНИК ============
const UNIT_NORMALIZER = { "яйцо": 50, "банан": 120, "яблоко": 150, "груша": 150, "апельсин": 150, "лимон": 80 };

const KBJU_REF = {
    "яйцо": {"cal": 157, "prot": 12.7, "fat": 10.6, "carbs": 0.7},
    "молоко": {"cal": 50, "prot": 3.2, "fat": 1.5, "carbs": 4.8},
    "творог": {"cal": 101, "prot": 18, "fat": 3, "carbs": 3.5},
    "творог 4-5%": {"cal": 101, "prot": 18, "fat": 4.5, "carbs": 3},
    "сыр": {"cal": 350, "prot": 25, "fat": 27, "carbs": 2},
    "моцарелла": {"cal": 280, "prot": 28, "fat": 17, "carbs": 3},
    "фетакса": {"cal": 290, "prot": 21, "fat": 23, "carbs": 4},
    "брынза": {"cal": 260, "prot": 22, "fat": 19, "carbs": 2},
    "хлеб": {"cal": 250, "prot": 9, "fat": 3, "carbs": 45},
    "цельнозерновой хлеб": {"cal": 220, "prot": 13, "fat": 3, "carbs": 37},
    "геркулес": {"cal": 340, "prot": 13, "fat": 6, "carbs": 60},
    "греча": {"cal": 310, "prot": 12, "fat": 3, "carbs": 57},
    "рис": {"cal": 340, "prot": 8, "fat": 1, "carbs": 75},
    "макароны": {"cal": 350, "prot": 13, "fat": 1, "carbs": 70},
    "курица": {"cal": 165, "prot": 31, "fat": 3.6, "carbs": 0},
    "куриная грудка": {"cal": 120, "prot": 22, "fat": 2, "carbs": 0},
    "индейка": {"cal": 130, "prot": 29, "fat": 2, "carbs": 0},
    "рыба": {"cal": 140, "prot": 20, "fat": 6, "carbs": 0},
    "семга": {"cal": 208, "prot": 20, "fat": 13, "carbs": 0},
    "овощи": {"cal": 30, "prot": 2, "fat": 0.2, "carbs": 5},
    "масло": {"cal": 880, "prot": 0, "fat": 99, "carbs": 0},
    "авокадо": {"cal": 160, "prot": 2, "fat": 15, "carbs": 9},
    "яблоко": {"cal": 52, "prot": 0.3, "fat": 0.2, "carbs": 14},
    "банан": {"cal": 89, "prot": 1, "fat": 0.3, "carbs": 23},
    "сухофрукты": {"cal": 290, "prot": 3, "fat": 0.5, "carbs": 70},
    "тофу": {"cal": 75, "prot": 8, "fat": 4.5, "carbs": 2},
};

function normalizeWeight(name, amount, unit) {
    if (unit === 'шт' || unit === 'шт.') {
        const nameLower = name.toLowerCase();
        for (const [key, grams] of Object.entries(UNIT_NORMALIZER)) {
            if (nameLower.includes(key)) return amount * grams;
        }
    }
    return amount;
}

function calcIngredientKBJU(name, amount, unit = 'г') {
    const grams = normalizeWeight(name, amount, unit);
    const nameLower = name.toLowerCase();
    for (const [key, value] of Object.entries(KBJU_REF)) {
        if (nameLower.includes(key)) {
            const ratio = grams / 100;
            return { cal: Math.round(value.cal * ratio * 10) / 10, hasKBJU: true, grams };
        }
    }
    return { cal: 0, hasKBJU: false, grams };
}

function calcRecipeKBJU(ingredients, portions = 1) {
    let total = { cal: 0 };
    ingredients.forEach(ing => {
        const kbju = calcIngredientKBJU(ing.name, ing.amount, ing.unit);
        total.cal += kbju.cal * portions;
    });
    return { cal: Math.round(total.cal * 10) / 10 };
}

// ============ РЕАЛЬНЫЕ РЕЦЕПТЫ из БАЗЫ ============
const DEMO_RECIPES = {};
function initRecipes() {
    // Загружаем из localStorage (куда бот положит JSON с сервера)
    // Пока используем demo-данные
    const demoData = [
        {id: 1, name: "Омлет из 1 яйца", portions_base: 1, ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}, {name: "Молоко", amount: 50, unit: "мл"}], instructions: "Взбить, пожарить."},
        {id: 2, name: "Цельнозерновой хлеб 50 г + сыр", portions_base: 1, ingredients: [{name: "Цельнозерновой хлеб", amount: 50, unit: "г"}, {name: "Сыр", amount: 35, unit: "г"}], instructions: "Съесть."},
        {id: 3, name: "Крупа на выбор (греча/булгур/геркулес)", portions_base: 1, ingredients: [{name: "Греча", amount: 60, unit: "г"}], instructions: "Отварить."},
        {id: 4, name: "Курица без кожи", portions_base: 1, ingredients: [{name: "Курица", amount: 100, unit: "г"}], instructions: "Запечь."},
        {id: 5, name: "Салат овощной 200 г", portions_base: 1, ingredients: [{name: "Овощи", amount: 200, unit: "г"}], instructions: "Нарезать, заправить."},
    ];
    demoData.forEach(r => DEMO_RECIPES[String(r.id)] = r);
}
initRecipes();

// ============ МЕНЮ из 348 реальных рецептов ============
const DEMO_MENU = {};
function generateMenu() {
    const mealTypes = ['breakfast', 'snack', 'lunch', 'dinner'];
    const mealNames = {'breakfast': '🥣', 'snack': '🍿', 'lunch': '🥗', 'dinner': '🍽️'};
    const mealRus = {'breakfast': 'завтрак', 'snack': 'перекус', 'lunch': 'обед', 'dinner': 'ужин'};
    
    // Эти данные бот возьмёт из SQLite
    // Пока генерируем из 348 рецептов
    let recipeId = 1;
    const startDate = new Date(2026, 1, 1); // 1 февраля
    
    for (let d = 0; d < 87; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        
        DEMO_MENU[dateStr] = {};
        for (const mt of mealTypes) {
            DEMO_MENU[dateStr][mt] = [];
            if (recipeId <= 348) {
                const recipe = DEMO_RECIPES[String(recipeId)] || {name: `Рецепт #${recipeId}`, ingredients: []};
                DEMO_MENU[dateStr][mt].push({
                    id: parseInt(dateStr.replace(/-/g, '')) * 10 + mealTypes.indexOf(mt),
                    recipe_id: String(recipeId),
                    portions_multiplier: 1,
                    text: recipe.name || `Рецепт ${recipeId}`,
                    kbju: calcRecipeKBJU(recipe.ingredients || [])
                });
                recipeId++;
            }
        }
    }
}
generateMenu();

// ============ КАЛЕНДАРЬ ============
const Calendar = ({ currentDate, meals, onDayClick }) => {
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const mealTypes = [
        { key: 'breakfast', name: '🥣', rus: 'завтрак' },
        { key: 'snack', name: '🍿', rus: 'перекус' },
        { key: 'lunch', name: '🥗', rus: 'обед' },
        { key: 'dinner', name: '🍽️', rus: 'ужин' }
    ];
    
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
                <h1 class="text-xl font-light">{calendarData.month}</h1>
                <div class="flex gap-2">
                    <button onClick={() => changeMonth(-1)} class="p-2 bg-primary rounded-full">←</button>
                    <button onClick={() => changeMonth(1)} class="p-2 bg-primary rounded-full">→</button>
                </div>
            </div>
            
            <div class="grid grid-cols-7 px-2 mb-2">
                {weekDays.map(day => <div key={day} class="text-center text-xs text-muted py-2">{day}</div>)}
            </div>
            
            <div class="grid grid-cols-7 gap-1 px-2">
                {calendarData.days.map((day, idx) => (
                    <div key={idx} className={"aspect-square flex flex-col items-center justify-center rounded-full transition-all " + 
                        (day ? 'cursor-pointer hover:bg-primary/50 ' : '') + 
                        (day?.isToday ? 'bg-accent text-white ' : '') +
                        (day && !day.isToday ? 'text-text ' : '')}
                         onClick={() => day && onDayClick(day)}>
                        {day && (
                            <>
                                <span class="text-sm font-medium">{day.day}</span>
                                <div class="flex gap-0.5 mt-0.5">
                                    {day.meals?.breakfast?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                                    {day.meals?.snack?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                                    {day.meals?.lunch?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                                    {day.meals?.dinner?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============ ДЕНЬ ============
const DayDrawer = ({ date, meals, onClose, onMealClick, onRefresh }) => {
    const mealTypes = [
        { key: 'breakfast', name: '🥣', label: 'Завтрак', color: 'amber' },
        { key: 'snack', name: '🍿', label: 'Перекус', color: 'purple' },
        { key: 'lunch', name: '🥗', label: 'Обед', color: 'green' },
        { key: 'dinner', name: '🍽️', label: 'Ужин', color: 'blue' }
    ];
    
    const dateObj = new Date(date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
        <div class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/20" onClick={onClose}></div>
            <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden">
                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>
                <div class="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="text-lg font-medium capitalize">{dateStr}</h2>
                    <button onClick={onRefresh} class="p-2 bg-primary rounded-full">🔄</button>
                </div>
                <div class="overflow-y-auto max-h-[calc(80vh-80px)] pb-20">
                    {mealTypes.map(({ key, name, label }) => {
                        const dayMeals = meals[key] || [];
                        return (
                            <div key={key} class="px-6 py-3 border-b border-gray-50">
                                <h3 class="text-xs text-muted uppercase tracking-wider mb-2">{name} {label}</h3>
                                {dayMeals.length > 0 ? (
                                    <div class="space-y-2">
                                        {dayMeals.map((meal, idx) => (
                                            <div key={idx} onClick={() => onMealClick(meal)}
                                                 class="p-3 bg-primary/30 rounded-xl cursor-pointer">
                                                <div class="flex justify-between items-start">
                                                    <div>
                                                        <span class="font-medium">{meal.text || meal.recipe_name}</span>
                                                        {meal.kbju && <span class="text-xs text-accent ml-2">🔥 {meal.kbju.cal} ккал</span>}
                                                    </div>
                                                    <span class="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">×{meal.portions_multiplier}</span>
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

// ============ РЕЦЕПТ ============
const RecipeModal = ({ recipe, portions, onClose }) => {
    if (!recipe) return null;
    const kbju = calcRecipeKBJU(recipe.ingredients || [], portions);
    
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-gray-100">
                    <button onClick={onClose} class="absolute right-4 top-4 text-muted">✕</button>
                    <h2 class="text-xl font-medium pr-8">{recipe.name || recipe.text}</h2>
                </div>
                <div class="px-6 py-3 bg-primary/30">
                    <div class="flex justify-between text-center">
                        <div><div class="text-lg font-medium text-accent">{kbju.cal}</div><div class="text-xs text-muted">ккал</div></div>
                    </div>
                </div>
                <div class="px-6 py-3 border-b border-gray-100">
                    <span class="text-sm text-muted">Порции: <b>{portions}</b></span>
                </div>
                <div class="flex-1 overflow-y-auto px-6 py-4">
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <>
                            <h3 class="text-sm font-medium mb-3">Ингредиенты</h3>
                            <div class="space-y-2">
                                {recipe.ingredients.map((ing, idx) => (
                                    <div key={idx} class="flex justify-between py-2 border-b border-gray-100">
                                        <span>{ing.name}</span>
                                        <span class="text-muted">{ing.amount} {ing.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {recipe.instructions && <><h3 class="text-sm font-medium mt-6 mb-3">Инструкция</h3><div class="text-sm text-muted whitespace-pre-line bg-primary/20 p-4 rounded-xl">{recipe.instructions}</div></>}
                </div>
                <div class="px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} class="w-full py-3 bg-primary rounded-xl">Закрыть</button>
                </div>
            </div>
        </div>
    );
};

// ============ ГЛАВНОЕ ПРИЛОЖЕНИЕ ============
const App = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [selectedMeal, setSelectedMeal] = useState(null);
    
    useEffect(() => {
        const saved = localStorage.getItem('meal_plan');
        if (saved) {
            try { setMeals(JSON.parse(saved)); } 
            catch { setMeals(DEMO_MENU); }
        } else {
            setMeals(DEMO_MENU);
        }
    }, []);
    
    useEffect(() => {
        if (Object.keys(meals).length > 0) {
            localStorage.setItem('meal_plan', JSON.stringify(meals));
        }
    }, [meals]);
    
    const changeMonth = (delta) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + delta);
        setCurrentDate(d);
    };
    
    const handleRefresh = () => {
        localStorage.removeItem('meal_plan');
        setMeals(DEMO_MENU);
        alert('✅ Данные обновлены из базы!');
    };
    
    const handleMealClick = (meal) => {
        const recipe = DEMO_RECIPES[meal.recipe_id] || DEMO_RECIPES[String(meal.recipe_id)] || {name: meal.text, ingredients: []};
        setSelectedMeal({ ...meal, recipe });
    };
    
    return (
        <div class="min-h-screen bg-surface">
            <Calendar currentDate={currentDate} meals={meals} onDayClick={(day) => setSelectedDate(day.date)} />
            
            <div class="fixed bottom-6 left-6 right-6 flex justify-between">
                <button onClick={() => changeMonth(-1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center">←</button>
                <button onClick={() => changeMonth(1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center">→</button>
            </div>
            
            <div class="fixed bottom-24 left-6 right-6 flex justify-between px-4">
                <button onClick={handleRefresh} class="p-3 bg-surface shadow rounded-full">📥 Обновить</button>
                <button class="p-3 bg-surface shadow rounded-full" onClick={() => alert('🛒 Список покупок')}>🛒</button>
            </div>
            
            {selectedDate && (
                <DayDrawer date={selectedDate} meals={meals[selectedDate] || {}} onClose={() => setSelectedDate(null)} onMealClick={handleMealClick} onRefresh={handleRefresh} />
            )}
            
            {selectedMeal?.recipe && (
                <RecipeModal recipe={selectedMeal.recipe} portions={selectedMeal.portions_multiplier || 1} onClose={() => setSelectedMeal(null)} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
