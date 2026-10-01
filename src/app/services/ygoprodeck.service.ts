import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CardApiResponse, YgoCard } from '../models/interfaces/card.interface';

@Injectable({ providedIn: 'root' })
export class YgoprodeckService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

  searchCards(partialName: string): Observable<readonly YgoCard[]> {
    return this.requestCards(new HttpParams().set('fname', partialName));
  }
  getBlueEyesCards(): Observable<readonly YgoCard[]> {
    return this.requestCards(new HttpParams().set('archetype', 'Blue-Eyes'));
  }
  private requestCards(params: HttpParams): Observable<readonly YgoCard[]> {
    return this.http.get<CardApiResponse>(this.apiUrl, { params }).pipe(map((response) => response.data));
  }
}
