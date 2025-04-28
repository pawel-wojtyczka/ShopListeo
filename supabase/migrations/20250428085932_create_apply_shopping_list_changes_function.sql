-- Definicja typu dla elementów do dodania (opcjonalne, ale poprawia czytelność)
-- Możesz pominąć ten krok i używać jsonb bezpośrednio w argumentach funkcji
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_shopping_list_item') THEN
        CREATE TYPE new_shopping_list_item AS (
            item_name TEXT,
            purchased BOOLEAN
            -- shopping_list_id nie jest potrzebne tutaj, bo jest przekazywane jako osobny argument funkcji
        );
    END IF;
END$$;

-- Funkcja RPC do transakcyjnego dodawania/usuwania elementów listy
CREATE OR REPLACE FUNCTION apply_shopping_list_changes(
    p_list_id UUID,            -- ID listy zakupów
    p_user_id UUID,            -- ID użytkownika (do weryfikacji uprawnień)
    items_to_add new_shopping_list_item[], -- Tablica obiektów do dodania
    items_to_delete UUID[]     -- Tablica UUID elementów do usunięcia
)
RETURNS VOID -- Funkcja nie zwraca wartości
LANGUAGE plpgsql
-- SECURITY INVOKER oznacza, że funkcja działa z uprawnieniami użytkownika, który ją wywołuje.
-- RLS (Row Level Security) na tabelach shopping_lists i shopping_list_items nadal obowiązują.
SECURITY INVOKER
AS $$
DECLARE
    list_owner_id UUID;
    item_to_add new_shopping_list_item;
BEGIN
    -- 1. Weryfikacja uprawnień: Sprawdź, czy lista należy do użytkownika
    SELECT user_id INTO list_owner_id
    FROM public.shopping_lists
    WHERE id = p_list_id;

    IF list_owner_id IS NULL THEN
        RAISE EXCEPTION 'Shopping list with ID % not found', p_list_id;
    END IF;

    IF list_owner_id != p_user_id THEN
        RAISE EXCEPTION 'User % does not have permission to modify shopping list %', p_user_id, p_list_id;
    END IF;

    -- 2. Usunięcie elementów (jeśli są jakieś do usunięcia)
    IF array_length(items_to_delete, 1) > 0 THEN
        DELETE FROM public.shopping_list_items
        WHERE shopping_list_id = p_list_id
          AND id = ANY(items_to_delete); -- Usuwamy tylko te z podanej listy ID
    END IF;

    -- 3. Dodanie nowych elementów (jeśli są jakieś do dodania)
    IF array_length(items_to_add, 1) > 0 THEN
        -- Iterujemy przez tablicę obiektów i wstawiamy je
        FOREACH item_to_add IN ARRAY items_to_add
        LOOP
            INSERT INTO public.shopping_list_items (shopping_list_id, item_name, purchased)
            VALUES (p_list_id, item_to_add.item_name, item_to_add.purchased);
        END LOOP;

        -- Alternatywna metoda dla wielu insertów (może być wydajniejsza):
        /*
        INSERT INTO public.shopping_list_items (shopping_list_id, item_name, purchased)
        SELECT
            p_list_id,
            (elem->>'item_name')::TEXT,
            (elem->>'purchased')::BOOLEAN
        FROM jsonb_array_elements(items_to_add_json) AS elem;
        -- Uwaga: Wymagałoby to zmiany typu argumentu `items_to_add` na jsonb[] lub jsonb
        -- i dostosowania danych przekazywanych z TypeScript.
        -- Obecne podejście z pętlą FOREACH jest prostsze przy użyciu zdefiniowanego typu.
        */
    END IF;

    -- Transakcja jest domyślnie zarządzana przez PostgreSQL dla funkcji,
    -- więc jeśli dojdzie do błędu, wszystkie zmiany zostaną wycofane.
END;
$$;