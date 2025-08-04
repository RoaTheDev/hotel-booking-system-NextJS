'use client'
import React, {useEffect, useState} from 'react';
import {Award, ChefHat, Clock, Leaf, LucideIcon, Mountain, Star} from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: 'appetizers' | 'soups' | 'salads' | 'mains' | 'desserts' | 'beverages';
    dietary: ('vegetarian' | 'vegan')[];
    seasonal: boolean;
    chef_special: boolean;
    prep_time: string;
}

interface Category {
    id: 'appetizers' | 'soups' | 'salads' | 'mains' | 'desserts' | 'beverages';
    name: string;
    icon: LucideIcon;
}

interface GroupedItems {
    [key: string]: MenuItem[];
}
const menuItems: MenuItem[] = [
    // Appetizers
    {
        id: 1,
        name: "Mountain Forest Mushroom Bruschetta",
        description: "Wild foraged mushrooms with truffle oil, fresh herbs, and artisan sourdough from local grains",
        price: 18,
        category: "appetizers",
        dietary: ["vegetarian"],
        seasonal: true,
        chef_special: false,
        prep_time: "15 min"
    },
    {
        id: 2,
        name: "Alpine Charcuterie Board",
        description: "Selection of house-cured meats, mountain cheeses, wildflower honey, and preserved seasonal fruits",
        price: 32,
        category: "appetizers",
        dietary: [],
        seasonal: false,
        chef_special: true,
        prep_time: "10 min"
    },
    {
        id: 3,
        name: "Smoked Trout Tartine",
        description: "Cold-smoked local trout with dill cream, capers, and pumpernickel bread",
        price: 22,
        category: "appetizers",
        dietary: [],
        seasonal: false,
        chef_special: false,
        prep_time: "12 min"
    },
    {
        id: 4,
        name: "Roasted Bone Marrow",
        description: "Grass-fed bone marrow with parsley salad, sourdough crostini, and sea salt",
        price: 24,
        category: "appetizers",
        dietary: [],
        seasonal: false,
        chef_special: false,
        prep_time: "20 min"
    },

    // Soups & Salads
    {
        id: 5,
        name: "Wild Game Consommé",
        description: "Clear broth with venison, root vegetables, and fresh mountain herbs",
        price: 16,
        category: "soups",
        dietary: [],
        seasonal: true,
        chef_special: false,
        prep_time: "8 min"
    },
    {
        id: 6,
        name: "Foraged Greens Salad",
        description: "Wild arugula, dandelion, and seasonal mountain greens with walnut vinaigrette",
        price: 19,
        category: "salads",
        dietary: ["vegetarian", "vegan"],
        seasonal: true,
        chef_special: false,
        prep_time: "10 min"
    },
    {
        id: 7,
        name: "Roasted Beet & Goat Cheese Salad",
        description: "Rainbow beets with herbed goat cheese, candied walnuts, and balsamic reduction",
        price: 21,
        category: "salads",
        dietary: ["vegetarian"],
        seasonal: false,
        chef_special: false,
        prep_time: "12 min"
    },

    // Mains
    {
        id: 8,
        name: "Elk Tenderloin",
        description: "Grass-fed elk with juniper berry sauce, roasted root vegetables, and wild rice pilaf",
        price: 48,
        category: "mains",
        dietary: [],
        seasonal: true,
        chef_special: true,
        prep_time: "25 min"
    },
    {
        id: 9,
        name: "Pan-Seared Mountain Trout",
        description: "Fresh catch with herb butter, seasonal vegetables, and fingerling potatoes",
        price: 34,
        category: "mains",
        dietary: [],
        seasonal: true,
        chef_special: false,
        prep_time: "18 min"
    },
    {
        id: 10,
        name: "Wild Mushroom Risotto",
        description: "Creamy arborio rice with foraged mushrooms, truffle oil, and aged parmesan",
        price: 28,
        category: "mains",
        dietary: ["vegetarian"],
        seasonal: true,
        chef_special: false,
        prep_time: "22 min"
    },
    {
        id: 11,
        name: "Braised Short Rib",
        description: "Slow-braised beef short rib with red wine reduction and creamy polenta",
        price: 42,
        category: "mains",
        dietary: [],
        seasonal: false,
        chef_special: true,
        prep_time: "30 min"
    },
    {
        id: 12,
        name: "Roasted Duck Breast",
        description: "Five-spice duck with cherry gastrique, wild rice, and seasonal root vegetables",
        price: 38,
        category: "mains",
        dietary: [],
        seasonal: true,
        chef_special: false,
        prep_time: "28 min"
    },

    // Desserts
    {
        id: 13,
        name: "Dark Chocolate Mountain Torte",
        description: "Rich chocolate cake with berry compote and whipped cream",
        price: 14,
        category: "desserts",
        dietary: ["vegetarian"],
        seasonal: false,
        chef_special: false,
        prep_time: "8 min"
    },
    {
        id: 14,
        name: "Seasonal Fruit Tart",
        description: "Pastry shell with vanilla custard and fresh mountain berries",
        price: 12,
        category: "desserts",
        dietary: ["vegetarian"],
        seasonal: true,
        chef_special: false,
        prep_time: "10 min"
    },
    {
        id: 15,
        name: "Maple Crème Brûlée",
        description: "Traditional custard with local maple syrup and caramelized sugar",
        price: 13,
        category: "desserts",
        dietary: ["vegetarian"],
        seasonal: false,
        chef_special: true,
        prep_time: "5 min"
    },

    // Beverages
    {
        id: 16,
        name: "Mountain Spring Water",
        description: "Pure glacial water sourced from our local mountain springs",
        price: 4,
        category: "beverages",
        dietary: ["vegan"],
        seasonal: false,
        chef_special: false,
        prep_time: "1 min"
    },
    {
        id: 17,
        name: "House-Made Pine Needle Tea",
        description: "Refreshing herbal tea made from fresh mountain pine needles",
        price: 6,
        category: "beverages",
        dietary: ["vegan"],
        seasonal: true,
        chef_special: false,
        prep_time: "5 min"
    },
    {
        id: 18,
        name: "Local Craft Beer Selection",
        description: "Rotating selection of regional microbrews and seasonal ales",
        price: 8,
        category: "beverages",
        dietary: [],
        seasonal: true,
        chef_special: false,
        prep_time: "2 min"
    }
];

export const ClientMenuPage = () => {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);


    const categories: Category[] = [
        {id: 'appetizers', name: 'Appetizers', icon: ChefHat},
        {id: 'soups', name: 'Soups', icon: Star},
        {id: 'salads', name: 'Salads', icon: Leaf},
        {id: 'mains', name: 'Main Courses', icon: Award},
        {id: 'desserts', name: 'Desserts', icon: Star},
        {id: 'beverages', name: 'Beverages', icon: Mountain}
    ];

    const groupedItems: GroupedItems = categories.reduce((acc, category) => {
        acc[category.id] = menuItems.filter((item: MenuItem) => item.category === category.id);
        return acc;
    }, {} as GroupedItems);

    const getDietaryBadgeColor = (dietary: ('vegetarian' | 'vegan')[]): string => {
        if (dietary.includes('vegan')) return 'bg-green-500/20 text-green-400 border-green-500/30';
        if (dietary.includes('vegetarian')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl animate-pulse"></div>
                <div
                    className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div
                    className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Header */}
            <div
                className={`relative z-10 py-20 px-4 text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-6 tracking-wide">
                    Mountain
                    <span className="block text-amber-400 font-normal">Menu</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                    A curated selection of dishes celebrating the essence of mountain cuisine
                </p>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>


            {/* Menu Items by Category */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
                {categories.map((category, categoryIndex) => {
                    const IconComponent = category.icon;
                    const categoryItems = groupedItems[category.id];

                    return (
                        <div key={category.id} className="mb-16">
                            {/* Category Header */}
                            <div
                                className={`text-center mb-12 transform transition-all duration-1000 delay-${categoryIndex * 200} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <IconComponent className="h-8 w-8 text-amber-400"/>
                                    <h2 className="text-3xl md:text-4xl font-light text-slate-100 tracking-wide">{category.name}</h2>
                                </div>
                                <div
                                    className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
                            </div>

                            {/* Category Items */}
                            <div className="grid gap-6">
                                {categoryItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-500 transform hover:scale-102 hover:shadow-xl hover:shadow-amber-500/10 ${
                                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                        }`}
                                        style={{transitionDelay: `${(categoryIndex * 200) + (index * 100)}ms`}}
                                    >
                                        <div
                                            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-light text-slate-100 tracking-wide">{item.name}</h3>
                                                            <div className="flex gap-2">
                                                                {item.chef_special && (
                                                                    <div
                                                                        className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/30">
                                                                        <Award className="h-3 w-3"/>
                                                                        <span
                                                                            className="text-xs">{`Chef's Special`}</span>
                                                                    </div>
                                                                )}
                                                                {item.seasonal && (
                                                                    <div
                                                                        className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">
                                                                        <Leaf className="h-3 w-3"/>
                                                                        <span className="text-xs">Seasonal</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-300 text-sm leading-relaxed font-light mb-3">{item.description}</p>

                                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3"/>
                                                                <span>{item.prep_time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.dietary.length > 0 && (
                                                    <div className="flex gap-2 mt-3">
                                                        {item.dietary.map((diet, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`text-xs px-2 py-1 rounded-full border ${getDietaryBadgeColor(item.dietary)}`}
                                                            >
                                {diet}
                              </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="lg:text-right lg:ml-6">
                                                <span
                                                    className="text-2xl font-light text-amber-400">${item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer CTA */}
            <div className="relative z-10 py-20 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-wide text-slate-100">Ready to
                        Dine?</h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Reserve your table and experience the finest mountain cuisine
                    </p>
                    <button
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 px-12 py-4 text-lg font-light tracking-wide rounded-full shadow-lg hover:shadow-amber-500/25 transition-all duration-500 hover:scale-110">
                        Make a Reservation
                    </button>
                </div>
            </div>
        </div>
    );
};

