import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingDown, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudyRecommendationsProps {
  certification: "SAA-C03" | "CLF-C02";
}

export function StudyRecommendations({ certification }: StudyRecommendationsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get weak topics
  const weakTopicsQuery = trpc.gamification.getWeakTopics.useQuery({
    certification,
    limit: 5,
  });

  // Get study recommendations
  const recommendationsQuery = trpc.gamification.getRecommendations.useQuery({
    certification,
  });

  // Refresh recommendations mutation
  const refreshMutation = trpc.gamification.refreshRecommendations.useMutation({
    onSuccess: () => {
      recommendationsQuery.refetch();
      weakTopicsQuery.refetch();
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    },
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshMutation.mutate({ certification });
  };

  const recommendations = recommendationsQuery.data || [];
  const weakTopics = weakTopicsQuery.data || [];

  if (weakTopics.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <span className="text-2xl">🎉</span>
            Great Performance!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-800">
            You're doing well across all topics. Keep practicing to maintain your knowledge!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <div>
                <CardTitle>Areas to Improve</CardTitle>
                <CardDescription>
                  Focus on these topics to boost your score
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || refreshMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isRefreshing ? "Updating..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-200 text-sm font-semibold text-orange-900">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900">{rec.topic}</h4>
                    <p className="text-sm text-orange-800">{rec.reason}</p>
                    {rec.accuracy && (
                      <p className="mt-1 text-xs text-orange-700">
                        Current accuracy: {rec.accuracy}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Take more exams to get personalized recommendations
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Weak Topics Summary */}
      {weakTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weak Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {weakTopics.map((topic) => (
                <div
                  key={topic.topic}
                  className="rounded-lg bg-red-50 p-3 text-sm"
                >
                  <p className="font-medium text-red-900">{topic.topic}</p>
                  <p className="text-xs text-red-700">
                    Accuracy: {topic.accuracy}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
