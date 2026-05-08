import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import proj4 from 'proj4';
import { Gps } from '../gps/gps';

export interface CarburantRecord {
  id: string;
  name?: string;
  latitude?: number | string;
  longitude?: number | string;
  cp?: string;
  ville?: string;
  adresse?: string;
  prix_valeur?: number;
  carburants_disponibles?: string[];
  geom?: {
    lon: number;
    lat: number;
  };
  distanceKm?: number;
  gazole_prix?: number;
  e10_prix?: number;
  sp98_prix?: number;
}

export interface CarburantApiResponse {
  total_count: number;
  results: CarburantRecord[];
}

export interface ShopPoint {
  name: string;
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarburantApi {
  private readonly apiUrl = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
  private readonly pageSize = 100;
  private readonly maxShopMatchDistanceKm = 0.5;
  private readonly rayon = 20;
  private readonly gps = inject(Gps);
  private readonly http = inject(HttpClient);
  private shopsCache: ShopPoint[] | null = null;

  public readonly carburantResource = resource<CarburantApiResponse, { latitude: number; longitude: number } | undefined>({
    params: () => {
      const position = this.gps.position();

      if (!position) {
        return undefined;
      }

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    },
    loader: async ({ params }) => {
      const where = `within_distance(geom, geom'POINT(${params.longitude} ${params.latitude})', ${this.rayon}km)`;
      const allResults: CarburantRecord[] = [];
      let totalCount = 0;
      let offset = 0;

      do {
        const queryParams = new URLSearchParams({
          where,
          limit: String(this.pageSize),
          offset: String(offset),
        });

        const url = `${this.apiUrl}?${queryParams.toString()}`;
        const page = await firstValueFrom(this.http.get<CarburantApiResponse>(url));

        totalCount = page.total_count;
        allResults.push(...page.results);
        offset += this.pageSize;
      } while (offset < totalCount);

      const shops = await this.loadShops();

      const sortedResults = allResults
        .map((record) => ({
          ...record,
          name: this.findMatchingShop(record.geom?.lat, record.geom?.lon, shops),
          distanceKm: this.calculateDistanceKm(
            params.latitude,
            params.longitude,
            record.geom?.lat,
            record.geom?.lon
          ),
        }))
        .sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));

      return {
        total_count: totalCount,
        results: sortedResults,
      };
    },
  });

  public readonly carburantData = computed(() => this.carburantResource.value()?.results ?? []);
  public readonly isLoading = computed(() => this.carburantResource.isLoading());
  public readonly error = computed(() => this.carburantResource.error());

  public refresh(): void {
    this.carburantResource.reload();
  }

  private calculateDistanceKm(
    originLat: number,
    originLon: number,
    targetLat?: number,
    targetLon?: number
  ): number | undefined {
    if (targetLat === undefined || targetLon === undefined) {
      return undefined;
    }

    const toRadians = (value: number): number => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(targetLat - originLat);
    const deltaLon = toRadians(targetLon - originLon);

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(originLat)) * Math.cos(toRadians(targetLat)) * Math.sin(deltaLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private async loadShops(): Promise<ShopPoint[]> {
    if (this.shopsCache) {
      return this.shopsCache;
    }

    try {
      const csvText = await firstValueFrom(this.http.get('./shops_point.csv', { responseType: 'text' }));
      this.shopsCache = this.parseShopsCSV(csvText);
      return this.shopsCache;
    } catch (error) {
      console.warn('Erreur lors du chargement du fichier shops:', error);
      return [];
    }
  }

  private parseShopsCSV(csvText: string): ShopPoint[] {
    const lines = csvText.trim().split('\n');
    const shops: ShopPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }

      const pointIndex = line.lastIndexOf('POINT (');
      if (pointIndex === -1) {
        continue;
      }

      const name = line.substring(0, pointIndex).trim().replace(/,$/, '');
      if (!name) {
        continue;
      }

      const pointPart = line.substring(pointIndex);
      const coords = pointPart.match(/POINT \(([^)]+)\)/);
      if (!coords || !coords[1]) {
        continue;
      }

      const [x, y] = coords[1].split(' ').map(Number);
      if (Number.isNaN(x) || Number.isNaN(y)) {
        continue;
      }

      const wgs84 = this.webMercatorToWgs84(x, y);
      shops.push({
        name,
        lat: wgs84.lat,
        lon: wgs84.lon,
      });
    }

    return shops;
  }

  private webMercatorToWgs84(x: number, y: number): { lat: number; lon: number } {
    const [lon, lat] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);

    return {
      lon,
      lat,
    };
  }

  private findMatchingShop(apiLat?: number, apiLon?: number, shops: ShopPoint[] = []): string | undefined {
    if (apiLat === undefined || apiLon === undefined || shops.length === 0) {
      return undefined;
    }

    let closestShop: ShopPoint | null = null;
    let minDistanceKm = Number.POSITIVE_INFINITY;

    for (const shop of shops) {
      const distanceKm = this.calculateDistanceKm(apiLat, apiLon, shop.lat, shop.lon);
      if (distanceKm === undefined) {
        continue;
      }

      if (distanceKm <= this.maxShopMatchDistanceKm && distanceKm < minDistanceKm) {
        closestShop = shop;
        minDistanceKm = distanceKm;
      }
    }

    return closestShop?.name;
  }
}