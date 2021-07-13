import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { API_URL } from 'config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BOSSES } from './utils/bosses';
import { PlayerType } from './utils/player.type';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  encounters: any[];
  private players = [];

  constructor(private http: HttpClient) {
    this.players$.subscribe(players => {
      this.encounters = this.filterBoss(players);
      this.players = players;
    })
  }

  get hordeCount()    { return this._hordeCount;    }
  get allianceCount() { return this._allianceCount; }
  get players$()      { return this._players$;      }
  // get scores$()       { return this._scores$;       }

  currentBoss = BOSSES[0].id;

  handleBoss(currentBoss): void {
    this.currentBoss = currentBoss;
    this.encounters = this.filterBoss(this.players);
  }

  private filterBoss(data: any): [] {
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
        d.timeStamp = this.timestamp(d.time_stamp);
        d.duration = this.millisToMinutesAndSeconds(d.duration);
        return d;
      }).filter(d => d.name != "")), // need to fix API side
    );

  // private _scores$ = this.http.get(`${API_URL}/eluna/eventscript_score`).pipe(map(data => this.handleFaction(data)));

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

  private timestamp(unix_timestamp): string {
    const ts = new Date(unix_timestamp * 1000);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = ts.getFullYear();
    const month = months[ts.getMonth()];
    const date = ts.getDate();
    const hour = this.paddingTime(ts.getHours());
    const min = this.paddingTime(ts.getMinutes());
    const sec = this.paddingTime(ts.getSeconds());
    const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

    return time;
  }

  private paddingTime(time: number): string | number {
    return time.toString().length < 2 ? '0' + time : time;
  }

  // RaidEntry = 10*(encounterId - 1) + 1112000 + 1
  // PartyEntry = 10*(encounterId - 1) + 1112000 + 3
  private getPartyOrRaidEntry(encounter: number, group_type: number): number {
    return 10 * (encounter -1) + 1112000 + (group_type === 1 ? 3 : 1);
  }

  private millisToMinutesAndSeconds(millis: number): string {
    const minutes = Math.floor(millis / 60000);
    const seconds = Number(((millis % 60000) / 1000).toFixed(0));
    return (
      seconds == 60
      ? (minutes+1) + ":00"
      : minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
  }

  sortData(sort: Sort) {
    const data = this.players?.slice();
    if (!sort.active || sort.direction === '') {
      this.encounters = data;
      return;
    }

    this.encounters = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'class': return this.compare(a.class, b.class, isAsc);
        case 'race': return this.compare(a.race, b.race, isAsc);
        case 'faction': return this.compare(a.faction, b.faction, isAsc);
        case 'level': return this.compare(a.level, b.level, isAsc);
        case 'timeStamp': return this.compare(a.timeStamp, b.timeStamp, isAsc);
        case 'difficulty': return this.compare(a.difficulty, b.difficulty, isAsc);
        case 'duration': return this.compare(a.duration, b.duration, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
