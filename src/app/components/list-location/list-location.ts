import { Component, computed, inject } from '@angular/core';
import { CarburantApi } from '../../services/carburant-api/carburant-api';
import { Location } from "../location/location";

@Component({
  selector: 'app-list-location',
  imports: [Location],
  templateUrl: './list-location.html',
  styleUrl: './list-location.scss',
})
export class ListLocation {
  private readonly carburantApi = inject(CarburantApi);

  public readonly stations = this.carburantApi.carburantData;
  public readonly isLoading = this.carburantApi.isLoading;
  public readonly error = this.carburantApi.error;

  public readonly stationCount = computed(() => this.stations().length);

  public refresh(): void {
    this.carburantApi.refresh();
  }
}
