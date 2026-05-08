import { Injectable, signal } from '@angular/core';
import { StatutGps } from '../../models/enum/statut-gps.enum';

@Injectable({
  providedIn: 'root',
})
export class Gps {
  private readonly _statut = signal(StatutGps.INACTIF);
  public readonly statut = this._statut.asReadonly();

  private readonly _position = signal<GeolocationPosition | null>(null);
  public readonly position = this._position.asReadonly();

  constructor() { this.activerGps(); }

  /**
   * Active le GPS et met à jour le statut et la position en conséquence.
   * @returns 
   */
  public activerGps(): void {
    if (!('geolocation' in navigator)) {
      this._statut.set(StatutGps.ERREUR);
      return;
    }

    this._statut.set(StatutGps.EN_ATTENTE);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this._position.set(position);
        console.log('Position GPS récupérée :', position);
        this._statut.set(StatutGps.ACTIF);
      },
      (error) => {
        console.error('Erreur lors de la récupération de la position GPS :', error);
        if (error.code === error.PERMISSION_DENIED) {
          this._statut.set(StatutGps.INACTIF);
          return;
        }

        this._statut.set(StatutGps.ERREUR);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

}
