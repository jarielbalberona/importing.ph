import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
