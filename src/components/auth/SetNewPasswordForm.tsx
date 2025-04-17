import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";

// Schema walidacji formularza
const setNewPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną dużą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

type SetNewPasswordFormInputs = z.infer<typeof setNewPasswordFormSchema>;

interface SetNewPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
  successMessage: string | null;
  disabled?: boolean;
}

export function SetNewPasswordForm({
  onSubmit,
  isSubmitting,
  apiError,
  successMessage,
  disabled = false,
}: SetNewPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetNewPasswordFormInputs>({
    resolver: zodResolver(setNewPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const processSubmit = (data: SetNewPasswordFormInputs) => {
    onSubmit(data.password);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Nowe hasło
        </label>
        <input
          id="password"
          type="password"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          {...register("password")}
        />
        {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Potwierdź nowe hasło
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
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

      {successMessage && (
        <div className="rounded-md bg-green-100 p-3">
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
        {isSubmitting ? "Aktualizowanie..." : "Ustaw nowe hasło"}
      </Button>

      <div className="text-center text-sm">
        <p>
          <a href="/login" className="font-medium text-primary underline underline-offset-4">
            Wróć do logowania
          </a>
        </p>
      </div>
    </form>
  );
}
