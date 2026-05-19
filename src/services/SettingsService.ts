import { apiFetch } from '../utils/api'

export interface SiteSettings {
  companyName?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  googleMapsUrl?: string;
  latitude?: string;
  longitude?: string;
  cnpj?: string;
  logo?: string;
  aboutYears?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  loginBackground?: string;
  siteUrl?: string;
  banners: any[];
  specialties: any[];
  carouselDelay: number;
  goalType: string;
  goalTarget: number;
  maxDiscountWarning?: number;
  maxDiscountDanger?: number;
}

const normalizeHttpToHttps = <T>(value: T): T => {
  if (typeof value === 'string') {
    return value.replace(/^http:\/\//i, 'https://') as T
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeHttpToHttps(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeHttpToHttps(entry)])
    ) as T
  }

  return value
}

export class SettingsService {
  static async getSettings(): Promise<SiteSettings> {
    const response = await apiFetch('/settings');
    return normalizeHttpToHttps(response.data);
  }

  static async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const response = await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(normalizeHttpToHttps(settings))
    });
    return normalizeHttpToHttps(response.data);
  }
}
