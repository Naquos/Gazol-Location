import { Component, inject } from '@angular/core';
import { Header } from './components/header/header';
import { ListLocation } from "./components/list-location/list-location";
import { LoadingGps } from "./components/loading-gps/loading-gps";
import { Gps } from './services/gps/gps';
import { StatutGps } from './models/enum/statut-gps.enum';

@Component({
  selector: 'app-root',
  imports: [Header, ListLocation, LoadingGps],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly gps = inject(Gps);

  protected readonly statutGps = this.gps.statut;
  protected readonly StatutGps = StatutGps;
}
