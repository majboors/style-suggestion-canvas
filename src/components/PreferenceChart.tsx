
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Preferences {
  Classic: number;
  Creative: number;
  Fashionista: number;
  Sophisticated: number;
  Romantic: number;
  Natural: number;
  Modern: number;
  Glam: number;
  Streetstyle: number;
}

interface PreferenceChartProps {
  preferences: Preferences | null;
  isLoading: boolean;
}

const PreferenceChart = ({ preferences, isLoading }: PreferenceChartProps) => {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (preferences) {
      const data = Object.entries(preferences).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }));
      
      // Sort data by value in descending order
      const sortedData = [...data].sort((a, b) => b.value - a.value);
      setChartData(sortedData);
    }
  }, [preferences]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Style Preferences</CardTitle>
          <CardDescription>Loading your style profile...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full animate-appear">
      <CardHeader>
        <CardTitle>Style Preferences</CardTitle>
        <CardDescription>Your current style profile based on your likes and dislikes</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 25, right: 25, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Preference Score']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#0071e3"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p>No preference data available yet</p>
            <p className="text-sm mt-2">Like or dislike more suggestions to build your profile</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferenceChart;
