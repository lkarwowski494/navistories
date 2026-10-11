// Rejestracja zadania lokalizacji w tle musi nastąpić przy starcie JS.
import "../system/lokalizacja";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AplikacjaProvider } from "../stan/aplikacja";
import { zaleznosciSystemowe } from "../stan/zaleznosci";
import { t } from "../teksty";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AplikacjaProvider zaleznosci={zaleznosciSystemowe}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
          <Stack.Screen name="index" options={{ title: t.aplikacja }} />
          <Stack.Screen name="ujawnienie-ai" options={{ title: t.ujawnienie.tytul, headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="spacer" options={{ title: t.spacer.tytul }} />
          <Stack.Screen name="samochod" options={{ title: t.samochod.tytul }} />
          <Stack.Screen name="sesja" options={{ title: t.aplikacja }} />
          <Stack.Screen name="zrodla" options={{ title: t.zrodla.tytul }} />
        </Stack>
      </AplikacjaProvider>
    </SafeAreaProvider>
  );
}
