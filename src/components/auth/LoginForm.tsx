import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";

import type { LoginUserRequest } from "../../types";

// Schema definition for login form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu email." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginUserRequest) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting, apiError }) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleFormSubmit = (values: LoginFormValues) => {
    onSubmit(values);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertTitle>Błąd logowania</AlertTitle>
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
          <div className="flex items-center space-x-2">
            <Checkbox id="rememberMe" {...form.register("rememberMe")} disabled={isSubmitting} />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Zapamiętaj mnie
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Zaloguj się
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        <p>
          Nie masz konta?{" "}
          <a href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Zarejestruj się
          </a>
        </p>
        <p>
          <a href="/recover" className="font-medium text-primary underline-offset-4 hover:underline">
            Nie pamiętasz hasła?
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
