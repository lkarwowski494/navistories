import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAplikacja } from "../stan/aplikacja";
import { t } from "../teksty";
import { Ekran, Naglowek, Przycisk } from "./ui";

/** Wybór trybu. Przy pierwszym uruchomieniu najpierw ujawnienie AI. */
export function EkranStartowy() {
  const router = useRouter();
  const { zaleznosci } = useAplikacja();
  const [potwierdzone, setPotwierdzone] = useState<boolean | null>(null);

  useEffect(() => {
    let aktywny = true;
    zaleznosci.ustawienia.czyUjawnienieAIPotwierdzone().then((v) => aktywny && setPotwierdzone(v));
    return () => {
      aktywny = false;
    };
  }, [zaleznosci]);

  if (potwierdzone === null) return null;
  if (!potwierdzone) return <Redirect href="/ujawnienie-ai" />;

  return (
    <Ekran>
      <Naglowek>{t.start.pytanie}</Naglowek>
      <Przycisk duzy tytul={t.start.samochod} opis={t.start.samochodOpis} onPress={() => router.push("/samochod")} />
      <Przycisk duzy tytul={t.start.spacer} opis={t.start.spacerOpis} onPress={() => router.push("/spacer")} />
      <Przycisk drugorzedny tytul={t.start.oAplikacji} onPress={() => router.push("/o-aplikacji")} />
    </Ekran>
  );
}
