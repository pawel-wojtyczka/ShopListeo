import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
// Dostosuj ścieżkę, jeśli plik .env jest gdzie indziej
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Define the email pattern for test users
const TEST_USER_EMAIL_PATTERN = "@e2etest.shoplisteo.local";

teardown("cleanup auth users", async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Logowanie w celu weryfikacji zmiennych środowiskowych

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // Zdecydowałem nie rzucać błędu, aby nie blokować CI, jeśli cleanup się nie powiedzie
    // Możesz zmienić na throw new Error(...) jeśli wolisz
    return;
  }

  // Tworzymy klienta z kluczem serwisowym
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 1. Pobierz listę wszystkich użytkowników
    // Uwaga: domyślnie listUsers zwraca do 50 użytkowników. W środowisku testowym to zazwyczaj wystarczy.
    // Jeśli masz więcej, musisz zaimplementować paginację.
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Error listing users: ${listError.message}`);
    }

    const allUsers = usersData?.users || [];

    // 2. Filter users based on the email pattern
    const testUsersToDelete = allUsers.filter((user) => user.email?.endsWith(TEST_USER_EMAIL_PATTERN));

    if (testUsersToDelete.length === 0) {
      return;
    }

    // 3. Iterate and delete each filtered user
    let _deletedCount = 0;
    let errorCount = 0;
    for (const user of testUsersToDelete) {
      // Iterate only over filtered users
      // Opcjonalnie: Możesz dodać warunek, aby nie usuwać konkretnego użytkownika (np. admina)
      // if (user.email === 'admin@example.com') continue;

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        errorCount++;
      } else {
        // console.log(`[Teardown] Successfully deleted user ${user.id} (${user.email})`);
        _deletedCount++;
      }
    }

    if (errorCount > 0) {
      // W przyszłości można dodać logowanie błędów
    }
  } catch (_error) {
    // W przyszłości można dodać logowanie błędów
  }
});
