import { Component } from '@angular/core';
import { SERVER_NAME } from 'config';
import { AppService } from './app.service';
import { BOSSES } from './utils/bosses';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public service: AppService) {}

  readonly SERVER_NAME = SERVER_NAME;
  readonly BOSSES = BOSSES;
}
