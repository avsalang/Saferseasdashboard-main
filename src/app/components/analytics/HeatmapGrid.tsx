import { cn } from "../ui/utils";

interface HeatmapCell {
  key: string;
  value: number;
  text: string;
}

interface HeatmapRow {
  label: string;
  cells: HeatmapCell[];
}

interface HeatmapGridProps {
  columns: string[];
  rows: HeatmapRow[];
  valueLabel: string;
  palette?: "blue" | "teal" | "amber" | "rose";
  onCellClick?: (rowLabel: string, columnKey: string) => void;
}

function getPalette(value: number, maxValue: number, palette: HeatmapGridProps["palette"]) {
  if (!maxValue || value <= 0) {
    return "bg-slate-50 text-slate-500";
  }

  const ratio = value / maxValue;
  if (palette === "teal") {
    if (ratio >= 0.75) return "bg-teal-700 text-white";
    if (ratio >= 0.5) return "bg-teal-500 text-white";
    if (ratio >= 0.25) return "bg-teal-200 text-teal-950";
    return "bg-teal-100 text-teal-900";
  }
  if (palette === "amber") {
    if (ratio >= 0.75) return "bg-amber-600 text-white";
    if (ratio >= 0.5) return "bg-amber-400 text-amber-950";
    if (ratio >= 0.25) return "bg-amber-200 text-amber-950";
    return "bg-amber-100 text-amber-900";
  }
  if (palette === "rose") {
    if (ratio >= 0.75) return "bg-rose-700 text-white";
    if (ratio >= 0.5) return "bg-rose-500 text-white";
    if (ratio >= 0.25) return "bg-rose-200 text-rose-950";
    return "bg-rose-100 text-rose-900";
  }

  if (ratio >= 0.75) return "bg-blue-700 text-white";
  if (ratio >= 0.5) return "bg-blue-500 text-white";
  if (ratio >= 0.25) return "bg-blue-200 text-blue-950";
  return "bg-blue-100 text-blue-900";
}

export function HeatmapGrid({ columns, rows, valueLabel, palette = "blue", onCellClick }: HeatmapGridProps) {
  const maxValue = Math.max(...rows.flatMap((row) => row.cells.map((cell) => cell.value)), 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[640px] gap-2"
          style={{ gridTemplateColumns: `180px repeat(${columns.length}, minmax(72px, 1fr))` }}
        >
          <div />
          {columns.map((column) => (
            <div key={column} className="px-2 text-center text-xs text-slate-500">
              {column}
            </div>
          ))}

          {rows.map((row) => (
            <div key={row.label} className="contents">
              <div className="flex items-center pr-3 text-sm text-slate-700">{row.label}</div>
              {row.cells.map((cell) => (
                <button
                  type="button"
                  key={`${row.label}-${cell.key}`}
                  className={cn(
                    "flex min-h-14 items-center justify-center rounded-lg border border-white/50 px-2 text-sm font-medium shadow-sm",
                    onCellClick ? "cursor-pointer transition-transform hover:scale-[1.01]" : "cursor-default",
                    getPalette(cell.value, maxValue, palette),
                  )}
                  title={`${row.label} · ${cell.key}: ${cell.text} ${valueLabel}`}
                  onClick={() => onCellClick?.(row.label, cell.key)}
                  disabled={!onCellClick}
                >
                  {cell.text}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>Lower</span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("w-1/4", getPalette(maxValue * 0.15, maxValue, palette))} />
          <div className={cn("w-1/4", getPalette(maxValue * 0.35, maxValue, palette))} />
          <div className={cn("w-1/4", getPalette(maxValue * 0.6, maxValue, palette))} />
          <div className={cn("w-1/4", getPalette(maxValue, maxValue, palette))} />
        </div>
        <span>Higher {valueLabel}</span>
      </div>
    </div>
  );
}
