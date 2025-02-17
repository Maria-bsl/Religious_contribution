import { Injectable } from '@angular/core';
import { Subject, Observable, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnsubscribeService {
  private readonly _destroy$ = new Subject<void>();
  constructor() {}
  public readonly takeUntilDestroy = <T>(
    origin: Observable<T>
  ): Observable<T> => origin.pipe(takeUntil(this._destroy$));

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
