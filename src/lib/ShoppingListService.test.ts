import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { ShoppingListService } from "./ShoppingListService";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/node";

// Ensure MSW server is running for tests
beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterEach(() => server.close());

// Interfejsy z ShoppingListService.ts
interface ShoppingListItem {
  id?: string;
  name: string;
  completed: boolean;
}

interface ShoppingList {
  id?: string;
  title: string;
  createdAt?: string;
  items: ShoppingListItem[];
}

// Przykładowa odpowiedź z API
const mockShoppingLists: ShoppingList[] = [
  {
    id: "1",
    title: "Groceries",
    createdAt: "2024-04-22T10:00:00Z",
    items: [{ id: "item-1", name: "Milk", completed: false }],
  },
  {
    id: "2",
    title: "Hardware Store",
    createdAt: "2024-04-21T15:30:00Z",
    items: [
      { id: "item-2", name: "Screws", completed: true },
      { id: "item-3", name: "Hammer", completed: false },
    ],
  },
];

describe("ShoppingListService", () => {
  describe("getAll", () => {
    it("should fetch all shopping lists successfully", async () => {
      server.use(
        http.get("/api/shopping-lists", () => {
          return HttpResponse.json(mockShoppingLists);
        })
      );

      const lists = await ShoppingListService.getAll();

      expect(lists).toEqual(mockShoppingLists);
      expect(lists).toHaveLength(2);
      expect(lists[0].title).toBe("Groceries");
    });

    it("should throw an error if fetching lists fails", async () => {
      server.use(
        http.get("/api/shopping-lists", () => {
          return new HttpResponse(null, { status: 500, statusText: "Server Error" });
        })
      );

      await expect(ShoppingListService.getAll()).rejects.toThrow("Failed to fetch shopping lists: Server Error");
    });
  });

  describe("getById", () => {
    const listId = "1";
    const targetList = mockShoppingLists.find((l) => l.id === listId);

    it("should fetch a shopping list by ID successfully", async () => {
      server.use(
        http.get("/api/shopping-lists/:id", ({ params }) => {
          if (params.id === listId && targetList) {
            return HttpResponse.json(targetList);
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      const list = await ShoppingListService.getById(listId);

      expect(list).toEqual(targetList);
      expect(list.id).toBe(listId);
    });

    it("should throw an error if list with given ID is not found", async () => {
      const nonExistentId = "999";
      server.use(
        http.get("/api/shopping-lists/:id", ({ params }) => {
          const foundList = mockShoppingLists.find((l) => l.id === params.id);
          if (foundList) {
            return HttpResponse.json(foundList);
          } else {
            return new HttpResponse(null, { status: 404, statusText: "Not Found" });
          }
        })
      );

      await expect(ShoppingListService.getById(nonExistentId)).rejects.toThrow(
        "Failed to fetch shopping list: Not Found"
      );
    });

    it("should throw an error if fetching list by ID fails with server error", async () => {
      server.use(
        http.get("/api/shopping-lists/:id", () => {
          return new HttpResponse(null, { status: 500, statusText: "Server Error" });
        })
      );

      await expect(ShoppingListService.getById(listId)).rejects.toThrow("Failed to fetch shopping list: Server Error");
    });
  });

  describe("create", () => {
    const newListData: Omit<ShoppingList, "id" | "createdAt"> = {
      title: "New List",
      items: [{ name: "Apples", completed: false }],
    };

    it("should create a new shopping list successfully", async () => {
      const createdListMock: ShoppingList = {
        ...newListData,
        id: "new-id-123",
        createdAt: new Date().toISOString(),
        items: [{ name: "Apples", completed: false }],
      };

      server.use(
        http.post("/api/shopping-lists", async ({ request }) => {
          const receivedData = await request.json();
          expect(receivedData).toMatchObject(newListData);
          return HttpResponse.json(createdListMock, { status: 201 });
        })
      );

      const createdList = await ShoppingListService.create({ title: newListData.title, items: newListData.items });

      expect(createdList).toEqual(createdListMock);
      expect(createdList.id).toBe("new-id-123");
    });

    it("should throw an error if creating list fails", async () => {
      server.use(
        http.post("/api/shopping-lists", () => {
          return new HttpResponse(null, { status: 400, statusText: "Bad Request" });
        })
      );

      await expect(ShoppingListService.create({ title: newListData.title, items: newListData.items })).rejects.toThrow(
        "Failed to create shopping list: Bad Request"
      );
    });
  });

  describe("update", () => {
    const listIdToUpdate = "1";
    const updateData: Partial<ShoppingList> = { title: "Updated Groceries Title" };

    it("should update a shopping list successfully", async () => {
      const originalList = mockShoppingLists.find((l) => l.id === listIdToUpdate);
      if (!originalList) throw new Error("Test setup error: mock list not found");
      const updatedListMock: ShoppingList = { ...originalList, ...updateData };

      server.use(
        http.patch("/api/shopping-lists/:id", async ({ params, request }) => {
          if (params.id === listIdToUpdate) {
            const receivedData = await request.json();
            expect(receivedData).toEqual(updateData);
            return HttpResponse.json(updatedListMock);
          }
          return new HttpResponse(null, { status: 404 });
        })
      );
      const updatedList = await ShoppingListService.update(listIdToUpdate, updateData);
      expect(updatedList).toEqual(updatedListMock);
    });

    it("should throw an error if updating non-existent list", async () => {
      const nonExistentId = "999";
      server.use(
        http.patch("/api/shopping-lists/:id", ({ params }) => {
          const exists = mockShoppingLists.some((l) => l.id === params.id);
          if (!exists || params.id === nonExistentId) {
            return new HttpResponse(null, { status: 404, statusText: "Not Found" });
          }
          return new HttpResponse(null, { status: 200 });
        })
      );
      await expect(ShoppingListService.update(nonExistentId, updateData)).rejects.toThrow(
        "Failed to update shopping list: Not Found"
      );
    });

    it("should throw an error if updating list fails with server error", async () => {
      server.use(
        http.patch("/api/shopping-lists/:id", () => {
          return new HttpResponse(null, { status: 500, statusText: "Server Error" });
        })
      );
      await expect(ShoppingListService.update(listIdToUpdate, updateData)).rejects.toThrow(
        "Failed to update shopping list: Server Error"
      );
    });
  });

  describe("delete", () => {
    const listIdToDelete = "2";

    it("should delete a shopping list successfully", async () => {
      let deleted = false;
      server.use(
        http.delete("/api/shopping-lists/:id", ({ params }) => {
          if (params.id === listIdToDelete) {
            deleted = true;
            return new HttpResponse(null, { status: 204 }); // No Content
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(ShoppingListService.delete(listIdToDelete)).resolves.toBeUndefined();
      expect(deleted).toBe(true); // Check if the handler was called
    });

    it("should throw an error if deleting non-existent list", async () => {
      const nonExistentId = "998";
      server.use(
        http.delete("/api/shopping-lists/:id", ({ params }) => {
          const exists = mockShoppingLists.some((l) => l.id === params.id);
          if (!exists || params.id === nonExistentId) {
            return new HttpResponse(null, { status: 404, statusText: "Not Found" });
          }
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(ShoppingListService.delete(nonExistentId)).rejects.toThrow(
        "Failed to delete shopping list: Not Found"
      );
    });

    it("should throw an error if deleting list fails with server error", async () => {
      server.use(
        http.delete("/api/shopping-lists/:id", () => {
          return new HttpResponse(null, { status: 500, statusText: "Server Error" });
        })
      );

      await expect(ShoppingListService.delete(listIdToDelete)).rejects.toThrow(
        "Failed to delete shopping list: Server Error"
      );
    });
  });
});
