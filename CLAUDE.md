# NaviStories — zasady dla agenta

- Repozytorium jest PUBLICZNE. Nigdy nie commituj sekretów (kluczy API, certyfikatów, .p8/.p12, .env). Przed każdym commitem sprawdź `git diff --cached` pod kątem sekretów.
- Treści (prompty, fact sheety, historie, nagrania) należą do prywatnego repo `navistories-warsztat`, nie tutaj.
- Liczby konfiguracyjne (promienie, progi, czasy) tylko w jednym module konfiguracji; reszta je importuje.
- Testy przed kodem. Logika wyzwalania historii to czysty TypeScript testowany bez telefonu.
- Narzędzia: 0 zł poza opłatą Apple. Przed dodaniem CI/usługi sprawdź darmowe limity (np. mnożnik minut macOS — w repo publicznym standardowe runnery są darmowe).
- Dokumentacja projektu: Google Drive, folder „NaviStories” (specyfikacja, dziennik decyzji, dokument 07 o podejściu programistycznym).
