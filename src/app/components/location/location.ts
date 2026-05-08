import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CarburantRecord } from '../../services/carburant-api/carburant-api';

@Component({
  selector: 'app-location',
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Location {
  public readonly carburantRecord = input<CarburantRecord>();
}
