import React from "react";
import { Button as RACButton, Dialog, Heading, Modal as RACModal, ModalOverlay } from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface IProps extends React.HTMLProps<HTMLDivElement> {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  closeOnClickOutside?: boolean;
  className?: string;
  wrapperClassName?: string;
}

export default function Modal({
  children,
  title,
  open,
  closeOnClickOutside = false,
  onOpenChange,
  className,
  wrapperClassName,
}: IProps) {
  return (
    <>
      <ModalOverlay
        isDismissable={closeOnClickOutside}
        isOpen={open}
        onOpenChange={onOpenChange}
        className={({ isEntering, isExiting }) =>
          twMerge(
            "fixed inset-0 z-100 bg-black/50 transition-[background-color] duration-200 flex items-center justify-center",
            isEntering ? "bg-black/0" : isExiting ? "bg-black/0" : ""
          )
        }
      >
        <RACModal
          className={({ isEntering, isExiting }) =>
            twMerge(
              "w-2/5 bg-surface shadow-500-offset-left rounded-mdoverflow-hidden",
              isEntering ? "animate-in fade-in duration-200" : isExiting ? "animate-out fade-out duration-200" : "",
              wrapperClassName
            )
          }
        >
          <Dialog
            className={twMerge(
              "max-h-screen relative bg-white dark:bg-slate-700 h-full w-full flex flex-col outline-0",
              className
            )}
          >
            <Heading
              slot="title"
              className="p-4 text-xl flex items-center justify-between font-medium border-b dark:border-slate-800"
            >
              {title}
              <RACButton slot="close" className="w-6 h-6 p-0 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </RACButton>
            </Heading>
            {children}
          </Dialog>
        </RACModal>
      </ModalOverlay>
    </>
  );
}

Modal.Body = function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge("grow overflow-y-auto p-4 flex flex-col gap-400", className)}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge("p-4 flex items-center gap-400 font-medium border-t dark:border-slate-800", className)}>
      {children}
    </div>
  );
};
