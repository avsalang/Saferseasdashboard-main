export interface Incident {
  id: string;
  date: string;
  type: string;
  casualtyType: string;
  severity: string;
  vesselName: string;
  vesselType: string;
  flagState: string;
  location: {
    lat: number;
    lng: number;
    port: string;
    province: string;
  };
  weather: {
    waveHeight: number;
    windForce: number;
    visibility: string;
  };
  authority: string;
  status: string;
  narrative: string;
  crewCount: number;
  passengerCount: number;
  fatalities: number;
  injuries: number;
}

export const mockIncidents: Incident[] = [
  {
    id: "INC-2026-001234",
    date: "2026-03-15T14:30:00Z",
    type: "Collision",
    casualtyType: "Fatality",
    severity: "Very Serious",
    vesselName: "MV Pacific Trader",
    vesselType: "Bulk Carrier",
    flagState: "Philippines",
    location: {
      lat: 14.5995,
      lng: 120.9842,
      port: "Manila",
      province: "Metro Manila"
    },
    weather: {
      waveHeight: 2.5,
      windForce: 6,
      visibility: "Poor"
    },
    authority: "MARINA",
    status: "Under Review",
    narrative: "Collision with fishing vessel in Manila Bay during reduced visibility conditions.",
    crewCount: 22,
    passengerCount: 0,
    fatalities: 3,
    injuries: 7
  },
  {
    id: "INC-2026-001189",
    date: "2026-03-10T08:15:00Z",
    type: "Grounding",
    casualtyType: "None",
    severity: "Serious",
    vesselName: "MV Island Express",
    vesselType: "Ferry",
    flagState: "Philippines",
    location: {
      lat: 10.3157,
      lng: 123.8854,
      port: "Cebu",
      province: "Cebu"
    },
    weather: {
      waveHeight: 1.2,
      windForce: 4,
      visibility: "Good"
    },
    authority: "PCG",
    status: "Verified",
    narrative: "Vessel ran aground on reef due to navigation error. All passengers safely evacuated.",
    crewCount: 15,
    passengerCount: 187,
    fatalities: 0,
    injuries: 2
  },
  {
    id: "INC-2026-001145",
    date: "2026-03-05T22:45:00Z",
    type: "Fire/Explosion",
    casualtyType: "Pollution",
    severity: "Very Serious",
    vesselName: "MT Ocean Star",
    vesselType: "Oil Tanker",
    flagState: "Singapore",
    location: {
      lat: 13.6218,
      lng: 123.1948,
      port: "Tabaco",
      province: "Albay"
    },
    weather: {
      waveHeight: 3.0,
      windForce: 7,
      visibility: "Moderate"
    },
    authority: "MARINA",
    status: "Published",
    narrative: "Engine room fire led to minor oil spill. Vessel under tow to nearest port.",
    crewCount: 28,
    passengerCount: 0,
    fatalities: 1,
    injuries: 12
  },
  {
    id: "INC-2026-001098",
    date: "2026-02-28T16:20:00Z",
    type: "Capsizing",
    casualtyType: "Fatality",
    severity: "Very Serious",
    vesselName: "FB San Miguel",
    vesselType: "Fishing Vessel",
    flagState: "Philippines",
    location: {
      lat: 7.0731,
      lng: 125.6128,
      port: "Davao",
      province: "Davao del Sur"
    },
    weather: {
      waveHeight: 4.5,
      windForce: 9,
      visibility: "Poor"
    },
    authority: "PCG",
    status: "Published",
    narrative: "Fishing vessel capsized in rough seas. 5 crew members rescued, 3 missing.",
    crewCount: 8,
    passengerCount: 0,
    fatalities: 3,
    injuries: 0
  },
  {
    id: "INC-2026-001067",
    date: "2026-02-22T11:30:00Z",
    type: "Machinery Failure",
    casualtyType: "None",
    severity: "Less Serious",
    vesselName: "MV Cargo Link",
    vesselType: "Container Ship",
    flagState: "Panama",
    location: {
      lat: 14.4822,
      lng: 121.0120,
      port: "Manila",
      province: "Metro Manila"
    },
    weather: {
      waveHeight: 1.0,
      windForce: 3,
      visibility: "Good"
    },
    authority: "MARINA",
    status: "Verified",
    narrative: "Main engine failure in Manila Bay. Vessel safely anchored and repairs underway.",
    crewCount: 20,
    passengerCount: 0,
    fatalities: 0,
    injuries: 0
  },
  {
    id: "INC-2026-001023",
    date: "2026-02-18T19:00:00Z",
    type: "Collision",
    casualtyType: "Property Damage",
    severity: "Serious",
    vesselName: "MV SuperFerry 12",
    vesselType: "Ferry",
    flagState: "Philippines",
    location: {
      lat: 11.2588,
      lng: 125.0111,
      port: "Tacloban",
      province: "Leyte"
    },
    weather: {
      waveHeight: 1.8,
      windForce: 5,
      visibility: "Moderate"
    },
    authority: "PCG",
    status: "Under Review",
    narrative: "Ferry collided with pier during docking maneuver. Minor structural damage to vessel.",
    crewCount: 18,
    passengerCount: 145,
    fatalities: 0,
    injuries: 5
  },
  {
    id: "INC-2026-000987",
    date: "2026-02-12T13:45:00Z",
    type: "Person Overboard",
    casualtyType: "Fatality",
    severity: "Serious",
    vesselName: "MV Visayan Princess",
    vesselType: "Ferry",
    flagState: "Philippines",
    location: {
      lat: 9.7489,
      lng: 118.7384,
      port: "Puerto Princesa",
      province: "Palawan"
    },
    weather: {
      waveHeight: 2.0,
      windForce: 5,
      visibility: "Good"
    },
    authority: "PCG",
    status: "Published",
    narrative: "Passenger reported missing during voyage. Search and rescue operation conducted.",
    crewCount: 16,
    passengerCount: 98,
    fatalities: 1,
    injuries: 0
  },
  {
    id: "INC-2026-000945",
    date: "2026-02-08T07:20:00Z",
    type: "Sinking",
    casualtyType: "Fatality",
    severity: "Very Serious",
    vesselName: "FB Santa Rosa",
    vesselType: "Fishing Vessel",
    flagState: "Philippines",
    location: {
      lat: 18.1712,
      lng: 120.5350,
      port: "Aparri",
      province: "Cagayan"
    },
    weather: {
      waveHeight: 5.0,
      windForce: 10,
      visibility: "Very Poor"
    },
    authority: "PCG",
    status: "Published",
    narrative: "Fishing vessel sank in typhoon conditions. 6 crew rescued by merchant vessel.",
    crewCount: 10,
    passengerCount: 0,
    fatalities: 4,
    injuries: 2
  },
  {
    id: "INC-2026-000912",
    date: "2026-02-03T15:30:00Z",
    type: "Flooding",
    casualtyType: "None",
    severity: "Less Serious",
    vesselName: "MV Island Hopper",
    vesselType: "Ferry",
    flagState: "Philippines",
    location: {
      lat: 12.5657,
      lng: 121.9599,
      port: "Calapan",
      province: "Oriental Mindoro"
    },
    weather: {
      waveHeight: 2.2,
      windForce: 6,
      visibility: "Moderate"
    },
    authority: "PCG",
    status: "Verified",
    narrative: "Hull breach caused flooding in cargo hold. Pumps effective, vessel proceeded to port.",
    crewCount: 12,
    passengerCount: 76,
    fatalities: 0,
    injuries: 0
  },
  {
    id: "INC-2026-000878",
    date: "2026-01-28T10:15:00Z",
    type: "Collision",
    casualtyType: "Property Damage",
    severity: "Serious",
    vesselName: "MV Pacific Dream",
    vesselType: "Bulk Carrier",
    flagState: "Marshall Islands",
    location: {
      lat: 8.4542,
      lng: 124.6319,
      port: "Cagayan de Oro",
      province: "Misamis Oriental"
    },
    weather: {
      waveHeight: 1.5,
      windForce: 4,
      visibility: "Good"
    },
    authority: "MARINA",
    status: "Published",
    narrative: "Bulk carrier collided with moored vessel during berthing. Damage to bow section.",
    crewCount: 24,
    passengerCount: 0,
    fatalities: 0,
    injuries: 1
  }
];
