export enum UFMGAccess {
  FACIL = 'Fácil',
  ACEITAVEL = 'Aceitável',
  COMPLEXO = 'Complexo',
  RUIM = 'Ruim'
}

export interface Property {
  id: string;
  name: string; // Internal nickname for the place
  link: string;
  neighborhoodSecurity: number; // 1-10
  centerAccess: number; // 1-6
  ufmgAccess: UFMGAccess;
  busQuantity: string; // Free text or number
  leisure: number; // 1-6
  uberPriceDay: number;
  uberPriceNight: number;
  rentTotal: number;
  idealRating: number; // 1-10 (My Ideal Place)
  currentMomentRating: number; // 1-10 (Current Moment)
  notes?: string;
}

export const initialProperty: Omit<Property, 'id'> = {
  name: '',
  link: '',
  neighborhoodSecurity: 5,
  centerAccess: 3,
  ufmgAccess: UFMGAccess.ACEITAVEL,
  busQuantity: '',
  leisure: 3,
  uberPriceDay: 0,
  uberPriceNight: 0,
  rentTotal: 0,
  idealRating: 5,
  currentMomentRating: 5,
  notes: ''
};