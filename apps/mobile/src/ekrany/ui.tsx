/** Wspólne elementy interfejsu: duże przyciski (obsługa w ruchu), wybór z listy, styl. */
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const kolory = {
  tlo: "#FFFFFF",
  tekst: "#111111",
  drugorzedny: "#555555",
  akcent: "#0B5FFF",
  akcentTekst: "#FFFFFF",
  ramka: "#C8C8C8",
  wybrany: "#E3ECFF",
  blad: "#B00020",
} as const;

export function Ekran({ children, przewijany = true }: { children: ReactNode; przewijany?: boolean }) {
  return (
    <SafeAreaView style={styl.ekran} edges={["bottom", "left", "right"]}>
      {przewijany ? <ScrollView contentContainerStyle={styl.tresc}>{children}</ScrollView> : <View style={[styl.tresc, styl.wypelnij]}>{children}</View>}
    </SafeAreaView>
  );
}

export function Naglowek({ children }: { children: ReactNode }) {
  return (
    <Text style={styl.naglowek} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Akapit({ children, drugorzedny }: { children: ReactNode; drugorzedny?: boolean }) {
  return <Text style={[styl.akapit, drugorzedny && styl.drugorzedny]}>{children}</Text>;
}

export function Przycisk({
  tytul,
  opis,
  onPress,
  wylaczony,
  duzy,
  drugorzedny,
}: {
  tytul: string;
  opis?: string;
  onPress: () => void;
  wylaczony?: boolean;
  duzy?: boolean;
  drugorzedny?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!wylaczony }}
      accessibilityLabel={tytul}
      accessibilityHint={opis}
      disabled={wylaczony}
      onPress={onPress}
      style={({ pressed }) => [
        styl.przycisk,
        duzy && styl.przyciskDuzy,
        drugorzedny && styl.przyciskDrugorzedny,
        wylaczony && styl.wylaczony,
        pressed && styl.wcisniety,
      ]}
    >
      <Text style={[styl.przyciskTekst, duzy && styl.przyciskTekstDuzy, drugorzedny && styl.przyciskTekstDrugorzedny]}>{tytul}</Text>
      {opis ? <Text style={[styl.przyciskOpis, drugorzedny && styl.przyciskTekstDrugorzedny]}>{opis}</Text> : null}
    </Pressable>
  );
}

/** Który wariant oznaczenia AI pokazać według deklaracji pakietu (null: pakiet nie deklaruje AI). */
export function wariantAI(ai: { text: boolean; voice: boolean }): "tekstIGlos" | "tekst" | "glos" | null {
  return ai.text && ai.voice ? "tekstIGlos" : ai.text ? "tekst" : ai.voice ? "glos" : null;
}

/** Mały, statyczny napis (nie przycisk, bez animacji) czytany przez czytnik ekranu. */
export function Oznaczenie({ tekst, testID }: { tekst: string; testID?: string }) {
  return (
    <Text style={styl.oznaczenie} accessibilityRole="text" accessibilityLabel={tekst} testID={testID}>
      {tekst}
    </Text>
  );
}

/** Pozycja do wyboru (przełącznik albo jedna z wielu). */
export function Wybor({ tytul, wybrany, onPress, wielokrotny }: { tytul: string; wybrany: boolean; onPress: () => void; wielokrotny?: boolean }) {
  return (
    <Pressable
      accessibilityRole={wielokrotny ? "checkbox" : "radio"}
      accessibilityState={wielokrotny ? { checked: wybrany } : { selected: wybrany }}
      accessibilityLabel={tytul}
      onPress={onPress}
      style={[styl.wybor, wybrany && styl.wyborWybrany]}
    >
      <Text style={styl.wyborTekst}>{tytul}</Text>
    </Pressable>
  );
}

export const styl = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: kolory.tlo },
  tresc: { padding: 20, gap: 12 },
  wypelnij: { flex: 1 },
  naglowek: { fontSize: 22, fontWeight: "700", color: kolory.tekst, marginTop: 8 },
  akapit: { fontSize: 17, lineHeight: 24, color: kolory.tekst },
  drugorzedny: { color: kolory.drugorzedny },
  przycisk: { backgroundColor: kolory.akcent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, minHeight: 52, justifyContent: "center" },
  przyciskDuzy: { minHeight: 88, paddingVertical: 20 },
  przyciskDrugorzedny: { backgroundColor: kolory.tlo, borderWidth: 1, borderColor: kolory.ramka },
  przyciskTekst: { color: kolory.akcentTekst, fontSize: 18, fontWeight: "600", textAlign: "center" },
  przyciskTekstDuzy: { fontSize: 24 },
  przyciskTekstDrugorzedny: { color: kolory.tekst },
  przyciskOpis: { color: kolory.akcentTekst, fontSize: 15, textAlign: "center", marginTop: 4 },
  wylaczony: { opacity: 0.4 },
  wcisniety: { opacity: 0.7 },
  wybor: { borderWidth: 1, borderColor: kolory.ramka, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, minHeight: 48, justifyContent: "center" },
  wyborWybrany: { backgroundColor: kolory.wybrany, borderColor: kolory.akcent },
  wyborTekst: { fontSize: 17, color: kolory.tekst },
  rzad: { flexDirection: "row", gap: 12 },
  rzadElement: { flex: 1 },
  oznaczenie: { fontSize: 13, lineHeight: 18, color: kolory.drugorzedny, textAlign: "center" },
});
