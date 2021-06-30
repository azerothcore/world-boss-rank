import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BOSSES } from './utils/bosses';
import { PlayerType } from './utils/player.type';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  get hordeCount()    { return this._hordeCount;    }
  get allianceCount() { return this._allianceCount; }
  get players$()      { return this._players$;      }
  get scores$()       { return this._scores$;       }

  currentBoss = BOSSES[0].id;

  handleBoss(currentBoss): void {
    this.currentBoss = currentBoss;
  }

  filterBoss(data): [] {
    return data
      .filter(d => d.bossId == this.currentBoss)
      .map(d => {
        d.group_type = d.group_type === 1 ? 'Party' : 'Raid';
        return d;
      });
  }

  private _hordeCount = 0;
  private _allianceCount = 0;
  private _players$: Observable<PlayerType[]> = this.http.get<PlayerType[]>(`${API_URL}/eluna/eventscript_encounters`)
    .pipe(
      map(data => this.handleFaction(data)),
      map(data => data.map(d => {
        d.bossId = this.getPartyOrRaidEntry(d.encounter, d.group_type);
        return d;
      })),
    );

  private _scores$ = this.http.get(`${API_URL}/eluna/eventscript_score`).pipe(map(data => this.handleFaction(data)));

  private getFaction(race: number): string {
    switch (race) {
      case 2:
      case 5:
      case 6:
      case 8:
      case 9:
      case 10:
        this._hordeCount++;
        return 'horde';
      case 1:
      case 3:
      case 4:
      case 7:
      case 11:
        this._allianceCount++;
        return 'alliance';
      default:
        return '';
    }
  }

  private handleFaction(data: any): any[] {
    return data.map((d) => {
      d.faction = this.getFaction(d.race);
      return d;
    });
  }

  public timestamp(unix_timestamp): string {
    const ts = new Date(unix_timestamp * 1000);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = ts.getFullYear();
    const month = months[ts.getMonth()];
    const date = ts.getDate();
    const hour = ts.getHours();
    const min = ts.getMinutes();
    const sec = ts.getSeconds();
    const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

    return time;
  }

  // RaidEntry = 10*(encounterId - 1) + 1112000 + 1
  // PartyEntry = 10*(encounterId - 1) + 1112000 + 3
  private getPartyOrRaidEntry(encounter: number, group_type: number): number {
    return 10 * (encounter -1) + 1112000 + (group_type === 1 ? 3 : 1);
  }

}
