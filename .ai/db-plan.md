# PostgreSQL Database Schema Plan - AKTUALIZACJA

## 1. Lista tabel

### 1.1. `users`

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `email` VARCHAR(128) NOT NULL UNIQUE
- `admin` BOOLEAN NOT NULL DEFAULT FALSE _(Nowa kolumna identyfikująca administratorów)_
- `updated_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP _(Trigger aktualizuje to pole)_
- `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP _(Pole dodane przez trigger `handle_new_user`, synchronizowane z `auth.users.created_at`)_
- `last_login_date` TIMESTAMP _(Pole opcjonalne, aktualizowane przez logikę aplikacji lub trigger)_
- `password_hash` TEXT _(Pole synchronizowane z `auth.users`, hasła zarządzane przez Supabase Auth)_

### 1.2. `conversations`

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
- `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `ended_at` TIMESTAMP
- `openai_thread_id` TEXT
- `answer_accepted` BOOLEAN NOT NULL DEFAULT FALSE
- `messages` JSONB

### 1.3. `shopping_lists`

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
- `title` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP _(Trigger aktualizuje to pole)_

### 1.4. `shopping_list_items`

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `shopping_list_id` UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE
- `item_name` TEXT NOT NULL
- `purchased` BOOLEAN NOT NULL DEFAULT FALSE
- `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP _(Trigger aktualizuje to pole)_

## 2. Relacje między tabelami

- `users` 1-to-many `conversations`: Jeden użytkownik może mieć wiele zapisanych sesji konwersacji/logów.
- `users` 1-to-many `shopping_lists`: Jeden użytkownik może mieć wiele list zakupów.
- `shopping_lists` 1-to-many `shopping_list_items`: Jedna lista zakupów może zawierać wiele pozycji.

## 3. Indeksy

- Unikalny indeks na `users.email`
- Indeks na `conversations.user_id`
- Indeks na `shopping_lists.user_id`
- Indeks na `shopping_list_items.shopping_list_id`

## 4. Zasady PostgreSQL

- Na etapie MVP nie wdrażamy reguł Row Level Security (RLS). _Decyzja potwierdzona zakomentowanymi politykami w migracji._

## 5. Dodatkowe uwagi

- Wszystkie daty są przechowywane jako `TIMESTAMP` (bez strefy czasowej, ale z domyślnym `CURRENT_TIMESTAMP`, które zazwyczaj używa UTC serwera).
- Klucze główne są typu UUID (`gen_random_uuid()`).
- Relacje między tabelami mają zdefiniowane `ON DELETE CASCADE` dla spójności danych.
- **Hashowanie haseł i zarządzanie sesjami jest obsługiwane przez Supabase Auth.** Tabela `public.users` jest synchronizowana z `auth.users` za pomocą triggera `handle_new_user`. Kolumna `password_hash` w `public.users` nie jest używana do bezpośredniej weryfikacji hasła.
- Dodano kolumnę `admin` (BOOLEAN, DEFAULT FALSE) w tabeli `users` do rozróżniania ról użytkowników, co jest kluczowe dla funkcjonalności panelu administracyjnego.
- Triggery (`trigger_set_timestamp` / `trigger_set_timestamp_users`) automatycznie aktualizują odpowiednie kolumny `updated_at` lub `updated_date` przy modyfikacji rekordów.
