import test from "node:test";
import assert from "node:assert/strict";
import { getDateParts, getRouteKey, getTotalCasualties, getVesselAge, getVesselAgeBand } from "./metrics.ts";

test("date grouping uses incident date parts", () => {
  const parts = getDateParts("2026-03-10T06:40:00Z");
  assert.equal(parts.incidentYear, 2026);
  assert.equal(parts.incidentQuarter, "Q1");
  assert.equal(parts.incidentMonth, 3);
  assert.equal(parts.incidentMonthKey, "2026-03");
  assert.equal(parts.incidentMonthLabel, "Mar 26");
});

test("casualty totals sum fatalities and injuries", () => {
  assert.equal(getTotalCasualties({ fatalities: 3, injuries: 7 }), 10);
  assert.equal(getTotalCasualties({ fatalities: 0, injuries: 0 }), 0);
});

test("vessel age bands are derived from incident year minus year built", () => {
  const age = getVesselAge("2026-03-10T06:40:00Z", 2008);
  assert.equal(age, 18);
  assert.equal(getVesselAgeBand(age), "11-20");
  assert.equal(getVesselAgeBand(getVesselAge("2026-03-10T06:40:00Z", 2023)), "0-5");
  assert.equal(getVesselAgeBand(null), "Unknown");
});

test("route key normalization collapses case and whitespace", () => {
  assert.equal(getRouteKey("  Batangas ", " CALAPAN "), "batangas -> calapan");
  assert.equal(getRouteKey("Batangas", undefined), "unknown / incomplete");
});
