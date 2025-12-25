import { TextField as RACTextField, Input as RACInput, Label as RACLabel } from "react-aria-components";

interface IProps {
  name: string;
  label?: string;
  placeholder?: string;
}

export default function TextField({ name, placeholder, label }: IProps) {
  return (
    <RACTextField className="flex flex-col gap-1">
      {label && <RACLabel className="text-sm font-medium">{label}</RACLabel>}
      <RACInput
        name={name}
        placeholder={placeholder}
        className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-slate-600"
      />
    </RACTextField>
  );
}
