"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ComponentProps, type FormEvent } from "react"

import { normalizeAuthErrorMessage, validateSignupValues } from "~/lib/auth/forms"
import { getAfterAuthRedirect } from "~/lib/auth/routing"
import { cn } from "~/lib/utils"
import { authClient } from "~/server/better-auth/client"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"

export function SignupForm({
  className,
  nextPath,
  ...props
}: ComponentProps<"div"> & {
  nextPath?: string | null
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const nameValue = formData.get("name")
    const emailValue = formData.get("email")
    const passwordValue = formData.get("password")
    const confirmPasswordValue = formData.get("confirmPassword")
    const signupValues = validateSignupValues({
      name: typeof nameValue === "string" ? nameValue : "",
      email: typeof emailValue === "string" ? emailValue : "",
      password: typeof passwordValue === "string" ? passwordValue : "",
      confirmPassword:
        typeof confirmPasswordValue === "string" ? confirmPasswordValue : "",
    })

    if (!signupValues.data) {
      setError(signupValues.error)
      return
    }

    setError(null)
    setIsPending(true)

    try {
      await authClient.signUp.email({
        ...signupValues.data,
        fetchOptions: {
          throw: true,
        },
      })

      router.replace(getAfterAuthRedirect(nextPath))
      router.refresh()
    } catch (authError) {
      setError(normalizeAuthErrorMessage(authError))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-invalid={!!error}
                  disabled={isPending}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-invalid={!!error}
                  disabled={isPending}
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!error}
                      disabled={isPending}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!error}
                      disabled={isPending}
                      required
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <FieldError>{error}</FieldError>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href={loginHref}>
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to the terms and privacy policy for this app.
      </FieldDescription>
    </div>
  )
}
