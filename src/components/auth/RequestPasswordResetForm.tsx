import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";

// Schemat walidacji formularza
const resetPasswordFormSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordFormSchema>;

interface RequestPasswordResetFormProps {
  onSubmit: (email: string) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
  successMessage: string | null;
}

export function RequestPasswordResetForm({
  onSubmit,
  isSubmitting,
  apiError,
  successMessage,
}: RequestPasswordResetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const processSubmit = (data: ResetPasswordFormInputs) => {
    onSubmit(data.email);
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
          placeholder="Podaj swój adres email"
          {...register("email")}
        />
        {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
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
