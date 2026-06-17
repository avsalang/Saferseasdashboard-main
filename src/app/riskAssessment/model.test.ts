import test from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultRiskAssessmentInputs,
  evaluateRiskAssessment,
  getRiskBandFromScore,
} from "./model.ts";

test("risk assessment caps category scores and derives age and persons aboard thresholds", () => {
  const inputs = createDefaultRiskAssessmentInputs();
  inputs.personsAboard = 160;
  inputs.vesselAgeYears = 34;
  inputs.passengerOrRoroPassenger = true;
  inputs.tankerChemicalOrHnsCargo = true;
  inputs.pollutionSensitiveCargoOrWaters = true;
  inputs.classLapsedOrNoClass = true;
  inputs.overdueDrydockOrSurvey = true;

  const result = evaluateRiskAssessment(inputs);
  const consequence = result.categoryResults.find((category) => category.id === "consequenceProfile");
  const vesselCondition = result.categoryResults.find((category) => category.id === "vesselCondition");

  assert.ok(consequence);
  assert.equal(consequence.score, 15);
  assert.equal(consequence.rawScore, 18);
  assert.equal(
    consequence.triggeredIndicators.some((indicator) => indicator.id === "personsAboardOver100"),
    true,
  );
  assert.equal(
    consequence.triggeredIndicators.some((indicator) => indicator.id === "personsAboard13to100"),
    false,
  );

  assert.ok(vesselCondition);
  assert.equal(vesselCondition.score, 10);
  assert.equal(vesselCondition.rawScore, 12);
  assert.equal(
    vesselCondition.triggeredIndicators.some((indicator) => indicator.id === "ageAbove30"),
    true,
  );
});

test("hard-stop indicators override the numeric band", () => {
  const inputs = createDefaultRiskAssessmentInputs();
  inputs.passengerOrRoroPassenger = true;
  inputs.openCriticalDeficiency = true;

  const result = evaluateRiskAssessment(inputs);

  assert.equal(result.totalScore, 16);
  assert.equal(result.hardStopTriggered, true);
  assert.equal(result.band.id, "critical");
  assert.equal(result.band.detail, "Hard stop triggered (No Sail)");
});

test("logic-sheet hard stop for active detention or no-sail order overrides the score", () => {
  const inputs = createDefaultRiskAssessmentInputs();
  inputs.activeDetentionSuspensionOrNoSailOrder = true;
  inputs.lessSeriousCasualty = true;

  const result = evaluateRiskAssessment(inputs);

  assert.equal(result.totalScore, 2);
  assert.equal(result.hardStopTriggered, true);
  assert.equal(
    result.hardStopIndicators.some((indicator) => indicator.id === "activeDetentionSuspensionOrNoSailOrder"),
    true,
  );
  assert.equal(result.band.id, "critical");
});

test("risk band thresholds match the workbook bands", () => {
  assert.equal(getRiskBandFromScore(24, false).id, "low");
  assert.equal(getRiskBandFromScore(25, false).id, "moderate");
  assert.equal(getRiskBandFromScore(44, false).id, "moderate");
  assert.equal(getRiskBandFromScore(45, false).id, "high");
  assert.equal(getRiskBandFromScore(64, false).id, "high");
  assert.equal(getRiskBandFromScore(65, false).id, "critical");
});

test("manual review flag is exposed without changing the score", () => {
  const inputs = createDefaultRiskAssessmentInputs();
  inputs.seriousCasualtyPast36Months = true;
  inputs.insufficientLeadingIndicatorData = true;

  const result = evaluateRiskAssessment(inputs);

  assert.equal(result.totalScore, 5);
  assert.equal(result.manualReviewRequired, true);
  assert.equal(result.band.id, "low");
});
