import { carRoutes } from "@navistories/pakiet";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAplikacja } from "../stan/aplikacja";
import { t } from "../teksty";
import { Akapit, Ekran, Naglowek, Przycisk, Wybor } from "./ui";

/** Samochód: wybór trasy (pakietu) i filtra motywów. */
export function EkranSamochodu() {
  const router = useRouter();
  const { zaleznosci } = useAplikacja();
  const trasy = carRoutes(zaleznosci.katalog.pakiety);
  const [trasaId, setTrasaId] = useState<string | null>(trasy[0]?.id ?? null);
  const trasa = trasy.find((p) => p.id === trasaId) ?? null;
  const [wylaczone, setWylaczone] = useState<readonly string[]>([]);

  if (!trasa) {
    return (
      <Ekran>
        <Akapit>{t.samochod.brak}</Akapit>
      </Ekran>
    );
  }

  const wybrane = trasa.themes.map((m) => m.id).filter((id) => !wylaczone.includes(id));
  const przelacz = (id: string) => setWylaczone((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  return (
    <Ekran>
      <Naglowek>{t.samochod.trasa}</Naglowek>
      {trasy.map((p) => (
        <Wybor
          key={p.id}
          tytul={p.title}
          wybrany={p.id === trasaId}
          onPress={() => {
            setTrasaId(p.id);
            setWylaczone([]);
          }}
        />
      ))}
      <Naglowek>{t.samochod.motywy}</Naglowek>
      <Akapit drugorzedny>{t.samochod.motywyOpis}</Akapit>
      {trasa.themes.map((m) => (
        <Wybor key={m.id} wielokrotny tytul={m.name} wybrany={wybrane.includes(m.id)} onPress={() => przelacz(m.id)} />
      ))}
      {wybrane.length === 0 ? <Akapit drugorzedny>{t.samochod.wybierzMotyw}</Akapit> : null}
      <Przycisk
        tytul={t.samochod.dalej}
        wylaczony={wybrane.length === 0}
        onPress={() => router.push({ pathname: "/sesja", params: { pakiet: trasa.id, motywy: wybrane.join(",") } })}
      />
    </Ekran>
  );
}
