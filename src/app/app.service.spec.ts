import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { AppService } from './app.service';


describe('AppService', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      declarations: [],
      providers: [
      ]
    })
    .compileComponents();

    injector = getTestBed();

    httpMock = injector.get(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: AppService = TestBed.get(AppService);
    expect(service).toBeTruthy();
  });

  it('getFaction() should work correctly', () => {
    const service: AppService = TestBed.get(AppService);

    const horde = [2, 5, 6, 8, 9, 10];
    const alliance = [1, 3, 4, 7, 11];

    expect(service.hordeCount).toBe(0);
    expect(service.allianceCount).toBe(0);

    for (const i of horde) {
      expect(service['getFaction'](i)).toBe('horde');
    }

    for (const i of alliance) {
      expect(service['getFaction'](i)).toBe('alliance');
    }

    expect(service.hordeCount).toBe(6);
    expect(service.allianceCount).toBe(5);

    expect(service['getFaction'](13)).toBe('');
  });

});
