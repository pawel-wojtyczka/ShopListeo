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

// Define Zod schema for validation
const requestResetSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu email." }),
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;

interface RequestPasswordResetFormProps {
  onSubmit: (email: string) => Promise<void>;
  isSubmitting: boolean;
  apiError: string | null;
  successMessage: string | null;
}

const RequestPasswordResetForm: React.FC<RequestPasswordResetFormProps> = ({
  onSubmit,
  isSubmitting,
  apiError,
  successMessage,
}) => {
  const form = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleFormSubmit = (values: RequestResetFormValues) => {
    onSubmit(values.email);
  };

  return (
    <Card>
      <CardHeader>{/* <CardTitle>Resetuj hasło</CardTitle> */}</CardHeader>
      <CardContent>
        {successMessage ? (
          <Alert variant="default">
            <CheckCircledIcon className="h-4 w-4" />
            <AlertTitle>Wysłano!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wprowadź adres email powiązany z kontem, a wyślemy Ci link do zresetowania hasła.
            </p>
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
      <CardFooter className="flex flex-col space-y-2 text-sm">
        <p>
          <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Powrót do logowania
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RequestPasswordResetForm;
