# NaviStories — zasady dla agenta

- Repozytorium jest PUBLICZNE. Nigdy nie commituj sekretów (kluczy API, certyfikatów, .p8/.p12, .env). Przed każdym commitem sprawdź `git diff --cached` pod kątem sekretów.
- Treści (prompty, fact sheety, historie, nagrania) należą do prywatnego repo `navistories-warsztat`, nie tutaj.
- Liczby konfiguracyjne (promienie, progi, czasy) tylko w jednym module konfiguracji; reszta je importuje.
- Testy przed kodem. Logika wyzwalania historii to czysty TypeScript testowany bez telefonu.
- Narzędzia: 0 zł poza opłatą Apple. Przed dodaniem CI/usługi sprawdź darmowe limity (np. mnożnik minut macOS — w repo publicznym standardowe runnery są darmowe).
- Dokumentacja projektu: Google Drive, folder „NaviStories” (specyfikacja, dziennik decyzji, dokument 07 o podejściu programistycznym).

## Merytoryczne podstawy (zasada właściciela z 4 października 2026, obowiązuje we wszystkich jego aplikacjach)

Wszystko, czego aplikacja uczy albo co twierdzi (treść, liczby, zalecenia, reguły i mechaniki oparte na wiedzy dziedzinowej), musi mieć merytoryczne podstawy. Ta zasada ma pierwszeństwo przed domyślnym sposobem pracy.

- Każde twierdzenie ma **przeczytane** źródło (adres i cytat albo dokładne wskazanie miejsca). Streszczenie z wyszukiwarki nie jest źródłem. Czego nie da się potwierdzić, trafia do otwartych pytań, nie do aplikacji.
- Źródła według hierarchii poniżej; przy sprzeczności wygrywa wyższy szczebel. Przy sprzeczności na tym samym szczeblu podaj część wspólną (przedział, „zwykle”) i pokaż różnicę.
- Właściciel nie jest ekspertem dziedzinowym i **nie rozstrzyga kwestii merytorycznych**: rozstrzyga je ta hierarchia. Właściciela pytaj o sprawy produktowe (zakres, funkcje, wygląd, koszty, kolejność prac), zawsze z co najmniej dwiema opcjami, kompromisami i rekomendacją.
- Każdą decyzję merytoryczną zapisz w rejestrze projektu (dokumentacja na Google Drive) z uzasadnieniem i odrzuconymi alternatywami, żeby dało się ją sprawdzić i cofnąć. Właściciel może każdą zawetować.
- Uproszczenie jest dozwolone, gdy kierunkowo zgadza się z wyższymi szczeblami i jest nazwane uproszczeniem.

### Hierarchia źródeł dla historii i miejsc

1. Źródła pierwotne: dokumenty, archiwa, rejestry (np. rejestr zabytków NID), dane geograficzne z OpenStreetMap i urzędowych rejestrów.
2. Publikacje naukowe i monografie historyków.
3. Serwisy instytucji (muzea, urzędy, parafie, instytuty) i encyklopedie redagowane (np. Encyklopedia PWN).
4. Przewodniki i serwisy turystyczne z podanymi źródłami.
5. Wikipedia tylko jako wskazówka, gdzie szukać; nigdy jako jedyne źródło faktu.

Weryfikacja treści historii odbywa się w repozytorium  (100% faktów sprawdzonych względem surowych źródeł).
