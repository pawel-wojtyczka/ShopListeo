import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import type { RegisterUserRequest } from "../../types";

// Schemat walidacji formularza
const registerFormSchema = z
  .object({
    email: z.string().email("Wprowadź poprawny adres email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną dużą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(/[^a-zA-Z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

// Definicja typów dla formularza
type RegisterFormInputs = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterUserRequest) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
}

export function RegisterForm({ onSubmit, isSubmitting, apiError }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Przygotowanie danych przed wysłaniem (usunięcie confirmPassword)
  const processSubmit = (data: RegisterFormInputs) => {
    const { confirmPassword, ...registerData } = data;
    onSubmit(registerData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
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

        {/* Wymagania dla hasła */}
        <div className="text-xs text-muted-foreground">
          <p>Hasło musi zawierać:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Co najmniej 8 znaków</li>
            <li>Co najmniej jedną małą literę (a-z)</li>
            <li>Co najmniej jedną dużą literę (A-Z)</li>
            <li>Co najmniej jedną cyfrę (0-9)</li>
            <li>Co najmniej jeden znak specjalny (!@#$%^&*...)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Potwierdź hasło
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {apiError && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm font-medium text-destructive">{apiError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Rejestracja..." : "Zarejestruj się"}
      </Button>

      <div className="text-center text-sm">
        <p>
          Masz już konto?{" "}
          <a href="/login" className="font-medium text-primary underline underline-offset-4">
            Zaloguj się
          </a>
        </p>
      </div>
    </form>
  );
}
