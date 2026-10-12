import { DANE_OSM_W_PAKIETACH, KONTAKT_REDAKCJI, REDAKCJA_OSOBA } from "../konfiguracja";
import { t } from "../teksty";
import { Akapit, Ekran, Naglowek } from "./ui";

/**
 * „O aplikacji”: kto odpowiada redakcyjnie za treści, kontakt, jak powstają
 * historie (AI + weryfikacja człowieka), atrybucja danych OSM, gdy są używane.
 * Parametry domyślnie z konfiguracji; nadpisywane tylko w testach.
 */
export function EkranOAplikacji({
  osoba = REDAKCJA_OSOBA,
  kontakt = KONTAKT_REDAKCJI,
  daneOSM = DANE_OSM_W_PAKIETACH,
}: {
  osoba?: string;
  kontakt?: string | null;
  daneOSM?: boolean;
}) {
  return (
    <Ekran>
      <Naglowek>{t.oAplikacji.redakcjaNaglowek}</Naglowek>
      <Akapit>{t.oAplikacji.redakcja(osoba)}</Akapit>
      <Akapit drugorzedny={kontakt === null}>{kontakt === null ? t.oAplikacji.kontaktBrak : t.oAplikacji.kontakt(kontakt)}</Akapit>
      <Naglowek>{t.oAplikacji.procesNaglowek}</Naglowek>
      <Akapit>{t.oAplikacji.proces}</Akapit>
      {daneOSM ? (
        <>
          <Naglowek>{t.oAplikacji.mapyNaglowek}</Naglowek>
          <Akapit>{t.oAplikacji.mapy}</Akapit>
        </>
      ) : null}
    </Ekran>
  );
}
