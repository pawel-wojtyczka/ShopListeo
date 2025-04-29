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
  console.log(`[Teardown] SUPABASE_URL loaded: ${!!supabaseUrl}`);
  console.log(`[Teardown] SUPABASE_SERVICE_ROLE_KEY loaded: ${!!supabaseServiceRoleKey}`);

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[Teardown] Supabase URL or Service Role Key is not defined.");
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

  console.log("[Teardown] Attempting to delete users from auth.users...");

  try {
    // 1. Pobierz listę wszystkich użytkowników
    // Uwaga: domyślnie listUsers zwraca do 50 użytkowników. W środowisku testowym to zazwyczaj wystarczy.
    // Jeśli masz więcej, musisz zaimplementować paginację.
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Error listing users: ${listError.message}`);
    }

    const allUsers = usersData?.users || [];
    console.log(`[Teardown] Found ${allUsers.length} total users.`);

    // 2. Filter users based on the email pattern
    const testUsersToDelete = allUsers.filter((user) => user.email?.endsWith(TEST_USER_EMAIL_PATTERN));
    console.log(
      `[Teardown] Found ${testUsersToDelete.length} test users matching pattern *${TEST_USER_EMAIL_PATTERN} to delete.`
    );

    if (testUsersToDelete.length === 0) {
      console.log("[Teardown] No users found in auth.users to delete.");
      return;
    }

    // 3. Iterate and delete each filtered user
    let deletedCount = 0;
    let errorCount = 0;
    for (const user of testUsersToDelete) {
      // Iterate only over filtered users
      // Opcjonalnie: Możesz dodać warunek, aby nie usuwać konkretnego użytkownika (np. admina)
      // if (user.email === 'admin@example.com') continue;

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`[Teardown] Failed to delete user ${user.id} (${user.email}): ${deleteError.message}`);
        errorCount++;
      } else {
        // console.log(`[Teardown] Successfully deleted user ${user.id} (${user.email})`);
        deletedCount++;
      }
    }

    console.log(`[Teardown] Successfully deleted ${deletedCount} users.`);
    if (errorCount > 0) {
      console.error(`[Teardown] Failed to delete ${errorCount} users.`);
    }
  } catch (error) {
    console.error("[Teardown] Error during auth user cleanup:", error instanceof Error ? error.message : String(error));
  }
});
