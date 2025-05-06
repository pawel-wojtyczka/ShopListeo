
  <TEST_SCENARIO_1>
    ## Objective: Register a new user account
    ## Test Group: Authentication
    ## Dependencies / Preconditions:
      - No user account exists with an email matching the pattern defined in the `E2E_EMAIL_TO_TEST` environment variable (e.g., `test_<timestamp>@e2etest.shoplisteo.local`, where `<timestamp>` is replaced by the current Unix timestamp).
    ## Setup Steps (if needed beyond starting page):
      - Ensure the `E2E_EMAIL_TO_TEST` environment variable is set in the `.env` file (e.g., `E2E_EMAIL_TO_TEST=test_<timestamp>@e2etest.shoplisteo.local`).
    ## Test Suite: authentication.noauth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:4321/login` (or the configured `baseURL`).
      2. Click the "No account? Register" link.
      3. Enter a dynamically generated email address (based on `E2E_EMAIL_TO_TEST` and current timestamp) into the email field.
      4. Enter "<HIDDEN>" into the password field.
      5. Enter "<HIDDEN>" into the confirm password field.
      6. Click "Sign up" button.
    ## Expected Outcomes / Assertions:
      - User is redirected to the main shopping list page (`/`).
      - A welcome message or user profile indicator (e.g., the user's generated email) is displayed on the shopping list page.
    ## Dynamic Data Considerations:
      - The email address is dynamically generated using a timestamp to ensure uniqueness.
      - The password should be a standard test password.
    ## Potential Challenges:
      - None
  </TEST_SCENARIO_1>

  <TEST_SCENARIO_2>
    ## Objective: Create a new shopping list
    ## Test Group: Shopping List Management
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wojtyczka.com" with password "<HIDDEN>".
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the "New List" button.
    ## Expected Outcomes / Assertions:
      - A new shopping list item appears in the list of shopping lists.
      - The new shopping list item is named "List zakupów 6.05.2025" (or similar date). The date could be mocked.
    ## Dynamic Data Considerations:
      - Handle the dynamic date in the shopping list name. Can mock the date.
    ## Potential Challenges:
      - Requires mocking the current date to make tests stable.
  </TEST_SCENARIO_2>

  <TEST_SCENARIO_3>
    ## Objective: Rename a shopping list
    ## Test Group: Shopping List Management
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
      - At least one shopping list must exist.
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wojtyczka.com" with password "<HIDDEN>".
      - Ensure a shopping list with the default name "List zakupów 6.05.2025" exists. Can mock the date.
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the shopping list item "List zakupów 6.05.2025".
      3. Change the list name to "Lista zakupów na weekend".
    ## Expected Outcomes / Assertions:
      - The shopping list details page remains open.
      - A success notification is displayed indicating that the shopping list name has been changed.
      - Navigating back to the main lists page (`127.0.0.1:3000`) shows the updated list name "Lista zakupów na weekend".
    ## Dynamic Data Considerations:
      - Shopping list ids will be dynamic.
    ## Potential Challenges:
      - Need to get the url for the shopping list dynamically
  </TEST_SCENARIO_3>

  <TEST_SCENARIO_4>
    ## Objective: Add products to a shopping list
    ## Test Group: Shopping List Item Management
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
      - At least one shopping list must exist.
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wezycka.com" with password "<HIDDEN>".
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists.
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

  </TEST_SCENARIO_4>

  <TEST_SCENARIO_5>
    ## Objective: Edit a shopping list item
    ## Test Group: Shopping List Item Management
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
      - At least one shopping list must exist.
      - The shopping list must contain the item "k jogurtów pitnych dla dzieci".
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wezycka.com" with password "<HIDDEN>".
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists.
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
  </TEST_SCENARIO_5>

  <TEST_SCENARIO_6>
    ## Objective: Delete a shopping list item
    ## Test Group: Shopping List Item Management
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
      - At least one shopping list must exist.
      - The shopping list must contain the item "mleko".
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wojtyczka.com" with password "<HIDDEN>".
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists.
      - Ensure the list "Lista zakupów na weekend" contains item "mleko".
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
  </TEST_SCENARIO_6>

  <TEST_SCENARIO_7>
    ## Objective: Delete a shopping list
    ## Test Group: Shopping List Management
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
      - At least one shopping list must exist.
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wojtyczka.com" with password "<HIDDEN>".
      - Ensure a shopping list with the name "Lista zakupów na weekend" exists.
    ## Test Suite: shopping-list.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Find the shopping list item "Lista zakupów na weekend" and click delete.
      3. Confirm deletion.
    ## Expected Outcomes / Assertions:
      - The shopping list item "Lista zakupów na weekend" is removed from the shopping list.
    ## Dynamic Data Considerations:
      - Shopping list ids will be dynamic.
    ## Potential Challenges:
      - None

  </TEST_SCENARIO_7>

  <TEST_SCENARIO_8>
    ## Objective: Sign out
    ## Test Group: Authentication
    ## Dependencies / Preconditions:
      - User account must exist.
      - User must be logged in.
    ## Setup Steps (if needed beyond starting page):
      - Log in the user "pawel.test3@wojtyczka.com" with password "<HIDDEN>".
    ## Test Suite: authentication.auth.spec.ts
    ## User Workflow Steps:
      1. Navigate to `127.0.0.1:3000`.
      2. Click the "Sign out" button.
    ## Expected Outcomes / Assertions:
      - User is redirected to the login page (`127.0.0.1:3000/login`).
    ## Dynamic Data Considerations:
      - None
    ## Potential Challenges:
      - None
  </TEST_SCENARIO_8>

  <TEST_PLAN_OVERVIEW>
    ## Suggested Page Objects:
      - LoginPage
      - RegistrationPage
      - ShoppingListPage
      - ShoppingListDetailsPage
      - ShoppingListItemComponent (for individual items in the list)

    ## Suggested Test Suites:
      - authentication.noauth.spec.ts (registration)
      - authentication.auth.spec.ts (sign out)
      - shopping-list.auth.spec.ts (all shopping list and item management)

    ## General Notes / Strategy:
      - Use a login fixture/setup to handle user authentication for tests that require it.
      - Generate unique names for test shopping lists to avoid conflicts.
      - Mock the date for list creation for tests to be stable.

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
