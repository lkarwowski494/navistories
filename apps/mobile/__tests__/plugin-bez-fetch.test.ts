import { usunTrybFetch } from '../plugins/bez-fetch';

describe('plugin bez-fetch', () => {
  it('usuwa tryb tła fetch i zostawia location oraz audio', () => {
    expect(usunTrybFetch({ UIBackgroundModes: ['fetch', 'location', 'audio'] })).toEqual({
      UIBackgroundModes: ['location', 'audio'],
    });
  });

  it('nie zmienia konfiguracji bez trybów tła', () => {
    expect(usunTrybFetch({ Inny: 1 })).toEqual({ Inny: 1 });
  });
});
