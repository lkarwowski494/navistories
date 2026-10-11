import AsyncStorage from "@react-native-async-storage/async-storage";

/** Trwałe ustawienia użytkownika (za interfejsem, żeby ekrany dało się testować). */
export interface UstawieniaStore {
  czyUjawnienieAIPotwierdzone(): Promise<boolean>;
  potwierdzUjawnienieAI(): Promise<void>;
}

/** Wersja w kluczu: zmiana treści ujawnienia = nowy klucz = ujawnienie pokazane ponownie. */
const KLUCZ_UJAWNIENIE_AI = "navistories.ujawnienie-ai.v1";

export const asyncStorageUstawienia: UstawieniaStore = {
  async czyUjawnienieAIPotwierdzone() {
    try {
      return (await AsyncStorage.getItem(KLUCZ_UJAWNIENIE_AI)) === "tak";
    } catch {
      return false;
    }
  },
  async potwierdzUjawnienieAI() {
    await AsyncStorage.setItem(KLUCZ_UJAWNIENIE_AI, "tak");
  },
};
