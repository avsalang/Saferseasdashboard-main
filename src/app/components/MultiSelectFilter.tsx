import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function buildOptions(values: string[], preferredOrder?: string[]) {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));

  if (!preferredOrder) {
    return uniqueValues.sort((left, right) => left.localeCompare(right));
  }

  return uniqueValues.sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left);
    const rightIndex = preferredOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  });
}

function summarizeSelection(selected: string[], options: string[]) {
  if (!options.length) {
    return "No options";
  }

  if (selected.length === options.length) {
    return "All";
  }

  if (!selected.length) {
    return "None";
  }

  if (selected.length <= 2) {
    return selected.join(", ");
  }

  return `${selected.length} selected`;
}

function orderSelectedValues(selected: string[], options: string[]) {
  return options.filter((option) => selected.includes(option));
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const summary = summarizeSelection(selected, options);

  const updateSelection = (option: string, checked: boolean) => {
    const next = checked
      ? [...selected, option]
      : selected.filter((value) => value !== option);
    onChange(orderSelectedValues(next, options));
  };

  return (
    <div>
      <div className="text-sm text-slate-600 mb-2">{label}</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start font-normal text-left">
            <span className="truncate">{summary}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div>
              <div className="text-sm text-slate-900">{label}</div>
              <div className="text-xs text-slate-500">{selected.length} of {options.length} selected</div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onChange(options)}>
                All
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onChange([])}>
                Clear
              </Button>
            </div>
          </div>

          <ScrollArea className="h-60">
            <div className="space-y-2 p-3">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={(checked) => updateSelection(option, checked === true)}
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
