import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useAplikacja, useSessionView, type AktywnaSesja } from "../stan/aplikacja";
import { t } from "../teksty";
import { Akapit, Ekran, kolory, Naglowek, Oznaczenie, Przycisk, styl, wariantAI } from "./ui";

/**
 * Ekran jazdy / spaceru. Start tylko przyciskiem. W ruchu: stan (gra / w
 * kolejce / poza trasą), play/pauza, następna i nic więcej (bezpieczeństwo
 * kierowcy). „Źródła” bieżącej historii: w trakcie spaceru od razu, w
 * samochodzie po zakończeniu podróży (lista wysłuchanych historii).
 * Oznaczenie AI (według `aiGenerated` pakietu) jest stale widoczne: przed
 * startem, w trakcie i po zakończeniu.
 */
export function EkranSesji() {
  const { pakiet: pakietId, motywy } = useLocalSearchParams<{ pakiet?: string; motywy?: string }>();
  const { przygotuj } = useAplikacja();
  const [aktywna, setAktywna] = useState<AktywnaSesja | null | undefined>(undefined);

  useEffect(() => {
    setAktywna(pakietId ? przygotuj(pakietId, motywy ? motywy.split(",").filter(Boolean) : null) : null);
  }, [pakietId, motywy, przygotuj]);

  if (aktywna === undefined) return null;
  if (aktywna === null) {
    return (
      <Ekran>
        <Akapit>{t.sesja.brakPakietu}</Akapit>
      </Ekran>
    );
  }
  return <Sesja aktywna={aktywna} />;
}

function Sesja({ aktywna }: { aktywna: AktywnaSesja }) {
  const router = useRouter();
  const { zakoncz } = useAplikacja();
  const { session, pakiet } = aktywna;
  const v = useSessionView(session);
  const wariant = wariantAI(pakiet.aiGenerated);
  const oznaczenieAI = wariant ? <Oznaczenie tekst={t.sesja.ai[wariant]} testID="oznaczenie-ai" /> : null;

  const pokazZrodla = (punkt: string) => router.push({ pathname: "/zrodla", params: { pakiet: pakiet.id, punkt } });
  const nowa = () => {
    zakoncz();
    router.dismissTo("/");
  };

  if (v.phase === "ready" || v.phase === "starting") {
    return (
      <Ekran przewijany={false}>
        <Naglowek>{pakiet.title}</Naglowek>
        <Akapit drugorzedny>{t.sesja.startOpis}</Akapit>
        <Przycisk duzy tytul={t.sesja.start} wylaczony={v.phase === "starting"} onPress={() => void session.start()} />
        {oznaczenieAI}
      </Ekran>
    );
  }

  if (v.phase === "error") {
    return (
      <Ekran>
        <Text style={[styl.akapit, { color: kolory.blad }]} accessibilityRole="alert">
          {t.sesja.blad[v.error ?? "location"]}
        </Text>
        <Przycisk tytul={t.sesja.nowa} onPress={nowa} />
      </Ekran>
    );
  }

  if (v.phase === "stopped") {
    const zagrane = v.played.map((id) => pakiet.points.find((p) => p.id === id)).filter((p) => p !== undefined);
    return (
      <Ekran>
        <Naglowek>{t.sesja.koniec}</Naglowek>
        <Akapit drugorzedny>{t.sesja.zagrane}</Akapit>
        {zagrane.length === 0 ? <Akapit>{t.sesja.brakZagranych}</Akapit> : null}
        {zagrane.map((p) => (
          <Przycisk key={p.id} drugorzedny tytul={p.title} opis={t.sesja.zrodla} onPress={() => pokazZrodla(p.id)} />
        ))}
        <Przycisk tytul={t.sesja.nowa} onPress={nowa} />
        {oznaczenieAI}
      </Ekran>
    );
  }

  // phase === "running"
  const gra = v.current !== null;
  return (
    <Ekran przewijany={false}>
      <View accessibilityLiveRegion="polite">
        <Text style={styl.naglowek} testID="stan-sesji">
          {v.paused ? t.sesja.zatrzymana : t.sesja.stan[v.activity]}
        </Text>
        {v.current ? <Akapit>{v.current.title}</Akapit> : null}
        {v.queued > 0 && v.activity !== "queued" ? <Akapit drugorzedny>{t.sesja.wKolejce(v.queued)}</Akapit> : null}
      </View>
      <View style={{ flex: 1 }} />
      <View style={styl.rzad}>
        <View style={styl.rzadElement}>
          <Przycisk
            duzy
            tytul={v.paused ? t.sesja.graj : t.sesja.pauza}
            wylaczony={!gra}
            onPress={() => (v.paused ? session.resume() : session.pause())}
          />
        </View>
        <View style={styl.rzadElement}>
          <Przycisk duzy tytul={t.sesja.nastepna} wylaczony={!gra} onPress={() => session.next()} />
        </View>
      </View>
      {pakiet.mode === "walk" && v.current ? (
        <Przycisk drugorzedny tytul={t.sesja.zrodla} onPress={() => pokazZrodla(v.current!.id)} />
      ) : null}
      <Przycisk drugorzedny tytul={t.sesja.stop} onPress={() => session.stop()} />
      {oznaczenieAI}
    </Ekran>
  );
}
