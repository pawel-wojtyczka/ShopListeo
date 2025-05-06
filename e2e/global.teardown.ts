import { type FullConfig } from "@playwright/test";
// import { PrismaClient } from "@prisma/client"; // Assuming Prisma is used, adjust if not
// import { createClient } from '@supabase/supabase-js'; // Or if using Supabase directly

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log("Starting global teardown...");

  // Retrieve the base email pattern from environment variables
  // const emailPatternBase = process.env.E2E_EMAIL_TO_TEST?.split("@")[1] || "e2etest.shoplisteo.local";
  // const emailDomainToDelete = `%@${emailPatternBase}`;

  console.log("Database cleanup logic (Prisma/Supabase) is currently bypassed for debugging.");
  /*
  // Example using Prisma (ensure PRISMA_CLIENT_INSTANCE is configured or instantiate here)
  // const prisma = new PrismaClient(); // THIS IS THE PROBLEMATIC LINE 13 ACCORDING TO LOGS
  // try {
  //   await prisma.$connect();
  //   console.log(`Attempting to delete test users with email pattern: ${emailDomainToDelete}`);

  //   // It's crucial to delete data in the correct order to respect foreign key constraints
  //   // 1. Delete dependent data first (e.g., shopping list items, then shopping lists)
  //   //    This part is highly dependent on your exact schema and how users relate to lists/items.
  //   //    The following is a conceptual example and NEEDS TO BE ADJUSTED to your schema.

  //   // Find users to delete
  //   const usersToDelete = await prisma.user.findMany({
  //     where: {
  //       email: {
  //         endsWith: emailDomainToDelete.substring(1), // Prisma `endsWith` doesn't need wildcard at start
  //       },
  //     },
  //     select: {
  //       id: true,
  //     },
  //   });

  //   if (usersToDelete.length > 0) {
  //     const userIdsToDelete = usersToDelete.map((user) => user.id);
  //     console.log(`Found ${userIdsToDelete.length} test users to delete with IDs: ${userIdsToDelete.join(", ")}`);

  //     // Example: Delete ShoppingListItems associated with these users (if items are directly linked or via lists)
  //     // await prisma.shoppingListItem.deleteMany({
  //     //   where: { /* condition linking items to userIdsToDelete */ /* Omitted for brevity */ /* },
  //     // });

  //     // Example: Delete ShoppingLists associated with these users
  //     // await prisma.shoppingList.deleteMany({
  //     //   where: {
  //     //     userId: { in: userIdsToDelete },
  //     //   },
  //     // });

  //     // Finally, delete the users
  //     const deleteResult = await prisma.user.deleteMany({
  //       where: {
  //         id: { in: userIdsToDelete },
  //       },
  //     });
  //     console.log(`Successfully deleted ${deleteResult.count} test users.`);
  //   } else {
  //     console.log("No test users found to delete.");
  //   }
  // } catch (error) {
  //   console.error("Error during global teardown:", error);
  // } finally {
  //   await prisma.$disconnect();
  //   console.log("Global teardown finished.");
  // }
  */

  // If using Supabase directly (example):
  /*
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Key not configured for teardown.');
    return;
  }
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  try {
    // ... Supabase specific cleanup logic ...
    console.log('Supabase teardown logic needs to be fully implemented based on schema.');
  } catch (error) {
    console.error('Error during Supabase teardown:', error);
  }
  */
  console.log("Global teardown finished (database cleanup part currently bypassed).");
}

export default globalTeardown;
