export const windDirections = [
    { value: 'north', label: 'North', degrees: 0 },
    { value: 'northEast', label: 'North East', degrees: 45 },
    { value: 'east', label: 'East', degrees: 90 },
    { value: 'southEast', label: 'South East', degrees: 135 },
    { value: 'south', label: 'South', degrees: 180 },
    { value: 'southWest', label: 'South West', degrees: 225 },
    { value: 'west', label: 'West', degrees: 270 },
    { value: 'northWest', label: 'North West', degrees: 315 },
    { value: 'variable', label: 'Variable', degrees: -1 },
]

export const swellRanges = [
    { value: 'smooth', label: 'Less than 0.5m', meter: 0.5 },
    { value: 'slight', label: '0.5m to 1.25m', meter: 1.25 },
    { value: 'moderate', label: '1.25m to 2.5m', meter: 2.5 },
    { value: 'rough', label: '2.5m to 4m', meter: 4 },
    { value: 'veryRough', label: '4m to 6m', meter: 6 },
    { value: 'high', label: '6m to 9m', meter: 9 },
    { value: 'veryHigh', label: '9m to 14m', meter: 14 },
    { value: 'phenomenal', label: 'More than 14m', meter: 100 },
]

// Less than 1km is fog, 1-2km is poor, 2-5km is variable, 5-10 moderate and +10 is good
export const visibilities = [
    { value: 'fog', label: 'Fog', km: 1 },
    { value: 'poor', label: 'Poor', km: 2 },
    { value: 'variable', label: 'Variable', km: 5 },
    { value: 'moderate', label: 'Moderate', km: 10 },
    { value: 'good', label: 'Good', km: 100 },
]

export const precipitations = [
    { value: 'none', label: 'None', max: 0 },
    { value: 'drizzle', label: 'Drizzle', max: 0.5 },
    { value: 'scattered', label: 'Scattered Showers', max: 1 },
    { value: 'showers', label: 'Showers', max: 2.5 },
    { value: 'rain', label: 'Rain', max: 7.6 },
    { value: 'torrential', label: 'Torrential Rain', max: 100 },
]
