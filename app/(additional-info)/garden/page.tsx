import {GardenClientPage} from "@/app/(additional-info)/garden/clientPage";


const gardenSections = [
    {
        id: 1,
        name: "Stone Garden",
        nameJp: "Karesansui",
        description:
            "A contemplative dry landscape representing the essence of nature through carefully placed stones and raked gravel",
        philosophy:
            "The stones represent mountains, the raked gravel symbolizes water - teaching us to see the infinite in the finite.",
        icon: "Compass", // Changed to string
        imageUrl: "/stone_garden.jpg",
        features: ["15 carefully selected stones", "Daily raking ceremony", "Meditation benches", "Viewing pavilion"],
        bestTime: "Early morning or late afternoon",
        symbolism: "Represents the eternal flow of time and the impermanence of all things",
    },
    {
        id: 2,
        name: "Moon Viewing Garden",
        nameJp: "Tsukimi-niwa",
        description:
            "Designed specifically for contemplating the moon's phases, with strategic plantings and water features",
        philosophy: "The moon's reflection in still water teaches us about the nature of reality and illusion.",
        icon: "Moon", // Changed to string
        imageUrl: "/moon_garden.jpg",
        features: ["Reflective pond", "Moon-viewing platform", "Night-blooming flowers", "Bamboo wind chimes"],
        bestTime: "Evening and night hours",
        symbolism: "Celebrates the beauty of transience and the cyclical nature of existence",
    },
    {
        id: 3,
        name: "Tea Garden",
        nameJp: "Roji",
        description: "A humble path leading to the tea house, designed to purify the mind before the tea ceremony",
        philosophy:
            "Each step on the roji path represents leaving behind worldly concerns to enter a space of pure presence.",
        icon: "Flower2", // Changed to string
        imageUrl: "/tea_garden.jpg",
        features: ["Stone stepping path", "Purification basin", "Seasonal plantings", "Traditional tea house"],
        bestTime: "Morning tea ceremonies",
        symbolism: "The journey from the outer world to inner peace through mindful walking",
    },
    {
        id: 4,
        name: "Waterfall Meditation",
        nameJp: "Taki-gyō",
        description: "A natural waterfall creates a powerful meditation space for contemplating the flow of existence",
        philosophy: "The constant flow of water reminds us that change is the only constant in life.",
        icon: "Waves", // Changed to string
        imageUrl: "/waterfall.jpg",
        features: ["Natural waterfall", "Meditation stones", "Moss-covered rocks", "Sound therapy"],
        bestTime: "Any time for meditation",
        symbolism: "Represents purification, renewal, and the power of persistent gentle action",
    },
    {
        id: 5,
        name: "Sunrise Garden",
        nameJp: "Asahi-niwa",
        description: "Positioned to capture the first light of dawn, this garden celebrates new beginnings and hope",
        philosophy: "Each sunrise offers a fresh start, a reminder that every moment holds infinite possibility.",
        icon: "Sun", // Changed to string
        imageUrl: "/sunrise_garden.jpg",
        features: ["Eastern orientation", "Dawn meditation area", "Morning glory flowers", "Sunrise viewing deck"],
        bestTime: "Dawn and early morning",
        symbolism: "Embodies renewal, hope, and the eternal return of light after darkness",
    },
    {
        id: 6,
        name: "Forest Path",
        nameJp: "Mori-no-michi",
        description: "A winding path through ancient pines and maples, designed for walking meditation",
        philosophy: "Walking among ancient trees connects us to the wisdom of ages and the patience of nature.",
        icon: "TreePine", // Changed to string
        imageUrl: "/forest_trail.jpg",
        features: ["Ancient pine trees", "Seasonal foliage", "Meditation clearings", "Natural benches"],
        bestTime: "All seasons offer unique beauty",
        symbolism: "Represents growth, endurance, and the interconnectedness of all living things",
    },
];

export default function GardenPage() {
    return <GardenClientPage gardenSections={gardenSections} />
}
