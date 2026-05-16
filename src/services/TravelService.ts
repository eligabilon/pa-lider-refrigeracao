import { apiFetch } from '../utils/api'

export interface Trip {
  id: string
  status: 'ativa' | 'finalizada'
  data_inicio: string
  data_fim?: string | null
  origem: string
  destino: string
  placa: string
  km_inicial: number
  km_final?: number | null
  distancia: number
  eventos: any[]
  user_name?: string
  created_at: string
}

export interface Simulation {
  id: string
  data: string
  origem: string
  destino: string
  distancia_km: number
  duracao_min: number
  consumo: number
  preco_diesel: number
  custo_combustivel: number
  total_pedagios: number
  valor_frete: number
  custo_total: number
  lucro: number
  margem: number
  custo_por_km: number
  user_name?: string
  distanciaKm: number
  duracaoMin: number
  precoDiesel: number
  custoCombustivel: number
  totalPedagios: number
  valorFrete: number
  custoTotal: number
  custoPorKm: number
  userName?: string
}

const normalizeSimulation = (simulation: any): Simulation => ({
  ...simulation,
  distanciaKm: simulation.distanciaKm ?? simulation.distancia_km ?? 0,
  duracaoMin: simulation.duracaoMin ?? simulation.duracao_min ?? 0,
  precoDiesel: simulation.precoDiesel ?? simulation.preco_diesel ?? 0,
  custoCombustivel: simulation.custoCombustivel ?? simulation.custo_combustivel ?? 0,
  totalPedagios: simulation.totalPedagios ?? simulation.total_pedagios ?? 0,
  valorFrete: simulation.valorFrete ?? simulation.valor_frete ?? 0,
  custoTotal: simulation.custoTotal ?? simulation.custo_total ?? 0,
  custoPorKm: simulation.custoPorKm ?? simulation.custo_por_km ?? 0,
  userName: simulation.userName ?? simulation.user_name
})

export class TravelService {
  // Trips
  static async getTrips(): Promise<Trip[]> {
    const response = await apiFetch('/travels/trips');
    return response.data;
  }

  static async getActiveTrip(): Promise<Trip | null> {
    const response = await apiFetch('/travels/trips/active');
    return response.data;
  }

  static async createTrip(trip: Partial<Trip>): Promise<Trip> {
    const response = await apiFetch('/travels/trips', {
      method: 'POST',
      body: JSON.stringify(trip)
    });
    return response.data;
  }

  static async updateTrip(id: string, trip: Partial<Trip>): Promise<Trip> {
    const response = await apiFetch(`/travels/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trip)
    });
    return response.data;
  }

  static async deleteTrip(id: string): Promise<boolean> {
    const response = await apiFetch(`/travels/trips/${id}`, {
      method: 'DELETE'
    });
    return response.success;
  }

  // Simulations
  static async getSimulations(): Promise<Simulation[]> {
    const response = await apiFetch('/travels/simulations');
    return response.data.map(normalizeSimulation);
  }

  static async createSimulation(sim: Partial<Simulation>): Promise<Simulation> {
    const response = await apiFetch('/travels/simulations', {
      method: 'POST',
      body: JSON.stringify(sim)
    });
    return normalizeSimulation(response.data);
  }

  static async deleteSimulation(id: string): Promise<boolean> {
    const response = await apiFetch(`/travels/simulations/${id}`, {
      method: 'DELETE'
    });
    return response.success;
  }
}
