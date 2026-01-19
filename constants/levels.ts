export interface Level {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: "search" | "wine" | "glass-water" | "crown";
  color: string;
  description: string;
}

export const LEVELS: Level[] = [
  {
    id: "explorer",
    name: "Explorer",
    minPoints: 0,
    maxPoints: 99,
    icon: "search",
    color: "#3B82F6",
    description: "Just starting your bourbon journey",
  },
  {
    id: "enthusiast",
    name: "Enthusiast",
    minPoints: 100,
    maxPoints: 499,
    icon: "wine",
    color: "#8B5CF6",
    description: "Developing your palate",
  },
  {
    id: "connoisseur",
    name: "Connoisseur",
    minPoints: 500,
    maxPoints: 999,
    icon: "glass-water",
    color: "#F59E0B",
    description: "A true bourbon aficionado",
  },
  {
    id: "master",
    name: "Master",
    minPoints: 1000,
    maxPoints: Infinity,
    icon: "crown",
    color: "#EF4444",
    description: "Elite bourbon hunter",
  },
];

export const POINT_REWARDS = {
  ADD_FIND: 50,
  ADD_STORE: 20,
  ADD_SPEAKEASY: 30,
  SHARE_FIND: 10,
  FRIEND_REQUEST_ACCEPTED: 5,
};

export function getUserLevel(points: number): Level {
  return (
    LEVELS.find((level) => points >= level.minPoints && points <= level.maxPoints) ||
    LEVELS[0]
  );
}

export function getLevelProgress(points: number): number {
  const level = getUserLevel(points);
  if (level.maxPoints === Infinity) return 100;
  
  const levelRange = level.maxPoints - level.minPoints + 1;
  const pointsInLevel = points - level.minPoints;
  return Math.min((pointsInLevel / levelRange) * 100, 100);
}

export function getPointsToNextLevel(points: number): number {
  const level = getUserLevel(points);
  if (level.maxPoints === Infinity) return 0;
  return level.maxPoints - points + 1;
}
