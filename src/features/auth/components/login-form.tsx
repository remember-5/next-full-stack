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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";

type LoginFormProps = {
  redirectTo: string;
};

type LoginFormValues = {
  email: string;
  password: string;
};

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const DEFAULT_ERROR =
  "Unable to sign in. Check your email and password and try again.";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return DEFAULT_ERROR;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { FormTextField } = useFormFields<LoginFormValues>();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginFormValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      formApi.setErrorMap({ onSubmit: undefined });

      let requestError: string | null = null;

      await authClient.signIn.email({
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

      toast.success("Signed in successfully.");
      router.push(redirectTo);
      router.refresh();
    },
    onSubmitInvalid: ({ formApi }) => {
      const error = formApi.state.errorMap.onSubmit;
      if (typeof error === "string" && error) {
        toast.error(error);
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form.Form className="space-y-6 p-0">
              <FieldGroup>
                <FormTextField
                  name="email"
                  label="Email"
                  required
                  type="email"
                  placeholder="m@example.com"
                />

                <form.AppField name="password">
                  {(field) => (
                    <field.FieldSet>
                      <Field>
                        <div className="flex items-center">
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <span className="text-muted-foreground ml-auto text-sm">
                            Forgot password?
                          </span>
                        </div>
                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          autoComplete="current-password"
                          placeholder="Enter your password"
                        />
                      </Field>
                      <field.FieldError />
                    </field.FieldSet>
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
                    Sign in
                  </form.SubmitButton>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={`/register?next=${encodeURIComponent(redirectTo)}`}
                    >
                      Sign up
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
