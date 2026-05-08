import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Gps } from '../../services/gps/gps';
import { StatutGps } from '../../models/enum/statut-gps.enum';

@Component({
  selector: 'app-loading-gps',
  imports: [],
  templateUrl: './loading-gps.html',
  styleUrl: './loading-gps.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingGps {
  protected readonly gps = inject(Gps);
  protected readonly StatutGps = StatutGps;
}
