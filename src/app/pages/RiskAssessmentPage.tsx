import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../components/ui/utils";
import {
  additionalHardStopIndicators,
  createDefaultRiskAssessmentInputs,
  evaluateRiskAssessment,
  manualReviewIndicator,
  type RiskAssessmentInputs,
  type RiskBandId,
  type RiskBooleanInputKey,
  type RiskCategoryId,
  type RiskCategoryResult,
  type RiskIndicatorDefinition,
  type RiskIndicatorResult,
} from "../riskAssessment/model";

type RiskAssessmentFormState = Omit<RiskAssessmentInputs, "personsAboard" | "vesselAgeYears"> & {
  personsAboard: string;
  vesselAgeYears: string;
};

const bandStyles: Record<RiskBandId, { badge: string; panel: string; bar: string }> = {
  low: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    panel: "border-emerald-200 bg-emerald-50/70",
    bar: "bg-emerald-600",
  },
  moderate: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    panel: "border-amber-200 bg-amber-50/70",
    bar: "bg-amber-500",
  },
  high: {
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    panel: "border-orange-200 bg-orange-50/70",
    bar: "bg-orange-500",
  },
  critical: {
    badge: "border-red-200 bg-red-50 text-red-700",
    panel: "border-red-200 bg-red-50/70",
    bar: "bg-red-600",
  },
};

function createDefaultFormState(): RiskAssessmentFormState {
  return {
    ...createDefaultRiskAssessmentInputs(),
    personsAboard: "",
    vesselAgeYears: "",
  };
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function getDerivedPersonsAboardText(value: number | null) {
  if (value === null) {
    return "No passenger-count rule applied yet.";
  }

  if (value > 100) {
    return "Persons aboard >100: +4";
  }

  if (value >= 13) {
    return "Persons aboard 13-100: +2";
  }

  return "Persons aboard below 13: +0";
}

function getDerivedVesselAgeText(value: number | null) {
  if (value === null) {
    return "No age-band rule applied yet.";
  }

  if (value > 30) {
    return "Age >30 years: +6";
  }

  if (value >= 21) {
    return "Age 21-30 years: +4";
  }

  if (value >= 10) {
    return "Age 10-20 years: +2";
  }

  return "Age below 10 years: +0";
}

function getSectionDefinitions(categoryResults: Record<RiskCategoryId, RiskCategoryResult>) {
  return [
    {
      step: 1,
      title: "Voyage basics",
      categories: [categoryResults.consequenceProfile, categoryResults.vesselCondition],
    },
    {
      step: 2,
      title: "Compliance and stop conditions",
      categories: [categoryResults.statutoryCompliance],
    },
    {
      step: 3,
      title: "History and exposure",
      categories: [
        categoryResults.incidentRecurrence,
        categoryResults.operatorFleetPerformance,
        categoryResults.routeExposure,
        categoryResults.weatherExposure,
      ],
    },
  ];
}

function CompactCheckboxRow({
  indicator,
  checked,
  onChange,
}: {
  indicator: RiskIndicatorDefinition | RiskIndicatorResult;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        checked ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50",
        indicator.hardStop && "border-red-200 bg-red-50/60 hover:bg-red-50",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(next) => onChange(next === true)} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-900">{indicator.label}</span>
          {indicator.hardStop && (
            <Badge variant="outline" className="border-red-200 bg-white text-red-700">
              Hard stop
            </Badge>
          )}
        </div>
      </div>
      <div className="shrink-0 text-sm font-medium text-slate-700">
        {indicator.weight > 0 ? `+${indicator.weight}` : "Override"}
      </div>
    </label>
  );
}

function CalculatorGroup({
  category,
  formState,
  onToggle,
}: {
  category: RiskCategoryResult;
  formState: RiskAssessmentFormState;
  onToggle: (key: RiskBooleanInputKey, checked: boolean) => void;
}) {
  const checkboxIndicators = category.indicators.filter((indicator) => indicator.inputKey);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm text-slate-900">{category.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{category.description}</p>
        </div>
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
          {category.score} / {category.cap}
        </Badge>
      </div>
      <div className="space-y-2">
        {checkboxIndicators.map((indicator) => (
          <CompactCheckboxRow
            key={indicator.id}
            indicator={indicator}
            checked={formState[indicator.inputKey!]}
            onChange={(checked) => onToggle(indicator.inputKey!, checked)}
          />
        ))}
      </div>
    </div>
  );
}

export function RiskAssessmentPage() {
  const [formState, setFormState] = useState<RiskAssessmentFormState>(() => createDefaultFormState());

  const normalizedInputs = useMemo<RiskAssessmentInputs>(
    () => ({
      ...formState,
      personsAboard: parseOptionalNumber(formState.personsAboard),
      vesselAgeYears: parseOptionalNumber(formState.vesselAgeYears),
    }),
    [formState],
  );

  const assessment = useMemo(() => evaluateRiskAssessment(normalizedInputs), [normalizedInputs]);
  const categoryResults = useMemo(
    () =>
      Object.fromEntries(
        assessment.categoryResults.map((category) => [category.id, category]),
      ) as Record<RiskCategoryId, RiskCategoryResult>,
    [assessment.categoryResults],
  );
  const sections = useMemo(() => getSectionDefinitions(categoryResults), [categoryResults]);
  const style = bandStyles[assessment.band.id];

  const handleBooleanChange = (key: RiskBooleanInputKey, checked: boolean) => {
    setFormState((current) => ({ ...current, [key]: checked }));
  };

  const handleNumericChange = (key: "personsAboard" | "vesselAgeYears", value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl text-slate-900">Risk Assessment</h1>
          <p className="max-w-3xl text-slate-600">
            A simple calculator aligned with the workbook logic sheet. Complete the checklist, then read the live risk
            score and action band.
          </p>
        </div>
        <Button variant="outline" onClick={() => setFormState(createDefaultFormState())}>
          Reset
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Work through the three sections and tick only the conditions that clearly apply.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm text-white">1</div>
                <div>
                  <h2 className="text-sm text-slate-900">Voyage basics</h2>
                  <p className="text-xs text-slate-500">Set the two derived fields first, then tick consequence and condition signals.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <Label htmlFor="personsAboard">Persons aboard</Label>
                  <Input
                    id="personsAboard"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={formState.personsAboard}
                    onChange={(event) => handleNumericChange("personsAboard", event.target.value)}
                    placeholder="e.g. 84"
                    className="mt-3"
                  />
                  <p className="mt-2 text-xs text-slate-500">{getDerivedPersonsAboardText(normalizedInputs.personsAboard)}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <Label htmlFor="vesselAgeYears">Vessel age (years)</Label>
                  <Input
                    id="vesselAgeYears"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={formState.vesselAgeYears}
                    onChange={(event) => handleNumericChange("vesselAgeYears", event.target.value)}
                    placeholder="e.g. 23"
                    className="mt-3"
                  />
                  <p className="mt-2 text-xs text-slate-500">{getDerivedVesselAgeText(normalizedInputs.vesselAgeYears)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {sections[0].categories.map((category) => (
                  <CalculatorGroup
                    key={category.id}
                    category={category}
                    formState={formState}
                    onToggle={handleBooleanChange}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm text-white">2</div>
                <div>
                  <h2 className="text-sm text-slate-900">Compliance and stop conditions</h2>
                  <p className="text-xs text-slate-500">This section carries the strongest escalation logic from the workbook.</p>
                </div>
              </div>

              <CalculatorGroup
                category={sections[1].categories[0]}
                formState={formState}
                onToggle={handleBooleanChange}
              />

              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm text-red-700">Hard-stop overrides</h3>
                      <p className="mt-1 text-xs text-slate-600">Any checked item here forces a critical result.</p>
                    </div>
                    <Badge variant="outline" className="border-red-200 bg-white text-red-700">
                      Override
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {additionalHardStopIndicators.map((indicator) => (
                      <CompactCheckboxRow
                        key={indicator.id}
                        indicator={indicator}
                        checked={formState[indicator.inputKey!]}
                        onChange={(checked) => handleBooleanChange(indicator.inputKey!, checked)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div>
                    <h3 className="text-sm text-slate-900">Data sufficiency</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      The logic sheet allows this to work as a manual-review flag. This calculator keeps it as a flag, not a score.
                    </p>
                  </div>
                  <CompactCheckboxRow
                    indicator={manualReviewIndicator}
                    checked={formState.insufficientLeadingIndicatorData}
                    onChange={(checked) => handleBooleanChange("insufficientLeadingIndicatorData", checked)}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm text-white">3</div>
                <div>
                  <h2 className="text-sm text-slate-900">History and exposure</h2>
                  <p className="text-xs text-slate-500">Add only the recurrence, operator, route, and weather signals you can support.</p>
                </div>
              </div>

              <div className="space-y-4">
                {sections[2].categories.map((category) => (
                  <CalculatorGroup
                    key={category.id}
                    category={category}
                    formState={formState}
                    onToggle={handleBooleanChange}
                  />
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className={style.panel}>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Live score and MARINA action band.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className={cn("border", style.badge)}>
                  {assessment.band.label}
                </Badge>
                <div className="text-sm text-slate-600">{assessment.totalScore} / 100</div>
              </div>

              <div className="space-y-2">
                <div className="text-4xl leading-none text-slate-900">{assessment.totalScore}</div>
                <p className="text-sm font-medium text-slate-900">{assessment.band.detail}</p>
                <p className="text-sm text-slate-600">{assessment.band.action}</p>
              </div>

              {assessment.hardStopTriggered && (
                <div className="rounded-lg border border-red-200 bg-white/80 p-3">
                  <div className="text-sm font-medium text-red-700">Hard stop active</div>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {assessment.hardStopIndicators.map((indicator) => (
                      <li key={indicator.id}>{indicator.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.manualReviewRequired && (
                <div className="rounded-lg border border-amber-200 bg-white/80 p-3 text-sm text-slate-700">
                  Manual review required due to missing leading-indicator data.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section scores</CardTitle>
              <CardDescription>Category caps follow the workbook.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assessment.categoryResults.map((category) => (
                <div key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700">{category.title}</span>
                    <span className="text-slate-900">
                      {category.score} / {category.cap}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn("h-full rounded-full", style.bar)}
                      style={{ width: `${(category.score / category.cap) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
