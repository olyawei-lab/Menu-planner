// 🍽️ Meal Prep App - Calendar with Drag & Drop
const { useState, useEffect, useMemo, useCallback } = React;

// Нормализаторы веса
const UNIT_NORMALIZER = { "яйцо": 50, "яйца": 50, "банан": 120, "яблоко": 150, "груша": 150, "апельсин": 150, "лимон": 80, "помидор": 100, "перец": 80 };
const KBJU_REF = {
    "яйцо": {"cal": 157, "prot": 12.7, "fat": 10.6, "carbs": 0.7}, "молоко": {"cal": 50, "prot": 3.2, "fat": 1.5, "carbs": 4.8}, "творог": {"cal": 101, "prot": 18, "fat": 3, "carbs": 3.5}, "творог 4-5%": {"cal": 101, "prot": 18, "fat": 4.5, "carbs": 3}, "сыр": {"cal": 350, "prot": 25, "fat": 27, "carbs": 2}, "моцарелла": {"cal": 280, "prot": 28, "fat": 17, "carbs": 3}, "фетакса": {"cal": 290, "prot": 21, "fat": 23, "carbs": 4}, "брынза": {"cal": 260, "prot": 22, "fat": 19, "carbs": 2}, "хлеб": {"cal": 250, "prot": 9, "fat": 3, "carbs": 45}, "цельнозерновой хлеб": {"cal": 220, "prot": 13, "fat": 3, "carbs": 37}, "геркулес": {"cal": 340, "prot": 13, "fat": 6, "carbs": 60}, "греча": {"cal": 310, "prot": 12, "fat": 3, "carbs": 57}, "рис": {"cal": 340, "prot": 8, "fat": 1, "carbs": 75}, "макароны": {"cal": 350, "prot": 13, "fat": 1, "carbs": 70}, "курица": {"cal": 165, "prot": 31, "fat": 3.6, "carbs": 0}, "куриная грудка": {"cal": 120, "prot": 22, "fat": 2, "carbs": 0}, "индейка": {"cal": 130, "prot": 29, "fat": 2, "carbs": 0}, "рыба": {"cal": 140, "prot": 20, "fat": 6, "carbs": 0}, "семга": {"cal": 200, "prot": 20, "fat": 13, "carbs": 0}, "скумбрия": {"cal": 180, "prot": 18, "fat": 11, "carbs": 0}, "овощи": {"cal": 30, "prot": 2, "fat": 0.2, "carbs": 5}, "масло": {"cal": 880, "prot": 0, "fat": 99, "carbs": 0}, "авокадо": {"cal": 160, "prot": 2, "fat": 15, "carbs": 9}, "яблоко": {"cal": 52, "prot": 0.3, "fat": 0.2, "carbs": 14}, "банан": {"cal": 89, "prot": 1, "fat": 0.3, "carbs": 23}, "груша": {"cal": 57, "prot": 0.4, "fat": 0.1, "carbs": 15}, "апельсин": {"cal": 47, "prot": 0.9, "fat": 0.1, "carbs": 12}, "ягоды": {"cal": 50, "prot": 1, "fat": 0.3, "carbs": 10}, "клубника": {"cal": 32, "prot": 0.7, "fat": 0.3, "carbs": 8}, "сухофрукты": {"cal": 290, "prot": 3, "fat": 0.5, "carbs": 70}, "чернослив": {"cal": 230, "prot": 2.5, "fat": 0.5, "carbs": 55}, "орехи": {"cal": 650, "prot": 15, "fat": 60, "carbs": 15}, "йогурт": {"cal": 60, "prot": 5, "fat": 1.5, "carbs": 7}, "ряженка": {"cal": 70, "prot": 3, "fat": 3, "carbs": 5}, "сметана": {"cal": 200, "prot": 2.5, "fat": 20, "carbs": 4}, "тофу": {"cal": 75, "prot": 8, "fat": 4.5, "carbs": 2},
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

// DEMO данные
const DEMO_RECIPES = {
    "1": { id: 1, name: "Омлет из 1 яйца", portions_base: 1, ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}, {name: "Молоко", amount: 50, unit: "мл", optional: true}], instructions: "1. Взбить яйцо.\n2. Жарить." },
    "2": { id: 2, name: "Хлеб + сыр", portions_base: 1, ingredients: [{name: "Цельнозерновой хлеб", amount: 50, unit: "г"}, {name: "Сыр", amount: 30, unit: "г"}], instructions: "Хлеб с сыром." },
    "3": { id: 3, name: "Творог с сухофруктами", portions_base: 1, ingredients: [{name: "Творог 4-5%", amount: 140, unit: "г"}, {name: "Сухофрукты", amount: 25, unit: "г"}], instructions: "Смешать." },
    "4": { id: 4, name: "Крупа", portions_base: 1, ingredients: [{name: "Греча", amount: 65, unit: "г"}], instructions: "Отварить." },
    "5": { id: 5, name: "Курица", portions_base: 1, ingredients: [{name: "Курица", amount: 100, unit: "г"}], instructions: "Запечь." },
    "6": { id: 6, name: "Салат", portions_base: 1, ingredients: [{name: "Овощи", amount: 200, unit: "г"}, {name: "Масло", amount: 5, unit: "мл"}], instructions: "Нарезать, заправить." },
    "7": { id: 7, name: "Яблоко", portions_base: 1, ingredients: [{name: "Яблоко", amount: 1, unit: "шт"}], instructions: "Съесть." },
    "8": { id: 8, name: "Салат с моцареллой", portions_base: 1, ingredients: [{name: "Овощи", amount: 200, unit: "г"}, {name: "Масло", amount: 10, unit: "мл"}, {name: "Моцарелла", amount: 20, unit: "г"}], instructions: "Салат." },
    "9": { id: 9, name: "Вареное яйцо", portions_base: 1, ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}], instructions: "Отварить 10 мин." },
    "10": { id: 10, name: "Овсянка", portions_base: 1, ingredients: [{name: "Геркулес", amount: 40, unit: "г"}, {name: "Молоко", amount: 150, unit: "мл"}], instructions: "Залить, варить 5 мин." },
};

// Генерируем 305 рецептов
for (let i = 11; i <= 305; i++) {
    const types = ["Омлет", "Каша", "Салат", "Суп", "Рагу", "Запеканка", "Творог", "Йогурт", "Смузи", "Бутерброд"];
    const ingredients = [
        [{name: "Яйцо", amount: 2, unit: "шт"}, {name: "Хлеб", amount: 50, unit: "г"}],
        [{name: "Греча", amount: 60, unit: "г"}, {name: "Масло", amount: 10, unit: "мл"}],
        [{name: "Овощи", amount: 150, unit: "г"}, {name: "Масло", amount: 5, unit: "мл"}],
        [{name: "Курица", amount: 100, unit: "г"}, {name: "Рис", amount: 80, unit: "г"}],
        [{name: "Творог", amount: 150, unit: "г"}, {name: "Сухофрукты", amount: 20, unit: "г"}],
    ];
    DEMO_RECIPES[String(i)] = {
        id: i, name: `${types[i % 10]} #${i}`, portions_base: 1,
        ingredients: ingredients[i % 5], instructions: `Рецепт ${i}.`
    };
}

const DEMO_MENU = {};
function generateMenu() {
    const types = ['завтрак', 'перекус', 'обед', 'ужин'];
    let recipeId = 1;
    const today = new Date();
    const startDate = new Date(2026, 1, 1); // 1 февраля
    
    for (let d = 0; d < 90; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        
        DEMO_MENU[dateStr] = {};
        for (const t of types) {
            DEMO_MENU[dateStr][t] = [];
            if (recipeId <= 305) {
                DEMO_MENU[dateStr][t].push({
                    id: recipeId * 10 + types.indexOf(t),
                    recipe_id: String(recipeId),
                    portions_multiplier: 1,
                    text: DEMO_RECIPES[String(recipeId)]?.name || `${t} ${recipeId}`
                });
                recipeId++;
            }
        }
    }
}
generateMenu();

// Календарь
const Calendar = ({ currentDate, meals, onDayClick, onMealDragStart, draggedMeal }) => {
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const mealTypes = [
        { key: 'завтрак', name: '🥣', color: 'amber' },
        { key: 'перекус', name: '🍿', color: 'purple' },
        { key: 'обед', name: '🥗', color: 'green' },
        { key: 'ужин', name: '🍽️', color: 'blue' }
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
        <div class="pb-28">
            <div class="px-6 py-4 flex items-center justify-between">
                <h1 class="text-xl font-light">{calendarData.month}</h1>
                <div class="flex gap-2">
                    <button onClick={() => changeMonth(-1)} class="p-2 bg-gray-100 rounded-full">←</button>
                    <button onClick={() => changeMonth(1)} class="p-2 bg-gray-100 rounded-full">→</button>
                </div>
            </div>
            
            <div class="grid grid-cols-7 px-2 mb-2">
                {weekDays.map(day => <div key={day} class="text-center text-xs text-muted py-2">{day}</div>)}
            </div>
            
            <div class="grid grid-cols-7 gap-1 px-2">
                {calendarData.days.map((day, idx) => (
                    <div key={idx} className={"min-h-20 p-2 rounded-xl border " + (day ? 'cursor-pointer hover:bg-primary/30 ' : '') + (day?.isToday ? 'bg-accent/20 border-accent ' : 'bg-surface border-gray-100 ') + (day && !day.isToday ? '' : '')}
                         onClick={() => day && onDayClick(day)}>
                        {day && (
                            <>
                                <div class="text-sm font-medium mb-1">{day.day}</div>
                                {mealTypes.map(mt => (
                                    day.meals[mt.key]?.length > 0 && <div key={mt.key} class="text-xs mb-0.5 truncate" style={{color: `var(--${mt.color}-500)`}}>• {day.meals[mt.key].length}</div>
                                ))}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// День с drag-drop
const DayView = ({ date, meals, onClose, onMealClick, onMealDrop, onDragStart }) => {
    const [dragging, setDragging] = useState(null);
    const mealTypes = [
        { key: 'завтрак', name: '🥣 Завтрак', color: 'amber', time: '08:00' },
        { key: 'перекус', name: '🍿 Перекус', color: 'purple', time: '11:00' },
        { key: 'обед', name: '🥗 Обед', color: 'green', time: '14:00' },
        { key: 'ужин', name: '🍽️ Ужин', color: 'blue', time: '19:00' }
    ];
    const dateObj = new Date(date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    
    const handleDragStart = (e, meal, fromDate, mealType) => {
        setDragging({ meal, fromDate, mealType });
        e.dataTransfer.setData('text/plain', JSON.stringify({ meal, fromDate, mealType }));
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-primary/20');
    };
    
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('bg-primary/20');
    };
    
    const handleDrop = (e, toDate, mealType) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-primary/20');
        
        if (dragging) {
            const { meal, fromDate } = dragging;
            onMealDrop({ meal, fromDate, toDate, mealType });
            setDragging(null);
        }
    };
    
    return (
        <div class="fixed inset-0 z-50 bg-surface">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center">
                <button onClick={onClose} class="p-2 -ml-2 mr-2">←</button>
                <h1 class="text-xl font-medium">{dateStr}</h1>
            </div>
            
            <div class="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]">
                {mealTypes.map(({ key, name, color, time }) => {
                    const dayMeals = meals[key] || [];
                    return (
                        <div key={key} class="bg-primary/30 rounded-xl p-4"
                             onDragOver={handleDragOver}
                             onDragLeave={handleDragLeave}
                             onDrop={(e) => handleDrop(e, date, key)}>
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-lg">{name.split(' ')[0]}</span>
                                <span class="text-xs text-muted">{time}</span>
                                <span class="text-xs bg-white px-2 py-0.5 rounded ml-auto">{dayMeals.length}</span>
                            </div>
                            
                            <div class="space-y-2">
                                {dayMeals.length > 0 ? dayMeals.map((meal, idx) => (
                                    <div key={idx} draggable
                                         onDragStart={(e) => handleDragStart(e, meal, date, key)}
                                         onClick={() => onMealClick(meal)}
                                         class="p-3 bg-surface rounded-lg shadow-sm cursor-grab active:cursor-grabbing">
                                        <div class="flex justify-between items-start">
                                            <span class="font-medium">{meal.text || meal.recipe_name}</span>
                                            <span class="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">×{meal.portions_multiplier}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div class="text-center text-muted py-4 text-sm">Перетащите блюдо сюда</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {dragging && (
                <div class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-2 rounded-full shadow-lg">
                    Перетащите на нужный день и тип приёма
                </div>
            )}
        </div>
    );
};

// Заглушка RecipeModal
const RecipeModal = ({ recipe, portions, onClose }) => {
    if (!recipe) return null;
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md p-6">
                <button onClick={onClose} class="absolute right-4 top-4 text-muted">✕</button>
                <h2 class="text-xl font-medium">{recipe.name}</h2>
                <p class="text-sm text-muted mt-1">Порции: {portions}</p>
                <div class="mt-4 space-y-2">
                    {recipe.ingredients?.map((ing, i) => (
                        <div key={i} class="flex justify-between py-2 border-b border-gray-100">
                            <span>{ing.name}</span>
                            <span class="text-muted">{ing.amount} {ing.unit}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} class="w-full py-3 bg-primary rounded-xl mt-4">Закрыть</button>
            </div>
        </div>
    );
};

// Главное приложение
const App = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [selectedMeal, setSelectedMeal] = useState(null);
    
    useEffect(() => {
        const saved = localStorage.getItem('meal_plan');
        if (saved) {
            try { setMeals(JSON.parse(saved)); } catch { setMeals(DEMO_MENU); }
        } else { setMeals(DEMO_MENU); }
    }, []);
    
    useEffect(() => {
        if (Object.keys(meals).length > 0) localStorage.setItem('meal_plan', JSON.stringify(meals));
    }, [meals]);
    
    const changeMonth = (delta) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + delta);
        setCurrentDate(d);
    };
    
    const handleMealDrop = ({ meal, fromDate, toDate, mealType }) => {
        console.log('📦 Drop:', { meal, fromDate, toDate, mealType });
        alert(`📦 Сдвиг: ${meal.text}\n${fromDate} → ${toDate}\n${mealType}\n\n(Сдвиг реализован в API)`);
    };
    
    return (
        <div class="min-h-screen bg-surface">
            <Calendar currentDate={currentDate} meals={meals} onDayClick={(day) => setSelectedDate(day.date)} />
            
            {selectedDate && (
                <DayView date={selectedDate} meals={meals[selectedDate] || {}} onClose={() => setSelectedDate(null)}
                         onMealClick={(meal) => {
                             const recipe = DEMO_RECIPES[meal.recipe_id];
                             setSelectedMeal({ ...meal, recipe });
                         }}
                         onMealDrop={handleMealDrop} />
            )}
            
            {selectedMeal?.recipe && (
                <RecipeModal recipe={selectedMeal.recipe} portions={selectedMeal.portions_multiplier} onClose={() => setSelectedMeal(null)} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
