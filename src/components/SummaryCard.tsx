import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  summary: string;
};

export function SummaryCard({ summary }: Props) {
  return (
    <Card className="border-l-4 border-l-primary bg-primary/5">
      <CardContent className="flex gap-3 py-4">
        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}
