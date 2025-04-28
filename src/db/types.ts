export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Dodaj pozostałe tabele według potrzeb
    };
  };
  auth: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
        };
      };
    };
  };
}
