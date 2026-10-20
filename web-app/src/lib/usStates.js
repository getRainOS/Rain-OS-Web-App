// US states and DC, as the two-letter codes cloro accepts for location-aware checks.
export const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],
  ['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],
  ['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],
  ['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
  ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],
  ['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
];
export const stateName = code => US_STATES.find(([c]) => c === code)?.[1] || code;

// Countries offered for "Check as someone in". The backend accepts any
// country cloro supports; these are the ones most customers will want.
export const COUNTRIES = [
  ['US','United States'],['GB','United Kingdom'],['CA','Canada'],['AU','Australia'],['IE','Ireland'],['NZ','New Zealand'],
  ['DE','Germany'],['FR','France'],['ES','Spain'],['IT','Italy'],['NL','Netherlands'],['SE','Sweden'],['CH','Switzerland'],
  ['IN','India'],['SG','Singapore'],['AE','United Arab Emirates'],['ZA','South Africa'],['BR','Brazil'],['MX','Mexico'],['JP','Japan'],
];
export const countryName = code => COUNTRIES.find(([c]) => c === code)?.[1] || code;
// "Texas, United States", "United Kingdom", or "" when nothing is set.
export const locationLabel = (country, state) =>
  !country ? '' : country === 'US' && state ? `${stateName(state)}, United States` : countryName(country);
