# Aplikacja - ShopListeo (MVP)

## Główny problem
Tworzenie list zakupów jets czasochłonne i żmudne. Ludzie albo nie robią takich list i później zapominają co trzeba kupić w sklepie lub robią, ale zajmuje im to dużo czasu. Aplikacja umożliwia użytkownikom łatwe tworzenie, zarządzanie oraz edycję list zakupów poprzez przeglądarkę internetową, z wykorzystaniem sztucznej inteligencji (AI) do organizacji treści.


## Najmniejszy zestaw funkcjonalności
- Logowanie i zakłądanie konta przez użytkowników poprzez web
- Tworzenie listy zakupów na podstawie treści przekazanej w panelu web
- Modyfikowanie listy zakupów poprzez podawanie kolejnej treści w panelu web

## Co NIE wchodzi w zakres MVP
- Aplikacje mobilne (na początek tylko web)

## Kryteria sukcesu
- 75% list zakupów wygenerowanych przez AI jest akceptowane przez użytkownika

## Opis funkcjonalności aplikacji

### Proces rejestracji i logowania:
1. Użytkownik odwiedza stronę aplikacji.
2. Loguje się przy użyciu adresu email oraz hasła.
3. Jeśli użytkownik nie posiada jeszcze konta, może je założyć podając email oraz ustawiając hasło.

### Zarządzanie listami zakupów:
- Po zalogowaniu użytkownik widzi wszystkie swoje dotychczas utworzone listy zakupów.
- Każdą z tych list można przeglądać, edytować lub utworzyć nową.

### Tworzenie nowej listy zakupów:
1. Użytkownik klika „Utwórz nową listę zakupów” i przechodzi do formularza.
2. W formularzu wpisuje dowolne produkty, które chce zakupić (opis może być nieuporządkowany i chaotyczny, po to właśnie jest użyty AI aby to uporządkował).
3. Po kliknięciu „Stwórz mi listę zakupów”:
   - Treść jest przekazywana przez API OpenRouter do Asystenta AI.
   - Asystent AI zwraca uporządkowaną listę zakupów.
4. Produkty wyświetlane są w panelu aplikacji jako osobne bloczki, które użytkownik może:
   - Zatwierdzić (klikając ptaszek).
   - Odrzucić (klikając krzyżyk).

### Edycja i uzupełnianie listy zakupów:
- Użytkownik może dodać komentarze lub dodatkowe produkty do istniejącej listy poprzez formularz.
- Informacje przesyłane są ponownie do Asystenta AI, razem z aktualnym stanem listy.
- AI generuje nową, uzupełnioną wersję listy zakupów, która ponownie jest przedstawiana użytkownikowi w formie bloczków.

### Zapisanie finalnej listy:
- Po ostatecznym zatwierdzeniu użytkownik może wrócić do widoku wszystkich list zakupów.
- Utworzona i zatwierdzona lista zostaje zapisana i jest dostępna do późniejszego wglądu oraz edycji.

### Panel administracyjny:
- Administrator loguje się do aplikacji w taki sam sposób jak użytkownik standardowy.
- Po zalogowaniu administrator, oprócz własnych list zakupów, posiada dostęp do opcji administracyjnych.
- Funkcjonalności administracyjne obejmują:
  - Przeglądanie listy wszystkich użytkowników.
  - Szczegółowe informacje o każdym użytkowniku (email, data rejestracji, data ostatniego logowania oraz liczba utworzonych przez niego list zakupów).
  - Możliwość aktualizacji danych użytkownika (zmiana adresu email).
  - Możliwość usunięcia konta użytkownika z aplikacji.






