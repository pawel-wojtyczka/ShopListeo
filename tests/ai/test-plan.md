  <TEST_SCENARIO_1>
    ## Cel: Utwórz nową listę zakupów jako zarejestrowany użytkownik
    ## Grupa Testów: Zarządzanie Listami Zakupów
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 (używający dynamicznego adresu e-mail) musi być zalogowany. Osiąga się to poprzez skonfigurowanie projektu testowego do używania zapisanego `storageState` z testu rejestracji.
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Brak jawnych kroków w samym teście, ponieważ uwierzytelnianie jest obsługiwane przez konfigurację projektu Playwright wczytującą `storageState`.
    ## Zestaw Testów: shopping-list.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000` (lub skonfigurowanego `baseURL`).
      2. Kliknij przycisk "Nowa Lista".
    ## Oczekiwane Wyniki / Asercje:
      - Nowy element listy zakupów pojawia się na liście list zakupów.
      - Nowy element listy zakupów nazywa się "Lista zakupów <DD.MM.RRRR>" (lub podobnie, w zależności od bieżącej lub mockowanej daty).
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Obsłuż dynamiczną datę w nazwie listy zakupów. Rozważ mockowanie daty dla stabilności testu.
    ## Potencjalne Wyzwania:
      - Wymaga mockowania bieżącej daty, aby testy były stabilne.
  </TEST_SCENARIO_1>

  <TEST_SCENARIO_2>
    ## Cel: Zmień nazwę listy zakupów jako zarejestrowany użytkownik
    ## Grupa Testów: Zarządzanie Listami Zakupów
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 musi być zalogowany (poprzez `storageState`).
      - Musi istnieć co najmniej jedna lista zakupów utworzona przez tego użytkownika.
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Upewnij się, że dla tego użytkownika istnieje lista zakupów (np. utworzona w TEST_SCENARIO_2 lub w osobnym kroku konfiguracyjnym w ramach tego testu/zestawu) o znanej domyślnej nazwie (np. "Lista zakupów <DD.MM.RRRR>").
    ## Zestaw Testów: shopping-list.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000`.
      2. Kliknij element listy zakupów o znanej domyślnej nazwie.
      3. Zmień nazwę listy na "Lista zakupów na weekend".
    ## Oczekiwane Wyniki / Asercje:
      - Strona szczegółów listy zakupów pozostaje otwarta.
      - Wyświetlane jest powiadomienie o sukcesie informujące, że nazwa listy zakupów została zmieniona.
      - Powrót na główną stronę list (`127.0.0.1:3000`) pokazuje zaktualizowaną nazwę listy "Lista zakupów na weekend".
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Identyfikatory list zakupów będą dynamiczne.
    ## Potencjalne Wyzwania:
      - Potrzeba dynamicznego pobrania adresu URL lub identyfikatora dla konkretnej listy zakupów.
  </TEST_SCENARIO_2>

  <TEST_SCENARIO_3>
    ## Cel: Dodaj produkty do listy zakupów jako zarejestrowany użytkownik
    ## Grupa Testów: Zarządzanie Pozycjami Listy Zakupów
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 musi być zalogowany (poprzez `storageState`).
      - Dla tego użytkownika musi istnieć lista zakupów (np. "Lista zakupów na weekend" z TEST_SCENARIO_3).
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Upewnij się, że dla bieżącego użytkownika istnieje lista zakupów o nazwie "Lista zakupów na weekend".
    ## Zestaw Testów: shopping-list.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000`.
      2. Kliknij element listy zakupów "Lista zakupów na weekend".
      3. Wpisz "Kup chleb, mleko, kakao i jeszcze sporo jogurtów pitnych dla dzieci, bo jadar tego dużo" w pole tekstowe "Dodaj nowy produkt".
      4. Kliknij przycisk "Dodaj produkt".
    ## Oczekiwane Wyniki / Asercje:
      - Wyświetlana jest lista nowych pozycji na liście zakupów.
      - Lista zakupów zawiera pozycje "chleb", "mleko", "kakao", "k jogurtów pitnych dla dzieci".
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Brak
    ## Potencjalne Wyzwania:
      - Brak
  </TEST_SCENARIO_3>

  <TEST_SCENARIO_4>
    ## Cel: Edytuj pozycję listy zakupów jako zarejestrowany użytkownik
    ## Grupa Testów: Zarządzanie Pozycjami Listy Zakupów
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 musi być zalogowany (poprzez `storageState`).
      - Dla tego użytkownika musi istnieć lista zakupów (np. "Lista zakupów na weekend").
      - Lista zakupów musi zawierać pozycję "k jogurtów pitnych dla dzieci".
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Upewnij się, że dla bieżącego użytkownika istnieje lista zakupów o nazwie "Lista zakupów na weekend".
      - Upewnij się, że lista "Lista zakupów na weekend" zawiera pozycje "chleb", "mleko", "kakao", "k jogurtów pitnych dla dzieci".
    ## Zestaw Testów: shopping-list.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000`.
      2. Kliknij element listy zakupów "Lista zakupów na weekend".
      3. Znajdź pozycję listy zakupów z etykietą "k jogurtów pitnych dla dzieci" i edytuj ją na "6 szt. jogurtów pitnych dla dzieci".
    ## Oczekiwane Wyniki / Asercje:
      - Pozycja listy zakupów jest zaktualizowana na "6 szt. jogurtów pitnych dla dzieci".
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Potrzebne są stabilne selektory dla przycisków edycji i usuwania dla każdej pozycji produktu.
    ## Potencjalne Wyzwania:
      - Potrzebne są stabilne selektory dla przycisku edycji.
  </TEST_SCENARIO_4>

  <TEST_SCENARIO_5>
    ## Cel: Usuń pozycję listy zakupów jako zarejestrowany użytkownik
    ## Grupa Testów: Zarządzanie Pozycjami Listy Zakupów
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 musi być zalogowany (poprzez `storageState`).
      - Dla tego użytkownika musi istnieć lista zakupów (np. "Lista zakupów na weekend").
      - Lista zakupów musi zawierać pozycję "mleko".
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Upewnij się, że dla bieżącego użytkownika istnieje lista zakupów o nazwie "Lista zakupów na weekend".
      - Upewnij się, że lista "Lista zakupów na weekend" zawiera pozycję "mleko" (i inne, zgodnie z poprzednimi krokami, jeśli testy są sekwencyjne).
    ## Zestaw Testów: shopping-list.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000`.
      2. Kliknij element listy zakupów "Lista zakupów na weekend".
      3. Znajdź pozycję listy zakupów z etykietą "mleko" i usuń ją.
    ## Oczekiwane Wyniki / Asercje:
      - Pozycja listy zakupów "mleko" zostaje usunięta z listy zakupów.
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Potrzebne są stabilne selektory dla przycisków edycji i usuwania dla każdej pozycji produktu.
    ## Potencjalne Wyzwania:
      - Potrzebne są stabilne selektory dla przycisku usuwania.
  </TEST_SCENARIO_5>

  <TEST_SCENARIO_6>
    ## Cel: Usuń listę zakupów jako zarejestrowany użytkownik
    ## Grupa Testów: Zarządzanie Listami Zakupów
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 musi być zalogowany (poprzez `storageState`).
      - Dla tego użytkownika musi istnieć lista zakupów (np. "Lista zakupów na weekend").
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Upewnij się, że dla bieżącego użytkownika istnieje lista zakupów o nazwie "Lista zakupów na weekend".
    ## Zestaw Testów: shopping-list.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000`.
      2. Znajdź element listy zakupów "Lista zakupów na weekend" i kliknij usuń.
      3. Potwierdź usunięcie.
    ## Oczekiwane Wyniki / Asercje:
      - Element listy zakupów "Lista zakupów na weekend" zostaje usunięty z listy list zakupów.
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Identyfikatory list zakupów będą dynamiczne.
    ## Potencjalne Wyzwania:
      - Brak
  </TEST_SCENARIO_6>

  <TEST_SCENARIO_7>
    ## Cel: Wyloguj zarejestrowanego użytkownika
    ## Grupa Testów: Uwierzytelnianie
    ## Zależności / Warunki Wstępne:
      - Użytkownik zarejestrowany w TEST_SCENARIO_1 musi być zalogowany (poprzez `storageState`).
    ## Kroki Konfiguracyjne (jeśli potrzebne poza stroną startową):
      - Brak jawnych kroków w samym teście, ponieważ uwierzytelnianie jest obsługiwane przez konfigurację projektu Playwright wczytującą `storageState`.
    ## Zestaw Testów: authentication.auth.spec.ts
    ## Kroki Przepływu Użytkownika:
      1. Przejdź do `127.0.0.1:3000`.
      2. Kliknij przycisk "Wyloguj".
    ## Oczekiwane Wyniki / Asercje:
      - Użytkownik jest przekierowywany na stronę logowania (`127.0.0.1:3000/login`).
      - Zapisany stan uwierzytelnienia (jeśli istnieje jakiś specyficzny dla tej sesji) powinien zostać unieważniony lub wyczyszczony, jeśli testy mają być ponownie uruchamiane niezależnie. (Uwaga: `storageState` Playwrighta zazwyczaj obsługuje to poprzez nadpisywanie lub bycie świeżym dla nowych uruchomień konfiguracji).
    ## Uwagi Dotyczące Danych Dynamicznych:
      - Brak
    ## Potencjalne Wyzwania:
      - Brak
  </TEST_SCENARIO_7>

  <TEST_PLAN_OVERVIEW>
    ## Sugerowane Obiekty Stron (Page Objects):
      - LoginPage
      - RegistrationPage
      - ShoppingListPage
      - ShoppingListDetailsPage
      - ShoppingListItemComponent (dla pojedynczych pozycji na liście)

    ## Sugerowane Zestawy Testów:
      - `authentication.noauth.spec.ts`: Obsługuje rejestrację użytkownika i zapisuje stan uwierzytelnienia (`storageState`). Efektywnie działa to jako globalna konfiguracja dla testów uwierzytelnionych.
      - `authentication.auth.spec.ts`: Obsługuje wylogowywanie i inne działania uwierzytelnionego użytkownika związane z uwierzytelnianiem. Używa zapisanego `storageState`.
      - `shopping-list.auth.spec.ts`: Obsługuje zarządzanie wszystkimi listami zakupów i ich pozycjami dla uwierzytelnionego użytkownika. Używa zapisanego `storageState`.

    ## Ogólne Uwagi / Strategia:
      - **Przepływ Uwierzytelniania:**
        - Dedykowany test konfiguracyjny (lub test w ramach `authentication.noauth.spec.ts`) zarejestruje nowego użytkownika z dynamicznym adresem e-mail i zapisze `storageState` (np. do `e2e/.auth/user.json`).
        - Uwierzytelnione zestawy testów (`*.auth.spec.ts`) zostaną skonfigurowane w `playwright.config.ts` tak, aby zależały od tej konfiguracji i używały zapisanego `storageState`, zapewniając, że działają jako nowo zarejestrowany użytkownik.
      - **Unikalność Danych:**
        - Adresy e-mail użytkowników są generowane dynamicznie ze znacznikiem czasu.
        - Generuj unikalne nazwy dla testowych list zakupów, aby uniknąć konfliktów, jeśli testy są uruchamiane równolegle lub ponownie.
      - **Mockowanie Daty:** Mockuj bieżącą datę dla tworzenia list i wszelkich asercji wrażliwych na datę, aby zapewnić stabilność testów.
      - **Globalne Czyszczenie (Teardown):**
        - Musi zostać zaimplementowany globalny skrypt czyszczący (np. `e2e/global.teardown.ts`). Skrypt ten będzie odpowiedzialny za usunięcie wszystkich danych testowych z bazy danych utworzonych podczas przebiegu testów E2E.
        - Czyszczenie powinno obejmować:
          - Usuwanie kont użytkowników utworzonych z adresami e-mail pasującymi do wzorca `E2E_EMAIL_TO_TEST` (np. `*@e2etest.shoplisteo.local`).
          - Usuwanie wszystkich list zakupów i powiązanych z nimi pozycji utworzonych przez tych użytkowników testowych.
        - Ten skrypt musi być skonfigurowany w `playwright.config.ts` (używając opcji `globalTeardown`), aby uruchomił się po zakończeniu wszystkich zestawów testów.

  </TEST_PLAN_OVERVIEW>

  <SELECTOR_REQUIREMENTS>
    ## Niezbędne Elementy dla Stabilnych Selektorów:
    Aby ułatwić niezawodną automatyzację testów, prosimy o zapewnienie stabilnych i unikalnych identyfikatorów (np. atrybutów data-testid) dla następujących kluczowych elementów interfejsu użytkownika obserwowanych podczas przepływów pracy:
    - Przycisk logowania
    - Link rejestracji na stronie logowania
    - Pole wprowadzania adresu e-mail (zarówno logowanie, jak i rejestracja)
    - Pole wprowadzania hasła (zarówno logowanie, jak i rejestracja)
    - Pole potwierdzenia hasła (rejestracja)
    - Przycisk rejestracji
    - Przycisk "Nowa Lista"
    - Każdy element listy zakupów na liście list zakupów
    - Pole wprowadzania nazwy listy zakupów (na stronie szczegółów)
    - Pole tekstowe "Dodaj produkt"
    - Przycisk "Dodaj produkt"
    - Przycisk edycji dla każdej pozycji produktu
    - Przycisk usuwania dla każdej pozycji produktu
    - Przycisk wylogowania
    - Przycisk potwierdzenia usunięcia
    - Element tytułu listy zakupów (zarówno na stronie głównej, jak i na stronie szczegółów)
  </SELECTOR_REQUIREMENTS>
