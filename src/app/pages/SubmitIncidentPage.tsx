import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { CalendarIcon, Upload, Save, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../components/ui/utils";

const steps = [
  "Incident ID & Basics",
  "Location & Environment",
  "Vessel Information",
  "Ownership/Operator",
  "Voyage & Cargo",
  "Circumstances",
  "Investigation & Outcome",
  "Administrative Details",
  "Attachments"
];

export function SubmitIncidentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    incidentId: `INC-2026-${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`,
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
    vesselType: "",
    flagState: "",
    imoNumber: "",
    tonnage: "",
    ownerName: "",
    operatorName: "",
    origin: "",
    destination: "",
    cargoType: "",
    crewCount: "",
    passengerCount: "",
    narrative: "",
    authority: "",
    reportingMethod: ""
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2">Submit Incident Report</h1>
          <p className="text-slate-600">Complete all steps to submit a standardized maritime incident report</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Vertical Step Navigation */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm",
                  currentStep === index
                    ? "bg-blue-600 text-white border-blue-600"
                    : currentStep > index
                    ? "bg-green-50 text-green-900 border-green-200"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    currentStep === index
                      ? "bg-white text-blue-600"
                      : currentStep > index
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  )}>
                    {currentStep > index ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="line-clamp-2">{step}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Incident ID & Basics */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Incident ID (Auto-generated)</Label>
                      <Input value={formData.incidentId} disabled className="bg-slate-50" />
                    </div>
                    
                    <div>
                      <Label>Date & Time of Incident</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left",
                              !date && "text-slate-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Incident Type</Label>
                        <Select value={formData.incidentType} onValueChange={(v) => updateFormData('incidentType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="collision">Collision</SelectItem>
                            <SelectItem value="grounding">Grounding</SelectItem>
                            <SelectItem value="sinking">Sinking</SelectItem>
                            <SelectItem value="fire">Fire/Explosion</SelectItem>
                            <SelectItem value="capsizing">Capsizing</SelectItem>
                            <SelectItem value="flooding">Flooding</SelectItem>
                            <SelectItem value="machinery">Machinery Failure</SelectItem>
                            <SelectItem value="overboard">Person Overboard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Casualty Type</Label>
                        <Select value={formData.casualtyType} onValueChange={(v) => updateFormData('casualtyType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select casualty type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fatality">Fatality</SelectItem>
                            <SelectItem value="injury">Injury</SelectItem>
                            <SelectItem value="pollution">Pollution</SelectItem>
                            <SelectItem value="property">Property Damage</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Severity Level</Label>
                      <Select value={formData.severity} onValueChange={(v) => updateFormData('severity', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very-serious">Very Serious</SelectItem>
                          <SelectItem value="serious">Serious</SelectItem>
                          <SelectItem value="less-serious">Less Serious</SelectItem>
                          <SelectItem value="near-miss">Near Miss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Environment */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Latitude</Label>
                        <Input 
                          placeholder="e.g., 14.5995" 
                          value={formData.latitude}
                          onChange={(e) => updateFormData('latitude', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Longitude</Label>
                        <Input 
                          placeholder="e.g., 120.9842" 
                          value={formData.longitude}
                          onChange={(e) => updateFormData('longitude', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nearest Port</Label>
                        <Input 
                          placeholder="e.g., Manila" 
                          value={formData.port}
                          onChange={(e) => updateFormData('port', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Province/Region</Label>
                        <Input 
                          placeholder="e.g., Metro Manila" 
                          value={formData.province}
                          onChange={(e) => updateFormData('province', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm text-slate-700 mb-3">Weather & Sea Conditions</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Wave Height (m)</Label>
                          <Input 
                            type="number" 
                            placeholder="e.g., 2.5" 
                            value={formData.waveHeight}
                            onChange={(e) => updateFormData('waveHeight', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Wind Force (Beaufort)</Label>
                          <Input 
                            type="number" 
                            placeholder="0-12" 
                            value={formData.windForce}
                            onChange={(e) => updateFormData('windForce', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Visibility</Label>
                          <Select value={formData.visibility} onValueChange={(v) => updateFormData('visibility', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                              <SelectItem value="very-poor">Very Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Vessel Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Vessel Name</Label>
                        <Input 
                          placeholder="e.g., MV Pacific Trader" 
                          value={formData.vesselName}
                          onChange={(e) => updateFormData('vesselName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Vessel Type</Label>
                        <Select value={formData.vesselType} onValueChange={(v) => updateFormData('vesselType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tanker">Oil Tanker</SelectItem>
                            <SelectItem value="bulk">Bulk Carrier</SelectItem>
                            <SelectItem value="container">Container Ship</SelectItem>
                            <SelectItem value="ferry">Ferry</SelectItem>
                            <SelectItem value="fishing">Fishing Vessel</SelectItem>
                            <SelectItem value="cargo">General Cargo</SelectItem>
                            <SelectItem value="passenger">Passenger Vessel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Flag State</Label>
                        <Input 
                          placeholder="e.g., Philippines" 
                          value={formData.flagState}
                          onChange={(e) => updateFormData('flagState', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>IMO Number</Label>
                        <Input 
                          placeholder="e.g., IMO 1234567" 
                          value={formData.imoNumber}
                          onChange={(e) => updateFormData('imoNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Gross Tonnage</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g., 25000" 
                        value={formData.tonnage}
                        onChange={(e) => updateFormData('tonnage', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Ownership/Operator */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Owner Name <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Legal owner of the vessel" 
                        value={formData.ownerName}
                        onChange={(e) => updateFormData('ownerName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Operator Name <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Company operating the vessel" 
                        value={formData.operatorName}
                        onChange={(e) => updateFormData('operatorName', e.target.value)}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                      <strong>Validation:</strong> At least one of Owner or Operator must be provided.
                    </div>
                  </div>
                )}

                {/* Step 5: Voyage & Cargo */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Port of Origin</Label>
                        <Input 
                          placeholder="e.g., Manila" 
                          value={formData.origin}
                          onChange={(e) => updateFormData('origin', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Port of Destination</Label>
                        <Input 
                          placeholder="e.g., Cebu" 
                          value={formData.destination}
                          onChange={(e) => updateFormData('destination', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Cargo Type</Label>
                      <Select value={formData.cargoType} onValueChange={(v) => updateFormData('cargoType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cargo type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                          <SelectItem value="containers">Containers</SelectItem>
                          <SelectItem value="bulk">Bulk Cargo</SelectItem>
                          <SelectItem value="passengers">Passengers</SelectItem>
                          <SelectItem value="general">General Cargo</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Crew Count</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 22" 
                          value={formData.crewCount}
                          onChange={(e) => updateFormData('crewCount', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Passenger Count</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 0" 
                          value={formData.passengerCount}
                          onChange={(e) => updateFormData('passengerCount', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Total Onboard</Label>
                        <Input 
                          value={
                            (parseInt(formData.crewCount) || 0) + 
                            (parseInt(formData.passengerCount) || 0)
                          } 
                          disabled 
                          className="bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Circumstances */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Narrative Summary</Label>
                      <Textarea 
                        placeholder="Provide a detailed description of the incident circumstances..." 
                        rows={6}
                        value={formData.narrative}
                        onChange={(e) => updateFormData('narrative', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Crew Behavior Factors (Check all that apply)</Label>
                      <div className="space-y-2">
                        {[
                          "Fatigue",
                          "Alcohol/Substance Misuse",
                          "Inadequate Training",
                          "Communication Failure",
                          "Violation of Procedures"
                        ].map((factor) => (
                          <div key={factor} className="flex items-center gap-2">
                            <Checkbox id={factor} />
                            <label htmlFor={factor} className="text-sm text-slate-700">{factor}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Primary Cause (Preliminary)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cause" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="human">Human Error</SelectItem>
                          <SelectItem value="mechanical">Mechanical Failure</SelectItem>
                          <SelectItem value="weather">Weather Conditions</SelectItem>
                          <SelectItem value="navigation">Navigation Error</SelectItem>
                          <SelectItem value="unknown">Under Investigation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 7: Investigation & Outcome */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">Damages Incurred (Check all that apply)</Label>
                      <div className="space-y-2">
                        {[
                          "Hull Damage",
                          "Machinery Damage",
                          "Cargo Loss",
                          "Environmental Pollution",
                          "Third-Party Property"
                        ].map((damage) => (
                          <div key={damage} className="flex items-center gap-2">
                            <Checkbox id={damage} />
                            <label htmlFor={damage} className="text-sm text-slate-700">{damage}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Recommendations</Label>
                      <Textarea 
                        placeholder="Safety recommendations and corrective actions to prevent recurrence..." 
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {/* Step 8: Administrative Details */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Reporting Authority</Label>
                      <Select value={formData.authority} onValueChange={(v) => updateFormData('authority', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select authority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marina">MARINA</SelectItem>
                          <SelectItem value="pcg">Philippine Coast Guard (PCG)</SelectItem>
                          <SelectItem value="ppa">Philippine Ports Authority (PPA)</SelectItem>
                          <SelectItem value="denr">DENR (Environmental)</SelectItem>
                          <SelectItem value="other">Other Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Reporting Method</Label>
                      <Select value={formData.reportingMethod} onValueChange={(v) => updateFormData('reportingMethod', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portal">Web Portal</SelectItem>
                          <SelectItem value="mobile">Mobile App</SelectItem>
                          <SelectItem value="api">API Integration</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 9: Attachments */}
                {currentStep === 8 && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-700 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">Photos, logs, AIS extracts, testimonies, or other supporting documents</p>
                      <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG, CSV (max 10MB each)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Uploaded Files</Label>
                      <div className="text-sm text-slate-500 italic">No files uploaded yet</div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Draft
                    </Button>
                    
                    {currentStep === steps.length - 1 ? (
                      <Button className="bg-green-600 hover:bg-green-700 gap-2">
                        <Check className="w-4 h-4" />
                        Submit Report
                      </Button>
                    ) : (
                      <Button onClick={nextStep}>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
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
