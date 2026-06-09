import { Card, CardContent } from "../ui/card";

interface CaveatBannerProps {
  text: string;
  tone?: "neutral" | "warning";
}

export function CaveatBanner({ text, tone = "neutral" }: CaveatBannerProps) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <Card className={toneClasses}>
      <CardContent className="px-4 py-3 text-sm">
        {text}
      </CardContent>
    </Card>
  );
}
