# PostgreSQL Database Schema Plan

## 1. Lista tabel

### 1.1. `users`
- `id` UUID PRIMARY KEY
- `email` VARCHAR(128) NOT NULL UNIQUE
- `password_hash` TEXT NOT NULL
- `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `last_login_date` TIMESTAMP
- `updated_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

### 1.2. `conversations`
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `ended_at` TIMESTAMP
- `openai_thread_id` TEXT
- `answer_accepted` BOOLEAN NOT NULL DEFAULT FALSE
- `messages` JSONB

### 1.3. `shopping_lists`
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `title` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

### 1.4. `shopping_list_items`
- `id` UUID PRIMARY KEY
- `shopping_list_id` UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE
- `item_name` TEXT NOT NULL
- `purchased` BOOLEAN NOT NULL DEFAULT FALSE
- `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

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
- Na etapie MVP nie wdrażamy reguł Row Level Security (RLS).

## 5. Dodatkowe uwagi
- Wszystkie daty są przechowywane jako `TIMESTAMP` zgodnie ze standardem.
- Hasła są przechowywane w kolumnie `password_hash`; należy rozważyć implementację bezpiecznego mechanizmu hashowania.
- Klucze główne są typu UUID, co zapewnia unikalność rekordów.
- Relacje między tabelami zostały zdefiniowane z opcją `ON DELETE CASCADE` dla ułatwienia zarządzania zależnościami.
- Schemat został opracowany zgodnie z zasadami 3NF celem zapewnienia poprawnej normalizacji danych, chyba że denormalizacja będzie uzasadniona ze względu na wydajność. 