import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";
import { CheckCircledIcon } from "@radix-ui/react-icons";

// Schema walidacji formularza
const setNewPasswordSchema = z
  .object({
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

type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;

interface SetNewPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
  successMessage: string | null;
  disabled?: boolean;
}

const SetNewPasswordForm: React.FC<SetNewPasswordFormProps> = ({
  onSubmit,
  isSubmitting,
  apiError,
  successMessage,
  disabled = false,
}) => {
  const form = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = (values: SetNewPasswordFormValues) => {
    onSubmit(values.password);
  };

  return (
    <Card>
      <CardHeader>{/* <CardTitle>Ustaw nowe hasło</CardTitle> */}</CardHeader>
      <CardContent>
        {successMessage ? (
          <Alert variant="default">
            <CheckCircledIcon className="h-4 w-4" />
            <AlertTitle>Sukces!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">Wprowadź nowe hasło dla swojego konta.</p>
            {apiError && (
              <Alert variant="destructive">
                <AlertTitle>Błąd</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <Input id="password" type="password" {...form.register("password")} disabled={isSubmitting || disabled} />
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
                disabled={isSubmitting || disabled}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
              {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Ustaw nowe hasło
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        {successMessage && (
          <p>
            <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Przejdź do logowania
            </a>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default SetNewPasswordForm;
