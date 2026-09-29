import { cn } from "@/lib/utils";
import type { EmailOnlyFormValues, FormValues } from "../lib/types";
import type {
  FieldErrors,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type CommonFieldProps = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

type EmailOnlyFieldProps = {
  register: UseFormRegister<EmailOnlyFormValues>;
  errors: FieldErrors<EmailOnlyFormValues>;
};

export function EmailField({
  register,
  errors,
  rules,
}: CommonFieldProps & { rules: RegisterOptions<FormValues, "email"> }) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="email"
        className={cn(
          "typo-label-sm text-text-primary",
          errors.email && "text-status-danger",
        )}
      >
        Email
      </Label>
      <Input
        id="email"
        type="email"
        className="border-border-subtitle text-base sm:typo-label-sm w-full rounded-md border px-3 py-2"
        autoComplete="email"
        {...register("email", rules)}
      />
      {errors.email?.message && (
        <p className="typo-label-sm text-status-danger">
          {errors.email.message}
        </p>
      )}
    </div>
  );
}

export function EmailOnlyField({
  register,
  errors,
  rules,
}: EmailOnlyFieldProps & {
  rules: RegisterOptions<EmailOnlyFormValues, "email">;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="email"
        className={cn(
          "typo-label-sm text-text-primary",
          errors.email && "text-status-danger",
        )}
      >
        Email
      </Label>
      <Input
        id="email"
        type="email"
        className="border-border-subtitle text-base sm:typo-label-sm w-full rounded-md border px-3 py-2"
        autoComplete="email"
        {...register("email", rules)}
      />
      {errors.email?.message && (
        <p className="typo-label-sm text-status-danger">
          {errors.email.message}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  register,
  errors,
  rules,
  autoComplete,
}: CommonFieldProps & {
  rules: RegisterOptions<FormValues, "password">;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="password"
        className={cn(
          "typo-label-sm text-text-primary",
          errors.password && "text-status-danger",
        )}
      >
        Password
      </Label>

      <Input
        id="password"
        type="password"
        className="border-border-subtitle text-base sm:typo-label-sm w-full rounded-md border px-3 py-2"
        autoComplete={autoComplete}
        {...register("password", rules)}
      />

      {errors.password?.message && (
        <p className="typo-label-sm text-status-danger">
          {errors.password.message}
        </p>
      )}
    </div>
  );
}

