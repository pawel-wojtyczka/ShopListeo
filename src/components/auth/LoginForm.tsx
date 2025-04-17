import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import type { LoginUserRequest } from "../../types";

// Create a form schema
const loginFormSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
  rememberMe: z.boolean().optional(),
});

// Props for LoginForm component
interface LoginFormProps {
  onSubmit: (data: LoginUserRequest) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
}

export function LoginForm({ onSubmit, isSubmitting, apiError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserRequest>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("email")}
        />
        {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Hasło
        </label>
        <input
          id="password"
          type="password"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("password")}
        />
        {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="rememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          {...register("rememberMe")}
        />
        <label htmlFor="rememberMe" className="text-sm font-medium leading-none">
          Zapamiętaj mnie
        </label>
      </div>

      {apiError && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm font-medium text-destructive">{apiError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logowanie..." : "Zaloguj"}
      </Button>

      <div className="text-center text-sm">
        <p>
          Nie masz konta?{" "}
          <a href="/register" className="font-medium text-primary underline underline-offset-4">
            Zarejestruj się
          </a>
        </p>
        <p className="mt-2">
          <a href="/reset-password" className="font-medium text-primary underline underline-offset-4">
            Zapomniałeś hasła?
          </a>
        </p>
      </div>
    </form>
  );
}
