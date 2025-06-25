import { Card } from "@/components/ui/card";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { Link } from "wouter";
import { 
  Wrench, Zap, Home, Snowflake, Layers, 
  UtensilsCrossed, Bath, PaintBucket, Leaf,
  Square, DoorOpen, TreePine, Hammer,
  Building, Shield
} from "lucide-react";

const iconMap = {
  "wrench": Wrench,
  "bolt": Zap,
  "home": Home,
  "snowflake": Snowflake,
  "layer-group": Layers,
  "utensils": UtensilsCrossed,
  "bath": Bath,
  "paint-roller": PaintBucket,
  "seedling": Leaf,
  "square": Square,
  "door-open": DoorOpen,
  "tree": TreePine,
  "tools": Hammer,
  "building": Building,
  "shield-alt": Shield,
};

const colorMap = {
  blue: "from-blue-50 to-blue-100 bg-blue-600",
  orange: "from-orange-50 to-orange-100 bg-orange-600",
  green: "from-green-50 to-green-100 bg-green-600",
  purple: "from-purple-50 to-purple-100 bg-purple-600",
  yellow: "from-yellow-50 to-yellow-100 bg-yellow-600",
  indigo: "from-indigo-50 to-indigo-100 bg-indigo-600",
  pink: "from-pink-50 to-pink-100 bg-pink-600",
  red: "from-red-50 to-red-100 bg-red-600",
  gray: "from-gray-50 to-gray-100 bg-gray-600",
  brown: "from-amber-50 to-amber-100 bg-amber-600",
  stone: "from-stone-50 to-stone-100 bg-stone-600",
  teal: "from-teal-50 to-teal-100 bg-teal-600",
};

export default function ProjectCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Project Categories</h2>
          <p className="text-xl text-gray-600">Find contractors for any type of home improvement project</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {PROJECT_CATEGORIES.map((category) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Hammer;
            const colors = colorMap[category.color as keyof typeof colorMap] || colorMap.gray;
            const [gradientColors, iconBgColor] = colors.split(' bg-');
            
            return (
              <Link key={category.id} href={`/find-contractors?category=${category.id}`}>
                <Card className={`bg-gradient-to-br ${gradientColors} p-6 hover-lift cursor-pointer transition-all duration-300`}>
                  <div className={`w-12 h-12 bg-${iconBgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
