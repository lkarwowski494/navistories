import { useRouter } from "expo-router";
import { useState } from "react";
import { useAplikacja } from "../stan/aplikacja";
import { t } from "../teksty";
import { Akapit, Ekran, Naglowek, Przycisk } from "./ui";

/** Ujawnienie przy pierwszym uruchomieniu: treść i głos są generowane przez AI. */
export function EkranUjawnienia() {
  const router = useRouter();
  const { zaleznosci } = useAplikacja();
  const [zapisuje, setZapisuje] = useState(false);

  const potwierdz = async () => {
    setZapisuje(true);
    try {
      await zaleznosci.ustawienia.potwierdzUjawnienieAI();
    } finally {
      setZapisuje(false);
    }
    router.replace("/");
  };

  return (
    <Ekran>
      <Naglowek>{t.ujawnienie.tytul}</Naglowek>
      <Akapit>{t.ujawnienie.tresc}</Akapit>
      <Przycisk tytul={t.ujawnienie.przycisk} onPress={potwierdz} wylaczony={zapisuje} />
    </Ekran>
  );
}
