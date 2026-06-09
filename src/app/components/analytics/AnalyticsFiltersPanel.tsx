import { MultiSelectFilter } from "../MultiSelectFilter";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { ActiveFilters, FilterOptions } from "../../analytics/types";
import { QUARTER_OPTIONS } from "../../analytics/constants";

interface AnalyticsFiltersPanelProps {
  filters: ActiveFilters;
  options: FilterOptions;
  recordCount: number;
  onChange: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void;
  onReset: () => void;
  description: string;
}

export function AnalyticsFiltersPanel({
  filters,
  options,
  recordCount,
  onChange,
  onReset,
  description,
}: AnalyticsFiltersPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="outline" onClick={onReset} className="lg:self-center">
            Reset filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <div className="mb-2 text-sm text-slate-600">Year</div>
            <Select value={filters.year} onValueChange={(value) => onChange("year", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {options.years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-2 text-sm text-slate-600">Quarter</div>
            <Select value={filters.quarter} onValueChange={(value) => onChange("quarter", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUARTER_OPTIONS.map((quarter) => (
                  <SelectItem key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MultiSelectFilter label="Incident Type" options={options.incidentTypes} selected={filters.incidentTypes} onChange={(value) => onChange("incidentTypes", value)} />
          <MultiSelectFilter label="Severity" options={options.severities} selected={filters.severities} onChange={(value) => onChange("severities", value)} />
          <MultiSelectFilter label="Province" options={options.provinces} selected={filters.provinces} onChange={(value) => onChange("provinces", value)} />
          <MultiSelectFilter label="Vessel Type" options={options.vesselTypes} selected={filters.vesselTypes} onChange={(value) => onChange("vesselTypes", value)} />
          <MultiSelectFilter label="Reporting Channel" options={options.reportingChannels} selected={filters.reportingChannels} onChange={(value) => onChange("reportingChannels", value)} />
          <MultiSelectFilter label="Authority" options={options.authorities} selected={filters.authorities} onChange={(value) => onChange("authorities", value)} />
          <MultiSelectFilter label="Review Status" options={options.reviewStatuses} selected={filters.reviewStatuses} onChange={(value) => onChange("reviewStatuses", value)} />
          <MultiSelectFilter label="Route / OD Pair" options={options.routeLabels} selected={filters.routeLabels} onChange={(value) => onChange("routeLabels", value)} />
          <MultiSelectFilter label="Cause Category" options={options.causeCategories} selected={filters.causeCategories} onChange={(value) => onChange("causeCategories", value)} />
          <MultiSelectFilter label="Weather Condition" options={options.weatherCategories} selected={filters.weatherCategories} onChange={(value) => onChange("weatherCategories", value)} />
          <MultiSelectFilter label="Vessel Age Band" options={options.vesselAgeBands} selected={filters.vesselAgeBands} onChange={(value) => onChange("vesselAgeBands", value)} />
          <MultiSelectFilter label="Linked Evidence Status" options={options.linkedEvidenceStatuses} selected={filters.linkedEvidenceStatuses} onChange={(value) => onChange("linkedEvidenceStatuses", value)} />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500 mb-1">Current selection</div>
          <div className="text-lg text-slate-900">{recordCount} records</div>
          <div className="mt-1 text-sm text-slate-500">
            {filters.year === "all" ? "All years" : filters.year} · {filters.quarter === "all" ? "All quarters" : filters.quarter}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
