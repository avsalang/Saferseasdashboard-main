import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface KpiCardProps {
  title: string;
  value: string | number;
  context: string;
  formula: string;
  accentClassName?: string;
}

export function KpiCard({ title, value, context, formula, accentClassName = "text-slate-900" }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm text-slate-700">{title}</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-xs text-slate-500 underline decoration-dotted underline-offset-4">
                Formula
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-xs bg-slate-900 text-white">
              {formula}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl ${accentClassName}`}>{value}</div>
        <p className="mt-1 text-sm text-slate-500">{context}</p>
      </CardContent>
    </Card>
  );
}
