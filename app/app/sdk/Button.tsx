import { composeRenderProps, Button as RACButton } from "react-aria-components";
import { tv } from "tailwind-variants";

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: any;
}

const buttonVariants = tv({
  base: "cursor-pointer border rounded-md py-1 px-3",
});

export default function Button({ className, children, ...rest }: IProps) {
  return (
    <RACButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonVariants({ ...renderProps, className })
      )}
      {...rest}
    >
      {children}
    </RACButton>
  );
}
