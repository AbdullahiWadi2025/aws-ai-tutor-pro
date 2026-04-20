import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function AchievementsCard() {
  const { user } = useAuth();

  // Get all achievements
  const allAchievementsQuery = trpc.gamification.getAllAchievements.useQuery();

  // Get user's unlocked achievements
  const userAchievementsQuery = trpc.gamification.getUserAchievements.useQuery({
    userId: user?.id || 0,
  });

  const allAchievements = allAchievementsQuery.data || [];
  const unlockedIds = new Set(
    (userAchievementsQuery.data || []).map((a) => a.achievementId)
  );

  const unlockedAchievements = allAchievements.filter((a) =>
    unlockedIds.has(a.id)
  );
  const lockedAchievements = allAchievements.filter(
    (a) => !unlockedIds.has(a.id)
  );

  if (allAchievements.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {unlockedAchievements.length} of {allAchievements.length} unlocked
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-green-900">
                Unlocked
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 rounded-lg bg-green-50 p-2"
                  >
                    <span className="text-2xl">{achievement.icon || "⭐"}</span>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-green-900">
                        {achievement.name}
                      </p>
                      <p className="text-xs text-green-700">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Locked
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {lockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 opacity-60"
                  >
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-700">
                        {achievement.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {achievement.requirement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
