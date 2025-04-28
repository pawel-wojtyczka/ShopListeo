    -- Upewnij się, że typ istnieje w schemacie public
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'new_shopping_list_item' AND n.nspname = 'public') THEN
            CREATE TYPE public.new_shopping_list_item AS (
                item_name TEXT,
                purchased BOOLEAN
            );
        END IF;
    END$$;

    -- Poprawka: Jawne dodanie schematu 'public' do funkcji RPC
    CREATE OR REPLACE FUNCTION public.apply_shopping_list_changes(
        p_list_id UUID,            -- ID listy zakupów
        p_user_id UUID,            -- ID użytkownika (do weryfikacji uprawnień)
        items_to_add new_shopping_list_item[], -- Tablica obiektów do dodania
        items_to_delete UUID[]     -- Tablica UUID elementów do usunięcia
    )
    RETURNS VOID -- Funkcja nie zwraca wartości
    LANGUAGE plpgsql
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
              AND id = ANY(items_to_delete);
        END IF;

        -- 3. Dodanie nowych elementów (jeśli są jakieś do dodania)
        IF array_length(items_to_add, 1) > 0 THEN
            FOREACH item_to_add IN ARRAY items_to_add
            LOOP
                INSERT INTO public.shopping_list_items (shopping_list_id, item_name, purchased)
                VALUES (p_list_id, item_to_add.item_name, item_to_add.purchased);
            END LOOP;
        END IF;
    END;
    $$;