import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon, CheckCircledIcon } from "@radix-ui/react-icons";

// Schema definition for reset password form validation
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Hasło musi mieć minimum 8 znaków." }),
    confirmPassword: z.string().min(1, { message: "Potwierdź hasło." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
  successMessage: string | null;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, isSubmitting, apiError, successMessage }) => {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = (values: ResetPasswordFormValues) => {
    onSubmit(values.password);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {successMessage ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircledIcon className="h-4 w-4" />
            <AlertTitle>Sukces!</AlertTitle>
            <AlertDescription>
              {successMessage}
              <div className="mt-2">
                <a href="/login" className="font-medium text-green-800 underline-offset-4 hover:underline">
                  Przejdź do strony logowania
                </a>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">Wprowadź nowe hasło dla swojego konta.</div>

            {apiError && (
              <Alert variant="destructive">
                <AlertTitle>Błąd</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <Input id="password" type="password" {...form.register("password")} disabled={isSubmitting} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                disabled={isSubmitting}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Ustaw nowe hasło
            </Button>
          </form>
        )}
      </CardContent>
      {!successMessage && (
        <CardFooter className="flex justify-center text-sm">
          <p>
            <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Powrót do logowania
            </a>
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ResetPasswordForm;
