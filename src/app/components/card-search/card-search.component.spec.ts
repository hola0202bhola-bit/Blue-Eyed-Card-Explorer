import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardSearchComponent } from './card-search.component';

describe('Search regressions', () => {
  let fixture: ComponentFixture<CardSearchComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [CardSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(CardSearchComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    fixture.destroy();
    vi.useRealTimers();
  });

  function enter(term: string): void {
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('input');
    if (!input) { throw new Error('Search input not found'); }
    input.value = term;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  it('debounces keystrokes and permits the same query after clearing the input', async () => {
    enter('Ku');
    await vi.advanceTimersByTimeAsync(200);
    enter('Kuriboh');
    await vi.advanceTimersByTimeAsync(449);
    http.expectNone((req) => req.url.endsWith('/cardinfo.php'));
    await vi.advanceTimersByTimeAsync(1);
    http.expectOne((req) => req.params.get('fname') === 'Kuriboh').flush({ data: [] });
    enter('');
    enter('Kuriboh');
    await vi.advanceTimersByTimeAsync(450);
    http.expectOne((req) => req.params.get('fname') === 'Kuriboh').flush({ data: [] });
  });

  it('immediately cancels an obsolete HTTP request when the query is cleared', async () => {
    enter('Kuriboh');
    await vi.advanceTimersByTimeAsync(450);
    const request = http.expectOne((req) => req.params.get('fname') === 'Kuriboh');
    enter('');
    expect(request.cancelled).toBe(true);
    await vi.advanceTimersByTimeAsync(450);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.search-hint')).not.toBeNull();
  });

  it('reports malformed requests as errors rather than empty search results', async () => {
    enter('Kuriboh');
    await vi.advanceTimersByTimeAsync(450);
    http.expectOne((req) => req.params.get('fname') === 'Kuriboh')
      .flush({ error: 'Invalid parameter' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
  });
});
