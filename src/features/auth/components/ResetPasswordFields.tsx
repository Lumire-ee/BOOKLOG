import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  FieldErrors,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import type { ResetPasswordFormValues } from "../lib/types";

type ResetPasswordFieldsProps = {
  register: UseFormRegister<ResetPasswordFormValues>;
  errors: FieldErrors<ResetPasswordFormValues>;
  passwordRules: RegisterOptions<ResetPasswordFormValues, "password">;
  passwordConfirmRules: RegisterOptions<
    ResetPasswordFormValues,
    "passwordConfirm"
  >;
};

export default function ResetPasswordFields({
  register,
  errors,
  passwordRules,
  passwordConfirmRules,
}: ResetPasswordFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="new-password"
          className={cn(
            "typo-label-sm text-text-primary",
            errors.password && "text-status-danger",
          )}
        >
          새 비밀번호
        </Label>
        <Input
          id="new-password"
          type="password"
          className="border-border-subtitle text-base sm:typo-label-sm w-full rounded-md border px-3 py-2"
          autoComplete="new-password"
          {...register("password", passwordRules)}
        />
        {errors.password?.message && (
          <p className="typo-label-sm text-status-danger">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="new-password-confirm"
          className={cn(
            "typo-label-sm text-text-primary",
            errors.passwordConfirm && "text-status-danger",
          )}
        >
          비밀번호 확인
        </Label>
        <Input
          id="new-password-confirm"
          type="password"
          className="border-border-subtitle text-base sm:typo-label-sm w-full rounded-md border px-3 py-2"
          autoComplete="new-password"
          {...register("passwordConfirm", passwordConfirmRules)}
        />
        {errors.passwordConfirm?.message && (
          <p className="typo-label-sm text-status-danger">
            {errors.passwordConfirm.message}
          </p>
        )}
      </div>
    </>
  );
}
