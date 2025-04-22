import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";
import type { RegisterUserRequest } from "../../types";

// Schema definition for registration form validation
const registerSchema = z
  .object({
    email: z.string().email({ message: "Nieprawidłowy format adresu email." }),
    password: z.string().min(8, { message: "Hasło musi mieć minimum 8 znaków." }),
    confirmPassword: z.string().min(1, { message: "Potwierdź hasło." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  // onSubmit expects the shape defined by RegisterUserRequest (email, password)
  // We derive this from the form values after validation
  onSubmit: (data: RegisterUserRequest) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isSubmitting, apiError }) => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = (values: RegisterFormValues) => {
    // Pass only email and password to the onSubmit handler
    onSubmit({ email: values.email, password: values.password });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertTitle>Błąd rejestracji</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ty@przyklad.com"
              {...form.register("email")}
              disabled={isSubmitting}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" {...form.register("password")} disabled={isSubmitting} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} disabled={isSubmitting} />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Zarejestruj się
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          Masz już konto?{" "}
          <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Zaloguj się
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
