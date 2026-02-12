// 🍽️ Meal Prep App - Dynamic KBJU Calculator
const { useState, useEffect, useMemo, useCallback } = React;

// Нормализаторы веса (штуки → граммы)
const UNIT_NORMALIZER = {
    "яйцо": 50, "яйца": 50, "банан": 120, "яблоко": 150,
    "груша": 150, "апельсин": 150, "лимон": 80, "помидор": 100, "перец": 80,
};

// Справочник КБЖУ на 100г
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
    "семга": {"cal": 200, "prot": 20, "fat": 13, "carbs": 0},
    "скумбрия": {"cal": 180, "prot": 18, "fat": 11, "carbs": 0},
    "морепродукты": {"cal": 95, "prot": 18, "fat": 2, "carbs": 3},
    "овощи": {"cal": 30, "prot": 2, "fat": 0.2, "carbs": 5},
    "масло": {"cal": 880, "prot": 0, "fat": 99, "carbs": 0},
    "авокадо": {"cal": 160, "prot": 2, "fat": 15, "carbs": 9},
    "яблоко": {"cal": 52, "prot": 0.3, "fat": 0.2, "carbs": 14},
    "банан": {"cal": 89, "prot": 1, "fat": 0.3, "carbs": 23},
    "груша": {"cal": 57, "prot": 0.4, "fat": 0.1, "carbs": 15},
    "апельсин": {"cal": 47, "prot": 0.9, "fat": 0.1, "carbs": 12},
    "ягоды": {"cal": 50, "prot": 1, "fat": 0.3, "carbs": 10},
    "клубника": {"cal": 32, "prot": 0.7, "fat": 0.3, "carbs": 8},
    "сухофрукты": {"cal": 290, "prot": 3, "fat": 0.5, "carbs": 70},
    "чернослив": {"cal": 230, "prot": 2.5, "fat": 0.5, "carbs": 55},
    "орехи": {"cal": 650, "prot": 15, "fat": 60, "carbs": 15},
    "йогурт": {"cal": 60, "prot": 5, "fat": 1.5, "carbs": 7},
    "ряженка": {"cal": 70, "prot": 3, "fat": 3, "carbs": 5},
    "сметана": {"cal": 200, "prot": 2.5, "fat": 20, "carbs": 4},
    "мука": {"cal": 340, "prot": 12, "fat": 1, "carbs": 70},
    "чеснок": {"cal": 140, "prot": 6, "fat": 0.5, "carbs": 30},
    "зелень": {"cal": 25, "prot": 2, "fat": 0.2, "carbs": 4},
    "лимон": {"cal": 29, "prot": 1, "fat": 0.3, "carbs": 9},
    "соевый соус": {"cal": 50, "prot": 8, "fat": 0, "carbs": 4},
    "маслины": {"cal": 360, "prot": 2, "fat": 35, "carbs": 5},
    "тофу": {"cal": 75, "prot": 8, "fat": 4.5, "carbs": 2},
};

// Нормализовать вес
function normalizeWeight(name, amount, unit) {
    if (unit === 'шт' || unit === 'шт.') {
        const nameLower = name.toLowerCase();
        for (const [key, grams] of Object.entries(UNIT_NORMALIZER)) {
            if (nameLower.includes(key)) return amount * grams;
        }
    }
    return amount;
}

// Расчёт КБЖУ для ингредиента
function calcIngredientKBJU(name, amount, unit = 'г') {
    const grams = normalizeWeight(name, amount, unit);
    const nameLower = name.toLowerCase();
    
    for (const [key, value] of Object.entries(KBJU_REF)) {
        if (nameLower.includes(key)) {
            const ratio = grams / 100;
            return {
                cal: Math.round(value.cal * ratio * 10) / 10,
                prot: Math.round(value.prot * ratio * 10) / 10,
                fat: Math.round(value.fat * ratio * 10) / 10,
                carbs: Math.round(value.carbs * ratio * 10) / 10,
                hasKBJU: true,
                grams: grams
            };
        }
    }
    return { cal: 0, prot: 0, fat: 0, carbs: 0, hasKBJU: false, grams: grams };
}

// Расчёт КБЖУ блюда
function calcRecipeKBJU(ingredients, portions = 1) {
    let total = { cal: 0, prot: 0, fat: 0, carbs: 0 };
    
    ingredients.forEach(ing => {
        const kbju = calcIngredientKBJU(ing.name, ing.amount, ing.unit);
        total.cal += kbju.cal * portions;
        total.prot += kbju.prot * portions;
        total.fat += kbju.fat * portions;
        total.carbs += kbju.carbs * portions;
    });
    
    return {
        cal: Math.round(total.cal * 10) / 10,
        prot: Math.round(total.prot * 10) / 10,
        fat: Math.round(total.fat * 10) / 10,
        carbs: Math.round(total.carbs * 10) / 10
    };
}

const DEMO_RECIPES = {
    "1": { id: 1, name: "Омлет из 1 яйца", portions_base: 1,
            ingredients: [{name: "Яйцо", amount: 1, unit: "шт"}, {name: "Молоко", amount: 50, unit: "мл", optional: true}],
            instructions: "1. Взбить яйцо с молоком.\n2. Жарить до готовности." },
    "2": { id: 2, name: "Цельнозерновой хлеб + сыр", portions_base: 1,
            ingredients: [{name: "Цельнозерновой хлеб", amount: 50, unit: "г"}, {name: "Сыр", amount: 30, unit: "г"}],
            instructions: "Хлеб с сыром." },
    "3": { id: 3, name: "Творог с сухофруктами", portions_base: 1,
            ingredients: [{name: "Творог 4-5%", amount: 140, unit: "г"}, {name: "Сухофрукты", amount: 25, unit: "г"}],
            instructions: "Смешать творог с сухофруктами." },
    "4": { id: 4, name: "Крупа на выбор", portions_base: 1,
            ingredients: [{name: "Греча", amount: 65, unit: "г"}, {name: "Вода", amount: 300, unit: "мл"}],
            instructions: "Отварить крупу." },
    "5": { id: 5, name: "Курица без кожи", portions_base: 1,
            ingredients: [{name: "Курица", amount: 100, unit: "г"}],
            instructions: "Тушить/запечь курицу." },
    "6": { id: 6, name: "Салат овощной", portions_base: 1,
            ingredients: [{name: "Овощи", amount: 200, unit: "г"}, {name: "Масло", amount: 5, unit: "мл"}],
            instructions: "Нарезать овощи, заправить маслом." },
    "7": { id: 7, name: "Яблоко", portions_base: 1,
            ingredients: [{name: "Яблоко", amount: 1, unit: "шт"}],
            instructions: "Съесть." },
    "8": { id: 8, name: "Салат с моцареллой", portions_base: 1,
            ingredients: [{name: "Овощи", amount: 200, unit: "г"}, {name: "Масло", amount: 10, unit: "мл"}, {name: "Моцарелла", amount: 20, unit: "г"}, {name: "Авокадо", amount: 40, unit: "г", optional: true}],
            instructions: "Салат с моцареллой." },
};

const DEMO_MENU = {
    "2026-02-12": {
        "завтрак": [
            {id: 1, recipe_id: "1", portions_multiplier: 1, text: "Омлет из 1 яйца"},
            {id: 2, recipe_id: "2", portions_multiplier: 1, text: "Хлеб + сыр"}
        ],
        "перекус": [
            {id: 3, recipe_id: "3", portions_multiplier: 1, text: "Творог с сухофруктами"}
        ],
        "обед": [
            {id: 4, recipe_id: "4", portions_multiplier: 1, text: "Крупа"},
            {id: 5, recipe_id: "5", portions_multiplier: 1, text: "Курица"},
            {id: 6, recipe_id: "6", portions_multiplier: 1, text: "Салат"},
            {id: 7, recipe_id: "7", portions_multiplier: 1, text: "Яблоко"}
        ],
        "ужин": [
            {id: 8, recipe_id: "8", portions_multiplier: 1, text: "Салат с моцареллой"}
        ]
    }
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
        <div class="pb-24">
            <div class="px-6 py-4"><h1 class="text-xl font-light">{calendarData.month}</h1></div>
            <div class="grid grid-cols-7 px-2 mb-2">
                {weekDays.map(day => <div key={day} class="text-center text-xs text-muted py-2">{day}</div>)}
            </div>
            <div class="grid grid-cols-7 gap-1 px-2">
                {calendarData.days.map((day, idx) => (
                    <div key={idx} className={"aspect-square flex flex-col items-center justify-center rounded-full " + (day ? 'cursor-pointer hover:bg-primary/50 ' : '') + (day?.isToday ? 'bg-accent text-white ' : '') + (day && !day.isToday ? 'text-text ' : '')} onClick={() => day && onDayClick(day)}>
                        {day && <><span class="text-sm font-medium">{day.day}</span>
                        <div class="flex gap-0.5 mt-0.5">
                            {day.meals?.завтрак?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                            {day.meals?.перекус?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                            {day.meals?.обед?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                            {day.meals?.ужин?.length > 0 && <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                        </div></>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecipeModal = ({ recipe, portions, onClose, onPortionChange, onReplace }) => {
    if (!recipe) return null;
    const kbju = calcRecipeKBJU(recipe.ingredients, portions);
    
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-gray-100">
                    <button onClick={onClose} class="absolute right-4 top-4 text-muted">✕</button>
                    <h2 class="text-xl font-medium pr-8">{recipe.name}</h2>
                    <p class="text-xs text-muted">🔢 Формула: (вес × калории на 100г) ÷ 100</p>
                </div>
                <div class="px-6 py-3 bg-primary/30">
                    <div class="flex justify-between text-center">
                        <div><div class="text-lg font-medium text-accent">{kbju.cal}</div><div class="text-xs text-muted">ккал</div></div>
                        <div><div class="text-lg font-medium">{kbju.prot}</div><div class="text-xs text-muted">бел</div></div>
                        <div><div class="text-lg font-medium">{kbju.fat}</div><div class="text-xs text-muted">жир</div></div>
                        <div><div class="text-lg font-medium">{kbju.carbs}</div><div class="text-xs text-muted">угл</div></div>
                    </div>
                </div>
                <div class="px-6 py-3 border-b border-gray-100">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-muted">Порции: <b>{portions}</b></span>
                        <div class="flex gap-3">
                            <button onClick={() => onPortionChange(Math.max(0.5, portions - 0.5))} class="w-8 h-8 bg-red-100 text-red-600 rounded-full">−</button>
                            <button onClick={() => onPortionChange(portions + 0.5)} class="w-8 h-8 bg-green-100 text-green-600 rounded-full">+</button>
                        </div>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto px-6 py-4">
                    <h3 class="text-sm font-medium mb-3">🥗 Ингредиенты ({portions} порц.)</h3>
                    <div class="space-y-2">
                        {recipe.ingredients.map((ing, idx) => {
                            const ingKBJU = calcIngredientKBJU(ing.name, ing.amount * portions, ing.unit);
                            return (
                                <div key={idx} class="flex justify-between py-2 border-b border-gray-100">
                                    <div class="flex-1">
                                        <span class={ing.optional ? "text-muted" : ""}>{ing.name}{ing.optional ? <span class="text-xs">(опц.)</span> : ''}</span>
                                        <div class="text-xs text-muted">
                                            {ing.amount}→{ing.amount * portions} {ing.unit} = {ingKBJU.grams.toFixed(0)}г
                                            {ingKBJU.hasKBJU ? <span class="ml-2 text-accent">🔥 {ingKBJU.cal} ккал</span> : <span class="ml-2 text-gray-400">? ккал</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => onReplace(ing)} class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">🔄</button>
                                </div>
                            );
                        })}
                    </div>
                    {recipe.instructions && <><h3 class="text-sm font-medium mt-6 mb-3">👨‍🍳</h3><div class="text-sm text-muted whitespace-pre-line bg-primary/20 p-4 rounded-xl">{recipe.instructions}</div></>}
                </div>
                <div class="px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} class="w-full py-3 bg-primary rounded-xl">Закрыть</button>
                </div>
            </div>
        </div>
    );
};

const ReplaceModal = ({ ingredient, onConfirm, onClose }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [updateAll, setUpdateAll] = useState(false);
    const replacements = [
        { name: "Тофу", cal: 75, prot: 8, fat: 4.5, carbs: 2 },
        { name: "Брынза", cal: 260, prot: 22, fat: 19, carbs: 2 },
        { name: "Фетакса", cal: 290, prot: 21, fat: 23, carbs: 4 },
        { name: "Куриная грудка", cal: 120, prot: 22, fat: 2, carbs: 0 },
        { name: "Индейка", cal: 130, prot: 29, fat: 2, carbs: 0 },
        { name: "Семга", cal: 200, prot: 20, fat: 13, carbs: 0 },
    ];
    const filtered = replacements.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    
    return (
        <div class="fixed inset-0 z-50 flex items-end justify-center">
            <div class="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div class="relative bg-surface rounded-t-3xl w-full max-w-md p-6">
                <h3 class="text-lg font-medium mb-4">Заменить: <span class="text-accent">{ingredient?.name}</span></h3>
                <input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} class="w-full px-4 py-2 bg-primary/30 rounded-xl mb-4"/>
                <div class="space-y-2 max-h-48 overflow-y-auto mb-4">
                    {filtered.map((r, idx) => (
                        <div key={idx} onClick={() => setSelected(r)} className={"p-3 rounded-xl cursor-pointer " + (selected?.name === r.name ? 'bg-accent text-white' : 'bg-primary/30')}>
                            <div class="flex justify-between"><span>{r.name}</span><span class="text-sm opacity-70">🔥 {r.cal} ккал</span></div>
                        </div>
                    ))}
                </div>
                <label class="flex items-center gap-2 mb-4"><input type="checkbox" checked={updateAll} onChange={(e) => setUpdateAll(e.target.checked)}/><span class="text-sm">Заменить во всех рецептах</span></label>
                <div class="flex gap-2">
                    <button onClick={onClose} class="flex-1 py-3 bg-gray-200 rounded-xl">Отмена</button>
                    <button onClick={() => selected && onConfirm(selected, updateAll)} disabled={!selected} class="flex-1 py-3 bg-accent text-white rounded-xl disabled:opacity-50">Заменить</button>
                </div>
            </div>
        </div>
    );
};

const DayDrawer = ({ date, meals, onClose, onMealClick, onUpdatePortion }) => {
    const mealTypes = [
        { key: 'завтрак', name: '🥣 Завтрак' },
        { key: 'перекус', name: '🍿 Перекус' },
        { key: 'обед', name: '🥗 Обед' },
        { key: 'ужин', name: '🍽️ Ужин' }
    ];
    const dateObj = date ? new Date(date + 'T00:00:00') : null;
    const dateStr = dateObj?.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
        <div class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/20" onClick={onClose}></div>
            <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden">
                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>
                <div class="px-6 py-3 border-b border-gray-100"><h2 class="text-lg font-medium capitalize">{dateStr}</h2></div>
                <div class="overflow-y-auto max-h-[calc(80vh-80px)] pb-20">
                    {mealTypes.map(({ key, name }) => {
                        const mealItems = meals[key] || [];
                        return (
                            <div key={key} class="px-6 py-3 border-b border-gray-50">
                                <h3 class="text-xs text-muted uppercase mb-2">{name}</h3>
                                {mealItems.length > 0 ? (
                                    <div class="space-y-2">
                                        {mealItems.map((meal, idx) => (
                                            <div key={idx} class="p-3 bg-primary/30 rounded-xl">
                                                <div class="flex justify-between items-start">
                                                    <div class="flex-1" onClick={() => onMealClick(meal)}>
                                                        <span class="font-medium">{meal.text || meal.recipe_name}</span>
                                                        <div class="flex items-center gap-2 mt-1"><span class="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">×{meal.portions_multiplier}</span></div>
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

const App = () => {
    const [view, setView] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState({});
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [modalPortions, setModalPortions] = useState(1);
    const [replaceModal, setReplaceModal] = useState(null);
    const [recipeVersion, setRecipeVersion] = useState(0);  // Для принудительного ререндера
    
    useEffect(() => {
        const saved = localStorage.getItem('meal_plan');
        if (saved) { try { setMeals(JSON.parse(saved)); } catch { setMeals(DEMO_MENU); } }
        else { setMeals(DEMO_MENU); }
    }, []);
    
    useEffect(() => { if (Object.keys(meals).length > 0) localStorage.setItem('meal_plan', JSON.stringify(meals)); }, [meals]);
    
    const getRecipe = () => {
        if (!selectedMeal) return null;
        const id = selectedMeal.recipe_id || selectedMeal.id;
        return DEMO_RECIPES[id] || DEMO_RECIPES[String(id)];
    };
    
    const handleMealClick = (meal) => { setSelectedMeal({ ...meal }); setModalPortions(meal.portions_multiplier || 1); };
    
    const handleUpdatePortion = (meal, delta) => {
        setMeals(prev => {
            const updated = { ...prev };
            if (!updated[selectedDate]) return prev;
            Object.keys(updated[selectedDate]).forEach(type => {
                updated[selectedDate][type] = updated[selectedDate][type].map(m => {
                    if (m.id === meal.id) return { ...m, portions_multiplier: Math.max(0.5, (m.portions_multiplier || 1) + delta) };
                    return m;
                });
            });
            return updated;
        });
    };
    
    const handleReplace = (oldIng, newIng, updateAll) => {
        // Обновляем DEMO_RECIPES
        if (DEMO_RECIPES[selectedMeal.recipe_id]) {
            const recipe = DEMO_RECIPES[selectedMeal.recipe_id];
            recipe.ingredients = recipe.ingredients.map(ing => {
                if (ing.name === oldIng.name) return { ...ing, name: newIng.name, replacedFrom: oldIng.name };
                return ing;
            });
        }
        setReplaceModal(null);
        // Принудительный ререндер RecipeModal
        setRecipeVersion(prev => prev + 1);
    };
    
    const changeMonth = (delta) => { const d = new Date(currentDate); d.setMonth(d.getMonth() + delta); setCurrentDate(d); };
    
    return (
        <div class="min-h-screen bg-surface">
            {view === 'calendar' && (
                <>
                    <Calendar currentDate={currentDate} meals={meals} onDayClick={(day) => setSelectedDate(day.date)} />
                    <div class="fixed bottom-6 left-6 right-6 flex justify-between">
                        <button onClick={() => changeMonth(-1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center">←</button>
                        <button onClick={() => changeMonth(1)} class="w-12 h-12 bg-surface shadow-lg rounded-full flex items-center justify-center">→</button>
                    </div>
                    <div class="fixed bottom-24 left-6 right-6 flex justify-between px-4">
                        <button class="p-3 bg-surface shadow rounded-full" onClick={() => alert('🛒')}>🛒</button>
                        <button onClick={() => setView('settings')} class="p-3 bg-surface shadow rounded-full">⚙️</button>
                    </div>
                    {selectedDate && <DayDrawer date={selectedDate} meals={meals[selectedDate] || {}} onClose={() => setSelectedDate(null)} onMealClick={handleMealClick} onUpdatePortion={handleUpdatePortion} />}
                    {selectedMeal && <RecipeModal key={recipeVersion} recipe={getRecipe()} portions={modalPortions} onClose={() => setSelectedMeal(null)} onPortionChange={setModalPortions} onReplace={(ing) => setReplaceModal(ing)} />}
                </>
            )}
            {view === 'settings' && (
                <div class="fixed inset-0 bg-surface z-50 p-6">
                    <div class="max-w-md mx-auto">
                        <div class="flex items-center mb-6"><button onClick={() => setView('calendar')} class="p-2 -ml-2">←</button><h1 class="text-xl font-medium ml-2">Настройки</h1></div>
                        <div class="space-y-4">
                            <button onClick={() => { setMeals(DEMO_MENU); setView('calendar'); }} class="w-full py-3 bg-green-500 text-white rounded-xl">🎮 Демо-меню</button>
                        </div>
                    </div>
                </div>
            )}
            {replaceModal && <ReplaceModal ingredient={replaceModal} onConfirm={handleReplace} onClose={() => setReplaceModal(null)} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
