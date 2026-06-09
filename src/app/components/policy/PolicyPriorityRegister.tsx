import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { PolicyPriorityItem } from "../../analytics/types";

interface PolicyPriorityRegisterProps {
  items: PolicyPriorityItem[];
  selected: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
  onOpen: (item: PolicyPriorityItem) => void;
}

export function PolicyPriorityRegister({ items, selected, onToggle, onOpen }: PolicyPriorityRegisterProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Export</TableHead>
            <TableHead>Review Area</TableHead>
            <TableHead>Evidence Signal</TableHead>
            <TableHead>Supporting Figure</TableHead>
            <TableHead>Recommended Follow-up</TableHead>
            <TableHead>Responsible Unit</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Data Limitation</TableHead>
            <TableHead className="text-right">Cases</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex justify-center">
                  <Checkbox checked={selected[item.id] ?? item.includeInExport} onCheckedChange={(checked) => onToggle(item.id, checked === true)} />
                </div>
              </TableCell>
              <TableCell className="text-slate-900">{item.reviewArea}</TableCell>
              <TableCell className="text-slate-600 min-w-[280px]">{item.evidenceSignal}</TableCell>
              <TableCell className="text-slate-600">{item.supportingFigureId}</TableCell>
              <TableCell className="text-slate-600 min-w-[240px]">{item.recommendedFollowUp}</TableCell>
              <TableCell className="text-slate-600">{item.responsibleUnit ?? "Review team"}</TableCell>
              <TableCell className="text-slate-900">{item.confidence}</TableCell>
              <TableCell className="text-slate-600 min-w-[220px]">{item.dataLimitation}</TableCell>
              <TableCell className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-700 hover:underline"
                  onClick={() => onOpen(item)}
                >
                  Open cases
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
