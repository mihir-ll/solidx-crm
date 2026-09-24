import {
  SolidDatePicker,
  SolidMessage,
  type SolidFormFieldWidgetProps,
} from "@solidxai/core-ui";
import "./lead-future-date-form.css";

const startOfToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const toDateValue = (value: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function LeadFutureDateFormWidget({
  formik,
  fieldContext,
}: SolidFormFieldWidgetProps) {
  if (!fieldContext) return null;

  const fieldLayoutInfo = fieldContext.field;
  const fieldMetadata = fieldContext.fieldMetadata;
  const fieldName = fieldLayoutInfo.attrs.name;
  const fieldLabel = fieldLayoutInfo.attrs.label ?? fieldMetadata.displayName;
  const isDateTime = fieldMetadata.type === "datetime";
  const selected = toDateValue(formik.values[fieldName]);
  const formLayout = fieldContext.solidFormViewMetaData?.data?.solidView?.layout;
  const isInvalid = formik.touched[fieldName] && formik.errors[fieldName];

  const handleChange = (date: Date | null) => {
    fieldContext.onChange?.(
      { target: { name: fieldName, value: date } },
      "onFieldChange",
    );
  };

  return (
    <div className="relative">
      <div className="lead-future-date-form__field-wrapper">
        {fieldLayoutInfo.attrs.showLabel !== false && (
          <label
            htmlFor={fieldName}
            className="lead-future-date-form__label form-field-label"
          >
            {fieldLabel}
            {fieldMetadata.required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <SolidDatePicker
          selected={selected ?? undefined}
          onChange={handleChange}
          minDate={startOfToday()}
          showTimeSelect={isDateTime}
          dateFormat={isDateTime ? "yyyy-MM-dd h:mm aa" : "yyyy-MM-dd"}
          disabled={
            formLayout?.attrs?.disabled ||
            fieldLayoutInfo.attrs?.disabled ||
            fieldContext.readOnly
          }
          readOnly={formLayout?.attrs?.readonly || fieldLayoutInfo.attrs?.readonly}
          placeholderText={fieldLayoutInfo.attrs.placeholder}
          inputClassName="lead-future-date-form__input"
        />
      </div>
      {isInvalid && (
        <div className="absolute mt-1">
          <SolidMessage
            severity="error"
            text={String(formik.errors[fieldName])}
          />
        </div>
      )}
    </div>
  );
}
