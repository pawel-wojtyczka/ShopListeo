# Architektura UI dla ShopListeo

## 1. Przegląd struktury UI

ShopListeo to aplikacja webowa do zarządzania listami zakupów z minimalistycznym interfejsem opartym na palecie kolorów niebieskich. Aplikacja korzysta z Astro 5, React 19, TypeScript 5, Tailwind 4 i komponentów Shadcn/ui. Interfejs jest pełnoekranowy i responsywny, z boczną nawigacją, która zwija się do hamburger menu na urządzeniach mobilnych. Wspiera tryb jasny i ciemny (domyślnie ciemny). Struktura UI rozdziela funkcjonalności dla zwykłych użytkowników (zarządzanie listami zakupów) i administratorów (zarządzanie użytkownikami).

## 2. Lista widoków

### Widok logowania
- **Ścieżka**: `/login`
- **Główny cel**: Umożliwienie użytkownikom zalogowania się do aplikacji
- **Kluczowe informacje**: 
  - Formularz logowania (e-mail, hasło)
  - Opcja "Zapamiętaj mnie" (30 dni)
  - Link do rejestracji
  - Link do resetowania hasła
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Checkbox "Zapamiętaj mnie"
  - Przyciski akcji
- **UX, dostępność i bezpieczeństwo**:
  - Minimalistyczny, przejrzysty interfejs
  - Wyraźne komunikaty błędów
  - Zabezpieczenie przez JWT

### Widok rejestracji
- **Ścieżka**: `/register`
- **Główny cel**: Umożliwienie nowym użytkownikom utworzenia konta
- **Kluczowe informacje**:
  - Formularz rejestracji (e-mail, hasło, potwierdzenie hasła)
  - Link powrotu do logowania
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Przyciski akcji
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja formatu e-mail
  - Walidacja złożoności hasła
  - Wykrywanie już istniejących kont

### Widok resetowania hasła
- **Ścieżka**: `/reset-password`
- **Główny cel**: Umożliwienie użytkownikom zresetowania zapomnianego hasła
- **Kluczowe informacje**:
  - Formularz do wprowadzenia adresu e-mail
  - Potwierdzenie wysłania linku resetującego
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Komunikat potwierdzający
- **UX, dostępność i bezpieczeństwo**:
  - Prosta instrukcja procesu
  - Zabezpieczenie przez unikalny link

### Widok ustawienia nowego hasła
- **Ścieżka**: `/set-new-password`
- **Główny cel**: Umożliwienie ustawienia nowego hasła po kliknięciu w link z e-maila
- **Kluczowe informacje**:
  - Formularz z polem na nowe hasło i jego potwierdzenie
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Komunikat powodzenia
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja złożoności hasła
  - Automatyczne przekierowanie po zmianie

### Widok główny użytkownika
- **Ścieżka**: `/`
- **Główny cel**: Wyświetlenie wszystkich list zakupów użytkownika
- **Kluczowe informacje**:
  - Lista list zakupów (nazwa, ikona usunięcia)
  - Przycisk "Utwórz nową listę zakupów"
  - Sortowanie według daty (najnowsze na górze)
  - Informacje o zalogowanym użytkowniku
  - Przycisk "Wyloguj"

- **Kluczowe komponenty**:
  - Boczna nawigacja
  - Lista list zakupów
  - Przycisk akcji (wyróżniony kolorem)
  - Modalne okno potwierdzające usunięcie
- **UX, dostępność i bezpieczeństwo**:
  - Przejrzysta prezentacja list
  - Ochrona przed przypadkowym usunięciem

### Widok szczegółów listy zakupów
- **Ścieżka**: `/shopping-lists/:id`
- **Główny cel**: Zarządzanie konkretną listą zakupów i jej elementami
- **Kluczowe informacje**:
  - Edytowalna nazwa listy
  - Pole textarea do wprowadzania opisu co chcemy kupić, tj. jakie produkty
  - Lista produktów (nazwa, status zakupu - czy już produkt zakupiony)
- **Kluczowe komponenty**:
  - Boczna nawigacja
  - Edytowalny nagłówek (edycja inline)
  - Textarea
  - Przycisk "Wygeneruj listę zakupów"
  - Lista produktów z checkboxami
  - Ikony usunięcia
- **UX, dostępność i bezpieczeństwo**:
  - Zakupione produkty: przekreślone, wyszarzone, na końcu listy
  - Edycja inline po kliknięciu
  - Natychmiastowa synchronizacja z API

### Widok główny administratora
- **Ścieżka**: `/admin/users`
- **Główny cel**: Zarządzanie użytkownikami systemu
- **Kluczowe informacje**:
  - Lista użytkowników (e-mail, data rejestracji, data logowania)
  - Paginacja i wybór liczby elementów na stronę (10, 20, 50)
- **Kluczowe komponenty**:
  - Boczna nawigacja
  - Tabela użytkowników
  - Kontrolki paginacji
- **UX, dostępność i bezpieczeństwo**:
  - Przejrzysta prezentacja danych
  - Dostęp tylko dla administratorów

### Widok szczegółów użytkownika (dla administratora)
- **Ścieżka**: `/admin/users/:id`
- **Główny cel**: Przeglądanie i edycja danych konkretnego użytkownika
- **Kluczowe informacje**:
  - Dane użytkownika (e-mail, data rejestracji, data logowania)
  - Formularze do edycji e-maila i hasła
- **Kluczowe komponenty**:
  - Boczna nawigacja
  - Sekcja informacji o użytkowniku
  - Formularze edycji
  - Przycisk "Aktualizuj dane użytkownika"
  - Przycisk "Usuń użytkownika"
  - Modalne okno potwierdzające usunięcie
- **UX, dostępność i bezpieczeństwo**:
  - Dostęp tylko dla administratorów
  - Ochrona przed przypadkowym usunięciem

### Widok profilu użytkownika
- **Ścieżka**: `/profile`
- **Główny cel**: Zarządzanie własnym kontem
- **Kluczowe informacje**:
  - Dane użytkownika (e-mail)
  - Formularze do edycji e-maila i hasła
- **Kluczowe komponenty**:
  - Boczna nawigacja
  - Formularze edycji
  - Przycisk "Aktualizuj dane"
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja danych wejściowych
  - Zabezpieczenie przed konfliktami e-mail

## 3. Mapa podróży użytkownika

### Podróż nowego użytkownika
1. **Rejestracja**:
   - Użytkownik przechodzi do formularza rejestracji
   - Wprowadza e-mail i hasło (dwukrotnie)
   - System waliduje dane i tworzy konto
   
2. **Pierwsze logowanie**:
   - Użytkownik zostaje automatycznie zalogowany po rejestracji
   - Widzi komunikat powitalny z wprowadzeniem do aplikacji
   
3. **Tworzenie pierwszej listy zakupów**:
   - Użytkownik klika "Utwórz nową listę zakupów"
   - System tworzy listę z domyślną nazwą (format: "<dzień tygodnia>, <DD-MM-RRRR>")
   - Użytkownik jest przekierowany do edycji listy
   
4. **Zarządzanie listą zakupów**:
   - Użytkownik może edytować nazwę listy (kliknięcie aktywuje edycję inline)
   - Użytkownik wpisuje produkty w pole tekstowe
   - Po kliknięciu "Wygeneruj listę zakupów" system przetwarza tekst
   - Użytkownik może zarządzać produktami (edycja, oznaczanie jako zakupione, usuwanie)
   - Zakupione produkty są przekreślone, wyszarzone i przenoszone na koniec listy

### Podróż powracającego użytkownika
1. **Logowanie**:
   - Użytkownik wprowadza dane logowania
   - Opcjonalnie zaznacza "Zapamiętaj mnie"
   - System weryfikuje dane i loguje użytkownika
   
2. **Przeglądanie list zakupów**:
   - Użytkownik widzi wszystkie swoje listy zakupów
   - Listy są sortowane według daty (najnowsze na górze)
   
3. **Zarządzanie istniejącymi listami**:
   - Użytkownik może kliknąć w nazwę listy, aby przejść do jej szczegółów
   - Użytkownik może usunąć listę (z potwierdzeniem w modalnym oknie)

### Podróż administratora
1. **Logowanie**:
   - Administrator loguje się jak zwykły użytkownik
   - System rozpoznaje rolę i przekierowuje do panelu administratora
   
2. **Zarządzanie użytkownikami**:
   - Administrator widzi paginowaną listę użytkowników
   - Może wybrać liczbę elementów na stronę (10, 20, 50)
   - Może kliknąć w e-mail użytkownika, aby przejść do szczegółów
   
3. **Zarządzanie konkretnym użytkownikiem**:
   - Administrator może przeglądać dane użytkownika
   - Może edytować e-mail i hasło użytkownika
   - Może usunąć użytkownika (z potwierdzeniem w modalnym oknie)

## 4. Układ i struktura nawigacji

### Układ globalny
- Pełnoekranowy interfejs z boczną nawigacją
- zalogowany użytkownik widzi w prawym górnym rogu ikonkę, która pozwala mu przejść do jego profilu
- zalogowany użytkownik widzi informację w panelu, że jest zalogowany jako użytkownik o danym adresie e-mail
- Na urządzeniach mobilnych nawigacja zwija się do hamburger menu
- Przełącznik trybu jasny/ciemny w menu głównym
- Stopka aplikacji z informacją "Powered by asperIT"

### Nawigacja dla zwykłego użytkownika
- **Listy zakupów** - link do widoku głównego
- **Profil** - link do widoku profilu użytkownika
- **Wyloguj się** - akcja wylogowania użytkownika

### Nawigacja dla administratora
- **Użytkownicy** - link do listy użytkowników
- **Profil** - link do widoku profilu administratora
- **Wyloguj się** - akcja wylogowania administratora

### Struktura ścieżek
- **/login** - widok logowania
- **/register** - widok rejestracji
- **/reset-password** - widok resetowania hasła
- **/set-new-password** - widok ustawienia nowego hasła
- **/** - widok główny użytkownika (listy zakupów)
- **/shopping-lists/:id** - widok szczegółów listy zakupów
- **/profile** - widok profilu użytkownika
- **/admin/users** - widok główny administratora
- **/admin/users/:id** - widok szczegółów użytkownika

## 5. Kluczowe komponenty

### Komponenty nawigacyjne
- **SideNav** - boczny panel nawigacyjny z linkami
- **MobileMenu** - zwijane menu hamburger dla urządzeń mobilnych
- **ThemeToggle** - przełącznik trybu jasny/ciemny

### Komponenty autentykacji
- **LoginForm** - formularz logowania z walidacją
- **RegisterForm** - formularz rejestracji z walidacją
- **PasswordResetForm** - formularz resetowania hasła
- **SetPasswordForm** - formularz ustawiania nowego hasła

### Komponenty list zakupów
- **ShoppingLists** - lista wszystkich list zakupów użytkownika
- **ShoppingListItem** - pojedynczy element listy zakupów
- **CreateListButton** - przycisk tworzenia nowej listy
- **EditableTitle** - edytowalny inline tytuł listy zakupów
- **ProductList** - lista produktów w liście zakupów
- **ProductItem** - pojedynczy produkt z checkboxem i możliwością edycji
- **GenerateListButton** - przycisk generowania listy z textarea

### Komponenty administratora
- **UsersList** - paginowana lista użytkowników
- **UserDetails** - szczegóły użytkownika z możliwością edycji
- **Pagination** - kontrolki paginacji

### Komponenty UI
- **Modal** - okno modalne do potwierdzania operacji
- **Notification** - system powiadomień (znikające po 10 sekundach)
- **WelcomeMessage** - komunikat powitalny dla nowych użytkowników
- **Button** - przycisk akcji (wyróżniony kolorem)
- **Checkbox** - pole wyboru dla oznaczania produktów jako zakupione 