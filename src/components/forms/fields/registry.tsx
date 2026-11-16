import { CheckboxField } from "@/components/forms/fields/checkbox-field"
import { DateOfBirthField } from "@/components/forms/fields/date-of-birth-field"
import { FileField } from "@/components/forms/fields/file-field"
import { InstagramField } from "@/components/forms/fields/instagram-field"
import { PhoneField } from "@/components/forms/fields/phone-field"
import { ReferralPromoterField } from "@/components/forms/fields/referral-promoter-field"
import { ReferralPromoterFieldSkeleton } from "@/components/forms/fields/referral-promoter-field-skeleton"
import { RadioField } from "@/components/forms/fields/radio-field"
import { SelectField } from "@/components/forms/fields/select-field"
import { TextLikeField } from "@/components/forms/fields/text-like-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import type { FormFieldDefinition, FieldValidationContext } from "@/components/forms/fields/types"
import type { FormFieldType } from "@/lib/form-schema"
import {
  birthdayRequiredMessage,
  birthdayValidationMessage,
  isValidBirthdayFieldValue,
  normalizeBirthdayForSubmit,
} from "@/lib/form-fields/birthday"
import {
  instagramValidationMessage,
  isValidInstagramUsername,
  parseInstagramUsername,
} from "@/lib/form-fields/instagram"
import {
  emailValidationMessage,
  isValidEmailAddress,
} from "@/lib/form-fields/email"
import {
  isValidPhoneSubmitValue,
  phoneValidationMessage,
} from "@/lib/form-fields/phone"
import { findPromoterById, isPromoterRosterEntry } from "@/lib/promoters"

function referralValidationMessage(lang: string): string {
  return lang === "es"
    ? "El código de referido no es válido."
    : "The referral code is not valid."
}

function validateReferral(ctx: FieldValidationContext): string | null {
  const id = ctx.value.trim()
  if (!id) {
    return null
  }
  const promoter = findPromoterById(id)
  if (!promoter) {
    return null
  }
  if (
    isPromoterRosterEntry(promoter) &&
    (!promoter.active || !promoter.guest_pass_enabled)
  ) {
    return referralValidationMessage(ctx.lang)
  }
  return null
}

function textLikeDefinition(
  inputType: Exclude<
    FormFieldType,
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "instagram"
    | "date"
    | "tel"
    | "referral"
  >
): FormFieldDefinition {
  return {
    Control(props) {
      return <TextLikeField {...props} inputType={inputType} />
    },
  }
}

function validateDateOfBirth(ctx: FieldValidationContext): string | null {
  if (!ctx.value.trim()) {
    return ctx.field.required ? birthdayRequiredMessage(ctx.lang) : null
  }
  if (!isValidBirthdayFieldValue(ctx.value)) {
    return birthdayValidationMessage(ctx.lang)
  }
  return null
}

function validatePhone(ctx: FieldValidationContext): string | null {
  if (!ctx.value.trim()) {
    return ctx.field.required ? phoneValidationMessage(ctx.lang) : null
  }
  if (!isValidPhoneSubmitValue(ctx.value)) {
    return phoneValidationMessage(ctx.lang)
  }
  return null
}

function validateEmail(ctx: FieldValidationContext): string | null {
  const trimmed = ctx.value.trim()
  if (!trimmed) {
    return ctx.field.required ? emailValidationMessage(ctx.lang) : null
  }
  if (!isValidEmailAddress(trimmed)) {
    return emailValidationMessage(ctx.lang)
  }
  return null
}

function validateInstagram(ctx: FieldValidationContext): string | null {
  const username = parseInstagramUsername(ctx.value)
  if (!username) {
    return ctx.field.required ? instagramValidationMessage(ctx.lang) : null
  }
  if (!isValidInstagramUsername(username)) {
    return instagramValidationMessage(ctx.lang)
  }
  return null
}

const fieldRegistry = {
  text: textLikeDefinition("text"),
  email: {
    ...textLikeDefinition("email"),
    validate: validateEmail,
  },
  tel: {
    Control: PhoneField,
    validate: validatePhone,
  },
  url: textLikeDefinition("url"),
  number: textLikeDefinition("number"),
  date: {
    Control: DateOfBirthField,
    validate: validateDateOfBirth,
    normalize: normalizeBirthdayForSubmit,
  },
  textarea: { Control: TextareaField },
  select: { Control: SelectField },
  radio: { Control: RadioField },
  checkbox: { Control: CheckboxField, wrapsOwnLabel: true },
  file: { Control: FileField },
  instagram: {
    Control: InstagramField,
    validate: validateInstagram,
    normalize: parseInstagramUsername,
  },
  referral: {
    Control(props) {
      if (props.referralPromoterPending) {
        return <ReferralPromoterFieldSkeleton lang={props.lang} />
      }
      if (!props.referralPromoter) {
        return null
      }
      return (
        <ReferralPromoterField {...props} promoter={props.referralPromoter} />
      )
    },
    validate: validateReferral,
    wrapsOwnLabel: true,
  },
} satisfies Record<FormFieldType, FormFieldDefinition>

export function getFieldDefinition(type: FormFieldType): FormFieldDefinition {
  return fieldRegistry[type]
}
