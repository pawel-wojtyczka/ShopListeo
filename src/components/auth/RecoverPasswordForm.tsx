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

// Schema definition for password recovery form validation
const recoverPasswordSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu email." }),
});

type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;

interface RecoverPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
  successMessage: string | null;
}

const RecoverPasswordForm: React.FC<RecoverPasswordFormProps> = ({
  onSubmit,
  isSubmitting,
  apiError,
  successMessage,
}) => {
  const form = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleFormSubmit = (values: RecoverPasswordFormValues) => {
    onSubmit(values.email);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {successMessage ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircledIcon className="h-4 w-4" />
            <AlertTitle>Wysłano!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Wprowadź adres email powiązany z kontem, a wyślemy Ci link do zresetowania hasła.
            </div>

            {apiError && (
              <Alert variant="destructive">
                <AlertTitle>Błąd</AlertTitle>
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Wyślij link do resetowania
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Powrót do logowania
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RecoverPasswordForm;
