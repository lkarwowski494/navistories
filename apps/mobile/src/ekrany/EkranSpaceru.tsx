import { findWalks, walkThemes } from "@navistories/pakiet";
import { useRouter } from "expo-router";
import { useState } from "react";
import { WALK_DURATION_OPTIONS_MIN } from "../konfiguracja";
import { useAplikacja } from "../stan/aplikacja";
import { t } from "../teksty";
import { Akapit, Ekran, Naglowek, Przycisk, styl, Wybor } from "./ui";
import { View } from "react-native";

/** Spacer: motyw i długość, potem gotowy spacer z katalogu. */
export function EkranSpaceru() {
  const router = useRouter();
  const { zaleznosci } = useAplikacja();
  const katalog = zaleznosci.katalog.pakiety;
  const motywy = walkThemes(katalog);
  const [motyw, setMotyw] = useState<string | null>(motywy[0]?.id ?? null);
  const [dlugosc, setDlugosc] = useState<number>(WALK_DURATION_OPTIONS_MIN[0]);

  if (motywy.length === 0 || motyw === null) {
    return (
      <Ekran>
        <Akapit>{t.spacer.brakMotywow}</Akapit>
      </Ekran>
    );
  }

  const spacery = findWalks(katalog, motyw, dlugosc, WALK_DURATION_OPTIONS_MIN);

  return (
    <Ekran>
      <Naglowek>{t.spacer.motyw}</Naglowek>
      {motywy.map((m) => (
        <Wybor key={m.id} tytul={m.name} wybrany={m.id === motyw} onPress={() => setMotyw(m.id)} />
      ))}
      <Naglowek>{t.spacer.dlugosc}</Naglowek>
      <View style={styl.rzad}>
        {WALK_DURATION_OPTIONS_MIN.map((d) => (
          <View key={d} style={styl.rzadElement}>
            <Wybor tytul={t.spacer.dlugoscOpcja(d)} wybrany={d === dlugosc} onPress={() => setDlugosc(d)} />
          </View>
        ))}
      </View>
      <Naglowek>{t.spacer.spacery}</Naglowek>
      {spacery.length === 0 ? <Akapit drugorzedny>{t.spacer.brak}</Akapit> : null}
      {spacery.map((p) => (
        <Przycisk key={p.id} tytul={p.title} onPress={() => router.push({ pathname: "/sesja", params: { pakiet: p.id } })} />
      ))}
    </Ekran>
  );
}
