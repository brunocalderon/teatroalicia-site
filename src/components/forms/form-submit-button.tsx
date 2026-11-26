type FormSubmitButtonProps = {
  label: string
  disabled?: boolean
  type?: "button" | "submit"
  onClick?: () => void
}

export function FormSubmitButton({
  label,
  disabled,
  type = "submit",
  onClick,
}: FormSubmitButtonProps) {
  return (
    <button
      type={type}
      className="form-submit"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="form-submit__inner">
        <span className="form-submit__label">{label}</span>
        <svg
          className="form-submit__icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </button>
  )
}