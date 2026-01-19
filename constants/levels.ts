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
    maxPoints: 499,
    icon: "search",
    color: "#3B82F6",
    description: "Entry level - Just starting your bourbon journey",
  },
  {
    id: "enthusiast",
    name: "Enthusiast",
    minPoints: 500,
    maxPoints: 1999,
    icon: "wine",
    color: "#8B5CF6",
    description: "Developing your palate - Access to bonus drops",
  },
  {
    id: "connoisseur",
    name: "Connoisseur",
    minPoints: 2000,
    maxPoints: 4999,
    icon: "glass-water",
    color: "#F59E0B",
    description: "A true bourbon aficionado - Early alerts",
  },
  {
    id: "master",
    name: "Master",
    minPoints: 5000,
    maxPoints: Infinity,
    icon: "crown",
    color: "#EF4444",
    description: "Elite bourbon hunter - Exclusive rewards",
  },
];

export interface LevelPointRewards {
  checkIn: number;
  qrScan: number;
  bottleFindShare: number;
  photoUpload: number;
  reviewComment: number;
}

export const LEVEL_POINT_REWARDS: Record<string, LevelPointRewards> = {
  explorer: {
    checkIn: 10,
    qrScan: 5,
    bottleFindShare: 25,
    photoUpload: 10,
    reviewComment: 5,
  },
  enthusiast: {
    checkIn: 15,
    qrScan: 10,
    bottleFindShare: 40,
    photoUpload: 15,
    reviewComment: 10,
  },
  connoisseur: {
    checkIn: 20,
    qrScan: 15,
    bottleFindShare: 60,
    photoUpload: 25,
    reviewComment: 15,
  },
  master: {
    checkIn: 25,
    qrScan: 20,
    bottleFindShare: 100,
    photoUpload: 40,
    reviewComment: 25,
  },
};

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
