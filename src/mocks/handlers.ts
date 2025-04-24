import { http, HttpResponse } from "msw";

// Przykładowa odpowiedź dla listy zakupów
const EXAMPLE_SHOPPING_LISTS = [
  {
    id: "1",
    title: "Lista zakupów na weekend",
    createdAt: "2024-04-20T10:00:00Z",
    items: [
      { id: "101", name: "Chleb", completed: false },
      { id: "102", name: "Mleko", completed: true },
      { id: "103", name: "Jajka", completed: false },
    ],
  },
  {
    id: "2",
    title: "Lista na przyjęcie",
    createdAt: "2024-04-21T14:30:00Z",
    items: [
      { id: "201", name: "Soki", completed: false },
      { id: "202", name: "Przekąski", completed: false },
    ],
  },
];

// Definicja handlerów API dla MSW
export const handlers = [
  // Obsługa pobierania list zakupów
  http.get("/api/shopping-lists", () => {
    return HttpResponse.json(EXAMPLE_SHOPPING_LISTS);
  }),

  // Obsługa pobierania pojedynczej listy zakupów
  http.get("/api/shopping-lists/:id", ({ params }) => {
    const { id } = params;
    const list = EXAMPLE_SHOPPING_LISTS.find((list) => list.id === id);

    if (!list) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(list);
  }),

  // Obsługa tworzenia nowej listy zakupów
  http.post("/api/shopping-lists", async ({ request }) => {
    const newList = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({ ...newList, id: "new-id", createdAt: new Date().toISOString() }, { status: 201 });
  }),
];
