import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { cn } from "../components/ui/utils";

const steps = [
  "Incident Identification",
  "Location & Environment",
  "Vessel Information",
  "Ownership & Operator",
  "Voyage & Cargo",
  "Circumstances",
  "Investigation & Outcome",
  "Administrative Details",
  "Linked Documents",
];

const incidentTypeOptions = [
  "Collision",
  "Grounding",
  "Sinking",
  "Fire/Explosion",
  "Capsizing",
  "Flooding",
  "Swamping",
  "Machinery Failure",
  "Person Overboard",
  "Pollution Incident",
  "Other",
];

const casualtyTypeOptions = [
  "Fatality",
  "Injury",
  "Pollution",
  "Property Damage",
  "Missing Person",
  "None",
];

const severityOptions = [
  "Very Serious",
  "Serious",
  "Less Serious",
  "Near Miss",
];

const visibilityOptions = ["Good", "Moderate", "Poor", "Very Poor"];

const vesselTypeOptions = [
  "Oil Tanker",
  "Bulk Carrier",
  "Container Ship",
  "Ferry",
  "Fishing Vessel",
  "General Cargo",
  "Passenger Vessel",
  "Utility / Tug",
  "Other",
];

const cargoTypeOptions = [
  "Passengers",
  "Bulk Cargo",
  "Containers",
  "Hazardous Materials",
  "General Cargo",
  "Fish Catch",
  "Fuel / Oil",
  "None",
];

const crewBehaviorOptions = [
  "Fatigue",
  "Alcohol/Substance Misuse",
  "Inadequate Training",
  "Communication Failure",
  "Violation of Procedures",
];

const damageOptions = [
  "Hull Damage",
  "Machinery Damage",
  "Cargo Loss",
  "Environmental Pollution",
  "Third-Party Property",
];

const linkedDocumentOptions = [
  "Photos",
  "AIS Extract",
  "Certificates",
  "Bridge / Engine Logs",
  "Witness Statements",
  "Passenger or Crew Manifest",
];

const authorityOptions = [
  "MARINA",
  "Philippine Coast Guard (PCG)",
  "Philippine Ports Authority (PPA)",
  "Cebu Port Authority (CPA)",
  "Department of Transportation (DOTr)",
  "Other Agency",
];

const reportingMethodOptions = [
  "Web Portal",
  "Mobile App",
  "API Integration",
  "Email",
  "Paper Form",
  "Phone Call",
];

type Requirement = "required" | "optional" | "system";

type IncidentFormState = {
  incidentId: string;
  workflowStatus: string;
  incidentDateTime: string;
  incidentType: string;
  casualtyType: string;
  severity: string;
  latitude: string;
  longitude: string;
  port: string;
  province: string;
  waveHeight: string;
  windForce: string;
  visibility: string;
  vesselName: string;
  formerNames: string;
  vesselType: string;
  flagState: string;
  imoNumber: string;
  officialNumber: string;
  grossTonnage: string;
  lengthMeters: string;
  breadthMeters: string;
  propulsionType: string;
  enginePowerKw: string;
  classificationSociety: string;
  yearBuilt: string;
  ownerName: string;
  ownerContact: string;
  operatorName: string;
  operatorAddress: string;
  origin: string;
  destination: string;
  intendedRoute: string;
  cargoType: string;
  cargoQuantity: string;
  crewCount: string;
  passengerCount: string;
  narrative: string;
  keyEventsTimeline: string;
  crewResponse: string;
  crewBehaviorFactors: string[];
  primaryCause: string;
  findingsOfCause: string;
  damagesIncurred: string[];
  fatalities: string;
  injuries: string;
  recommendations: string;
  authority: string;
  reportingMethod: string;
  linkedDocuments: string[];
  linkedDocumentNotes: string;
};

function FieldLabel({
  children,
  requirement = "optional",
}: {
  children: string;
  requirement?: Requirement;
}) {
  return (
    <Label className="mb-2 flex items-center gap-2">
      <span>{children}</span>
      {requirement === "required" && <span className="text-red-500">*</span>}
      {requirement === "optional" && (
        <span className="text-[11px] font-normal uppercase tracking-wide text-slate-500">
          Optional
        </span>
      )}
      {requirement === "system" && (
        <span className="text-[11px] font-normal uppercase tracking-wide text-blue-600">
          System
        </span>
      )}
    </Label>
  );
}

export function SubmitIncidentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IncidentFormState>({
    incidentId: `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(6, "0")}`,
    workflowStatus: "Draft",
    incidentDateTime: "",
    incidentType: "",
    casualtyType: "",
    severity: "",
    latitude: "",
    longitude: "",
    port: "",
    province: "",
    waveHeight: "",
    windForce: "",
    visibility: "",
    vesselName: "",
    formerNames: "",
    vesselType: "",
    flagState: "",
    imoNumber: "",
    officialNumber: "",
    grossTonnage: "",
    lengthMeters: "",
    breadthMeters: "",
    propulsionType: "",
    enginePowerKw: "",
    classificationSociety: "",
    yearBuilt: "",
    ownerName: "",
    ownerContact: "",
    operatorName: "",
    operatorAddress: "",
    origin: "",
    destination: "",
    intendedRoute: "",
    cargoType: "",
    cargoQuantity: "",
    crewCount: "",
    passengerCount: "",
    narrative: "",
    keyEventsTimeline: "",
    crewResponse: "",
    crewBehaviorFactors: [],
    primaryCause: "",
    findingsOfCause: "",
    damagesIncurred: [],
    fatalities: "",
    injuries: "",
    recommendations: "",
    authority: "",
    reportingMethod: "",
    linkedDocuments: [],
    linkedDocumentNotes: "",
  });

  const updateFormData = <K extends keyof IncidentFormState>(field: K, value: IncidentFormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleListField = (
    field: "crewBehaviorFactors" | "damagesIncurred" | "linkedDocuments",
    value: string,
    checked: boolean | "indeterminate",
  ) => {
    const isChecked = checked === true;
    setFormData((prev) => {
      const currentValues = prev[field];
      return {
        ...prev,
        [field]: isChecked
          ? [...currentValues, value].filter((item, index, array) => array.indexOf(item) === index)
          : currentValues.filter((item) => item !== value),
      };
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const totalOnboard = (parseInt(formData.crewCount, 10) || 0) + (parseInt(formData.passengerCount, 10) || 0);

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2">Submit Incident Report</h1>
          <p className="text-slate-600">
            Complete the standardized SAFERSEAS intake record for post-incident analysis, GIS mapping, and policy support.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              <span className="text-red-500 font-semibold">*</span> Required for standardized intake
            </span>
            <span className="text-slate-500 uppercase tracking-wide text-[11px]">Optional</span>
            <span>Complete when supporting details become available</span>
            <span className="text-blue-600 uppercase tracking-wide text-[11px]">System</span>
            <span>Auto-generated or calculated by the platform</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm",
                  currentStep === index
                    ? "bg-blue-600 text-white border-blue-600"
                    : currentStep > index
                      ? "bg-green-50 text-green-900 border-green-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300",
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                      currentStep === index
                        ? "bg-white text-blue-600"
                        : currentStep > index
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="line-clamp-2">{step}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="system">Incident ID</FieldLabel>
                        <Input value={formData.incidentId} disabled className="bg-slate-50" />
                      </div>
                      <div>
                        <FieldLabel requirement="system">Workflow Status</FieldLabel>
                        <Input value={formData.workflowStatus} disabled className="bg-slate-50" />
                      </div>
                    </div>

                    <div>
                      <FieldLabel requirement="required">Date and Time of Incident</FieldLabel>
                      <Input
                        type="datetime-local"
                        value={formData.incidentDateTime}
                        onChange={(e) => updateFormData("incidentDateTime", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Incident Type</FieldLabel>
                        <Select value={formData.incidentType} onValueChange={(value) => updateFormData("incidentType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                          <SelectContent>
                            {incidentTypeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <FieldLabel>Impact Type</FieldLabel>
                        <Select value={formData.casualtyType} onValueChange={(value) => updateFormData("casualtyType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact type" />
                          </SelectTrigger>
                          <SelectContent>
                            {casualtyTypeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <FieldLabel requirement="required">Severity Classification</FieldLabel>
                      <Select value={formData.severity} onValueChange={(value) => updateFormData("severity", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity classification" />
                        </SelectTrigger>
                        <SelectContent>
                          {severityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Latitude</FieldLabel>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g., 14.5995"
                          value={formData.latitude}
                          onChange={(e) => updateFormData("latitude", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Longitude</FieldLabel>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g., 120.9842"
                          value={formData.longitude}
                          onChange={(e) => updateFormData("longitude", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Nearest Port</FieldLabel>
                        <Input
                          placeholder="e.g., Manila"
                          value={formData.port}
                          onChange={(e) => updateFormData("port", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Province / Region</FieldLabel>
                        <Input
                          placeholder="e.g., Metro Manila"
                          value={formData.province}
                          onChange={(e) => updateFormData("province", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      Weather and sea conditions are required for standardized intake. During implementation, these fields can be validated or enriched with an external weather source.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FieldLabel requirement="required">Wave Height (m)</FieldLabel>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.5"
                          value={formData.waveHeight}
                          onChange={(e) => updateFormData("waveHeight", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Wind Force (Beaufort)</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          max="12"
                          placeholder="0-12"
                          value={formData.windForce}
                          onChange={(e) => updateFormData("windForce", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Visibility</FieldLabel>
                        <Select value={formData.visibility} onValueChange={(value) => updateFormData("visibility", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            {visibilityOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Vessel Name</FieldLabel>
                        <Input
                          placeholder="e.g., MV Pacific Trader"
                          value={formData.vesselName}
                          onChange={(e) => updateFormData("vesselName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel>Former Name(s)</FieldLabel>
                        <Input
                          placeholder="Comma-separated if applicable"
                          value={formData.formerNames}
                          onChange={(e) => updateFormData("formerNames", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Vessel Type / Class</FieldLabel>
                        <Select value={formData.vesselType} onValueChange={(value) => updateFormData("vesselType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vessel class" />
                          </SelectTrigger>
                          <SelectContent>
                            {vesselTypeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel requirement="required">Flag State</FieldLabel>
                        <Input
                          placeholder="e.g., Philippines"
                          value={formData.flagState}
                          onChange={(e) => updateFormData("flagState", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Provide at least one registered vessel number before final submission. Capture both the IMO number and official number when available.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>IMO Number</FieldLabel>
                        <Input
                          placeholder="e.g., IMO 1234567"
                          value={formData.imoNumber}
                          onChange={(e) => updateFormData("imoNumber", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Official Number</FieldLabel>
                        <Input
                          placeholder="National or agency registration number"
                          value={formData.officialNumber}
                          onChange={(e) => updateFormData("officialNumber", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FieldLabel>Gross Tonnage</FieldLabel>
                        <Input
                          type="number"
                          placeholder="e.g., 25000"
                          value={formData.grossTonnage}
                          onChange={(e) => updateFormData("grossTonnage", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Length (m)</FieldLabel>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 189.6"
                          value={formData.lengthMeters}
                          onChange={(e) => updateFormData("lengthMeters", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Breadth (m)</FieldLabel>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 32.2"
                          value={formData.breadthMeters}
                          onChange={(e) => updateFormData("breadthMeters", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Propulsion Type</FieldLabel>
                        <Input
                          placeholder="e.g., Diesel engine"
                          value={formData.propulsionType}
                          onChange={(e) => updateFormData("propulsionType", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Engine Power (kW)</FieldLabel>
                        <Input
                          type="number"
                          placeholder="e.g., 11200"
                          value={formData.enginePowerKw}
                          onChange={(e) => updateFormData("enginePowerKw", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Classification Society</FieldLabel>
                        <Input
                          placeholder="e.g., Bureau Veritas"
                          value={formData.classificationSociety}
                          onChange={(e) => updateFormData("classificationSociety", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Year Built</FieldLabel>
                        <Input
                          type="number"
                          placeholder="e.g., 2006"
                          value={formData.yearBuilt}
                          onChange={(e) => updateFormData("yearBuilt", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      At least one accountable entity should be captured in this section before final submission. If the legal owner is not yet confirmed, provide operator details.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Owner Name</FieldLabel>
                        <Input
                          placeholder="Legal owner of the vessel"
                          value={formData.ownerName}
                          onChange={(e) => updateFormData("ownerName", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Owner Contact</FieldLabel>
                        <Input
                          placeholder="Phone, email, or office contact"
                          value={formData.ownerContact}
                          onChange={(e) => updateFormData("ownerContact", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Operator Name</FieldLabel>
                        <Input
                          placeholder="Entity managing daily operations"
                          value={formData.operatorName}
                          onChange={(e) => updateFormData("operatorName", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Operator Address</FieldLabel>
                        <Input
                          placeholder="Business or port office address"
                          value={formData.operatorAddress}
                          onChange={(e) => updateFormData("operatorAddress", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Port of Origin</FieldLabel>
                        <Input
                          placeholder="e.g., Manila"
                          value={formData.origin}
                          onChange={(e) => updateFormData("origin", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Port of Destination</FieldLabel>
                        <Input
                          placeholder="e.g., Cebu"
                          value={formData.destination}
                          onChange={(e) => updateFormData("destination", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Intended Route</FieldLabel>
                      <Input
                        placeholder="Stated route before deviation or disruption"
                        value={formData.intendedRoute}
                        onChange={(e) => updateFormData("intendedRoute", e.target.value)}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Use this field to describe the planned voyage path before the incident, diversion, or disruption.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Cargo Type</FieldLabel>
                        <Select value={formData.cargoType} onValueChange={(value) => updateFormData("cargoType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cargo type" />
                          </SelectTrigger>
                          <SelectContent>
                            {cargoTypeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Cargo Quantity</FieldLabel>
                        <Input
                          placeholder="e.g., 18,000 MT or 187 passengers"
                          value={formData.cargoQuantity}
                          onChange={(e) => updateFormData("cargoQuantity", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FieldLabel requirement="required">Crew Count</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 22"
                          value={formData.crewCount}
                          onChange={(e) => updateFormData("crewCount", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Passenger Count</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 0"
                          value={formData.passengerCount}
                          onChange={(e) => updateFormData("passengerCount", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="system">Total Onboard</FieldLabel>
                        <Input value={totalOnboard} disabled className="bg-slate-50" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel requirement="required">Narrative Summary</FieldLabel>
                      <Textarea
                        placeholder="Provide a structured description of the incident circumstances..."
                        rows={6}
                        value={formData.narrative}
                        onChange={(e) => updateFormData("narrative", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel>Key Events Timeline</FieldLabel>
                      <Textarea
                        placeholder="List the key events in chronological order"
                        rows={4}
                        value={formData.keyEventsTimeline}
                        onChange={(e) => updateFormData("keyEventsTimeline", e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Crew Behavior / Response</FieldLabel>
                      <Textarea
                        placeholder="Describe how the crew responded during and immediately after the incident"
                        rows={4}
                        value={formData.crewResponse}
                        onChange={(e) => updateFormData("crewResponse", e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Crew Behavior Factors</FieldLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        {crewBehaviorOptions.map((factor) => (
                          <label key={factor} className="flex items-center gap-2 text-sm text-slate-700">
                            <Checkbox
                              checked={formData.crewBehaviorFactors.includes(factor)}
                              onCheckedChange={(checked) => toggleListField("crewBehaviorFactors", factor, checked)}
                            />
                            <span>{factor}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Primary Cause (Preliminary)</FieldLabel>
                      <Select value={formData.primaryCause} onValueChange={(value) => updateFormData("primaryCause", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preliminary cause" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Human Error">Human Error</SelectItem>
                          <SelectItem value="Mechanical Failure">Mechanical Failure</SelectItem>
                          <SelectItem value="Weather Conditions">Weather Conditions</SelectItem>
                          <SelectItem value="Navigation Error">Navigation Error</SelectItem>
                          <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Findings of Cause</FieldLabel>
                      <Textarea
                        placeholder="Document confirmed or emerging causal factors"
                        rows={4}
                        value={formData.findingsOfCause}
                        onChange={(e) => updateFormData("findingsOfCause", e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Damages Incurred</FieldLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        {damageOptions.map((damage) => (
                          <label key={damage} className="flex items-center gap-2 text-sm text-slate-700">
                            <Checkbox
                              checked={formData.damagesIncurred.includes(damage)}
                              onCheckedChange={(checked) => toggleListField("damagesIncurred", damage, checked)}
                            />
                            <span>{damage}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel requirement="required">Fatalities</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={formData.fatalities}
                          onChange={(e) => updateFormData("fatalities", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel requirement="required">Injuries</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={formData.injuries}
                          onChange={(e) => updateFormData("injuries", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Recommendations</FieldLabel>
                      <Textarea
                        placeholder="Safety measures, corrective actions, and policy recommendations to prevent recurrence"
                        rows={5}
                        value={formData.recommendations}
                        onChange={(e) => updateFormData("recommendations", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel requirement="required">Reporting Authority</FieldLabel>
                      <Select value={formData.authority} onValueChange={(value) => updateFormData("authority", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reporting authority" />
                        </SelectTrigger>
                        <SelectContent>
                          {authorityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <FieldLabel>Method of Reporting</FieldLabel>
                      <Select value={formData.reportingMethod} onValueChange={(value) => updateFormData("reportingMethod", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reporting method" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportingMethodOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Linked Documents</FieldLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        {linkedDocumentOptions.map((documentType) => (
                          <label key={documentType} className="flex items-center gap-2 text-sm text-slate-700">
                            <Checkbox
                              checked={formData.linkedDocuments.includes(documentType)}
                              onCheckedChange={(checked) => toggleListField("linkedDocuments", documentType, checked)}
                            />
                            <span>{documentType}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Document Notes</FieldLabel>
                      <Textarea
                        placeholder="Reference file names, certificate numbers, or evidence notes"
                        rows={4}
                        value={formData.linkedDocumentNotes}
                        onChange={(e) => updateFormData("linkedDocumentNotes", e.target.value)}
                      />
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer">
                      <p className="text-sm text-slate-700 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">Photos, logs, certificates, testimonies, manifests, or other supporting documents</p>
                      <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG, CSV (secure upload workflow to be implemented)</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>Previous</Button>

                  <div className="flex gap-2">
                    <Button variant="outline">Save Draft</Button>

                    {currentStep === steps.length - 1 ? (
                      <Button className="bg-green-600 hover:bg-green-700">Submit Report</Button>
                    ) : (
                      <Button onClick={nextStep}>Next</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
