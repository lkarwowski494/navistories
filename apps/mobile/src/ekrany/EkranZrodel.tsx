import { useLocalSearchParams } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";
import { useAplikacja } from "../stan/aplikacja";
import { t } from "../teksty";
import { Akapit, Ekran, kolory, Naglowek, styl, wariantAI } from "./ui";

/** Źródła historii: instytucje i adresy (wyróżnik produktu) oraz oznaczenie AI. */
export function EkranZrodel() {
  const { pakiet: pakietId, punkt } = useLocalSearchParams<{ pakiet?: string; punkt?: string }>();
  const { zaleznosci } = useAplikacja();
  const pakiet = pakietId ? zaleznosci.katalog.pakiet(pakietId) : null;
  const p = pakiet?.points.find((x) => x.id === punkt) ?? null;

  if (!pakiet || !p) {
    return (
      <Ekran>
        <Akapit>{t.zrodla.brak}</Akapit>
      </Ekran>
    );
  }

  const ai = { tekstIGlos: t.zrodla.ai, tekst: t.zrodla.aiTekst, glos: t.zrodla.aiGlos, brak: null }[wariantAI(pakiet.aiGenerated) ?? "brak"];

  return (
    <Ekran>
      <Naglowek>{p.title}</Naglowek>
      <Akapit drugorzedny>{t.zrodla.wstep}</Akapit>
      {p.sources.map((s) => (
        <View key={s.url} style={{ gap: 2 }}>
          <Text style={[styl.akapit, { fontWeight: "600" }]}>{s.institution}</Text>
          <Pressable accessibilityRole="link" accessibilityLabel={t.zrodla.otworz(s.institution)} onPress={() => void Linking.openURL(s.url)}>
            <Text style={[styl.akapit, { color: kolory.akcent, textDecorationLine: "underline" }]}>{s.url}</Text>
          </Pressable>
        </View>
      ))}
      {ai ? <Akapit drugorzedny>{ai}</Akapit> : null}
    </Ekran>
  );
}
