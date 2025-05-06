  <TEST_SCENARIO_1>
    ## Objective: Create a new shopping list as the registered user
    ## Test Group: Shopping List Management
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 (using a dynamic email) must be logged in. This is achieved by configuring the test project to use the saved `storageState` from the registration test.
    ## Setup Steps (if needed beyond starting page):
      - None explicitly in the test itself, as authentication is handled by Playwright project configuration loading `storageState`.
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000` (or the configured `baseURL`).
      2. Click the "New List" button.
    ## Expected Outcomes / Assertions:
      - A new shopping list item appears in the list of shopping lists.
      - The new shopping list item is named "List zakupów <DD.MM.YYYY>" (or similar, based on current or mocked date).
    ## Dynamic Data Considerations:
      - Handle the dynamic date in the shopping list name. Consider mocking the date for test stability.
    ## Potential Challenges:
      - Requires mocking the current date to make tests stable.
  </TEST_SCENARIO_1>

  <TEST_SCENARIO_2>
    ## Objective: Rename a shopping list as the registered user
    ## Test Group: Shopping List Management
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 must be logged in (via `storageState`).
      - At least one shopping list, created by this user, must exist.
    ## Setup Steps (if needed beyond starting page):
      - Ensure a shopping list (e.g., created in TEST_SCENARIO_2 or a separate setup step within this test/suite) with a known default name (e.g., "List zakupów <DD.MM.YYYY>") exists for this user.
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the shopping list item with the known default name.
      3. Change the list name to "Lista zakupów na weekend".
    ## Expected Outcomes / Assertions:
      - The shopping list details page remains open.
      - A success notification is displayed indicating that the shopping list name has been changed.
      - Navigating back to the main lists page (`127.0.0.1:3000`) shows the updated list name "Lista zakupów na weekend".
    ## Dynamic Data Considerations:
      - Shopping list IDs will be dynamic.
    ## Potential Challenges:
      - Need to get the URL or identifier for the specific shopping list dynamically.
  </TEST_SCENARIO_2>

  <TEST_SCENARIO_3>
    ## Objective: Add products to a shopping list as the registered user
    ## Test Group: Shopping List Item Management
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 must be logged in (via `storageState`).
      - A shopping list (e.g., "Lista zakupów na weekend" from TEST_SCENARIO_3) must exist for this user.
    ## Setup Steps (if needed beyond starting page):
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists for the current user.
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the shopping list item "Lista zakupów na weekend".
      3. Type "Kup chleb, mleko, kakao i jeszcze sporo jogurtów pitnych dla dzieci, bo jadar tego dużo" into the "Add new product" text field.
      4. Click the "Add product" button.
    ## Expected Outcomes / Assertions:
      - A list of new shopping list items is displayed.
      - The shopping list contains items "chleb", "mleko", "kakao", "k jogurtów pitnych dla dzieci".
    ## Dynamic Data Considerations:
      - None
    ## Potential Challenges:
      - None
  </TEST_SCENARIO_3>

  <TEST_SCENARIO_4>
    ## Objective: Edit a shopping list item as the registered user
    ## Test Group: Shopping List Item Management
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 must be logged in (via `storageState`).
      - A shopping list (e.g., "Lista zakupów na weekend") must exist for this user.
      - The shopping list must contain the item "k jogurtów pitnych dla dzieci".
    ## Setup Steps (if needed beyond starting page):
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists for the current user.
      - Ensure the list "Lista zakupów na weekend" contains items "chleb", "mleko", "kakao", "k jogurtów pitnych dla dzieci".
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the shopping list item "Lista zakupów na weekend".
      3. Find the shopping list item with label "k jogurtów pitnych dla dzieci" and edit it to "6 szt. jogurtów pitnych dla dzieci".
    ## Expected Outcomes / Assertions:
      - The shopping list item is updated to "6 szt. jogurtów pitnych dla dzieci".
    ## Dynamic Data Considerations:
      - Needs stable selectors for the edit and delete buttons for each product item.
    ## Potential Challenges:
      - Need stable selectors for the edit button.
  </TEST_SCENARIO_4>

  <TEST_SCENARIO_5>
    ## Objective: Delete a shopping list item as the registered user
    ## Test Group: Shopping List Item Management
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 must be logged in (via `storageState`).
      - A shopping list (e.g., "Lista zakupów na weekend") must exist for this user.
      - The shopping list must contain the item "mleko".
    ## Setup Steps (if needed beyond starting page):
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists for the current user.
      - Ensure the list "Lista zakupów na weekend" contains item "mleko" (and others as per previous steps if tests are sequential).
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the shopping list item "Lista zakupów na weekend".
      3. Find the shopping list item with label "mleko" and delete it.
    ## Expected Outcomes / Assertions:
      - The shopping list item "mleko" is removed from the shopping list.
    ## Dynamic Data Considerations:
      - Needs stable selectors for the edit and delete buttons for each product item.
    ## Potential Challenges:
      - Need stable selectors for the delete button.
  </TEST_SCENARIO_5>

  <TEST_SCENARIO_6>
    ## Objective: Delete a shopping list as the registered user
    ## Test Group: Shopping List Management
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 must be logged in (via `storageState`).
      - A shopping list (e.g., "Lista zakupów na weekend") must exist for this user.
    ## Setup Steps (if needed beyond starting page):
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists for the current user.
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Find the shopping list item "Lista zakupów na weekend" and click delete.
      3. Confirm deletion.
    ## Expected Outcomes / Assertions:
      - The shopping list item "Lista zakupów na weekend" is removed from the shopping list.
    ## Dynamic Data Considerations:
      - Shopping list IDs will be dynamic.
    ## Potential Challenges:
      - None
  </TEST_SCENARIO_6>

  <TEST_SCENARIO_7>
    ## Objective: Sign out the registered user
    ## Test Group: Authentication
    ## Dependencies / Preconditions:
      - The user registered in TEST_SCENARIO_1 must be logged in (via `storageState`).
    ## Setup Steps (if needed beyond starting page):
      - None explicitly in the test itself, as authentication is handled by Playwright project configuration loading `storageState`.
    ## Test Suite: authentication.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the "Sign out" button.
    ## Expected Outcomes / Assertions:
      - User is redirected to the login page (`127.0.0.1:3000/login`).
      - The saved authentication state (if any specific to this session) should be invalidated or cleared if tests are to be re-run independently. (Note: Playwright's `storageState` typically handles this by overwriting or being fresh for new setup runs).
    ## Dynamic Data Considerations:
      - None
    ## Potential Challenges:
      - None
  </TEST_SCENARIO_7>

  <TEST_PLAN_OVERVIEW>
    ## Suggested Page Objects:
      - LoginPage
      - RegistrationPage
      - ShoppingListPage
      - ShoppingListDetailsPage
      - ShoppingListItemComponent (for individual items in the list)

    ## Suggested Test Suites:
      - `authentication.noauth.spec.ts`: Handles user registration and saves the authentication state (`storageState`). This effectively acts as a global setup for authenticated tests.
      - `authentication.auth.spec.ts`: Handles sign-out and other authenticated user actions related to authentication. Uses the saved `storageState`.
      - `shopping-list.auth.spec.ts`: Handles all shopping list and item management for an authenticated user. Uses the saved `storageState`.

    ## General Notes / Strategy:
      - **Authentication Flow:**
        - A dedicated setup test (or a test within `authentication.noauth.spec.ts`) will register a new user with a dynamic email and save the `storageState` (e.g., to `e2e/.auth/user.json`).
        - Authenticated test suites (`*.auth.spec.ts`) will be configured in `playwright.config.ts` to depend on this setup and use the saved `storageState`, ensuring they run as the newly registered user.
      - **Data Uniqueness:**
        - User email addresses are generated dynamically with a timestamp.
        - Generate unique names for test shopping lists to avoid conflicts if tests are run in parallel or re-run.
      - **Date Mocking:** Mock the current date for list creation and any date-sensitive assertions to ensure test stability.
      - **Global Teardown:**
        - A global teardown script (e.g., `e2e/global.teardown.ts`) must be implemented. This script will be responsible for cleaning up all test data from the database created during the E2E test run.
        - Cleanup should include:
          - Deleting user accounts created with emails matching the `E2E_EMAIL_TO_TEST` pattern (e.g., `*@e2etest.shoplisteo.local`).
          - Deleting all shopping lists and associated items created by these test users.
        - This script must be configured in `playwright.config.ts` (using the `globalTeardown` option) to run after all test suites have completed.

  </TEST_PLAN_OVERVIEW>

  <SELECTOR_REQUIREMENTS>
    ## Essential Elements for Stable Selectors:
    To facilitate reliable test automation, please ensure stable and unique identifiers (e.g., data-testid attributes) are added for the following key UI elements observed during the workflows:
    - Login button
    - Registration link on the login page
    - Email input field (both login and registration)
    - Password input field (both login and registration)
    - Password confirm input field (registration)
    - Sign up button
    - New List button
    - Each Shopping list item in the shopping lists
    - Shopping list name input field (on details page)
    - Add product text field
    - Add product button
    - Edit button for each product item
    - Delete button for each product item
    - Sign out button
    - Confirm delete button
    - Shopping list title element (both on main page and details page)
  </SELECTOR_REQUIREMENTS>
