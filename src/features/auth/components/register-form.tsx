"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";

type RegisterFormProps = {
  redirectTo: string;
};

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const DEFAULT_ERROR = "Unable to create your account. Please try again.";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return DEFAULT_ERROR;
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const { FormTextField } = useFormFields<RegisterFormValues>();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } as RegisterFormValues,
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      formApi.setErrorMap({ onSubmit: undefined });

      let requestError: string | null = null;

      await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
        callbackURL: redirectTo,
        fetchOptions: {
          onError(context) {
            requestError = getErrorMessage(context.error);
          },
        },
      });

      if (requestError) {
        formApi.setErrorMap({ onSubmit: requestError });
        return;
      }

      toast.success("Account created successfully.");
      router.push(redirectTo);
      router.refresh();
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Use the same dashboard style, now backed by better-auth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form.Form className="space-y-6 p-0">
              <FieldGroup>
                <FormTextField
                  name="name"
                  label="Name"
                  required
                  placeholder="Acme Operator"
                />

                <FormTextField
                  name="email"
                  label="Email"
                  required
                  type="email"
                  placeholder="m@example.com"
                />

                <FormTextField
                  name="password"
                  label="Password"
                  required
                  type="password"
                  placeholder="At least 8 characters"
                />

                <form.AppField name="confirmPassword">
                  {(field) => (
                    <field.TextField
                      label="Confirm password"
                      required
                      type="password"
                      placeholder="Enter your password again"
                    />
                  )}
                </form.AppField>

                <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                  {(submitError) =>
                    typeof submitError === "string" && submitError ? (
                      <FieldError>{submitError}</FieldError>
                    ) : null
                  }
                </form.Subscribe>

                <Field>
                  <form.SubmitButton className="w-full">
                    Create account
                  </form.SubmitButton>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link
                      href={`/login?next=${encodeURIComponent(redirectTo)}`}
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form.Form>
          </form.AppForm>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{" "}
        <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
