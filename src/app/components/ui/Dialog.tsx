import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Dialog({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) {
  return <DialogPrimitive.Trigger asChild={asChild}>{children}</DialogPrimitive.Trigger>;
}

export function DialogContent({ children, title, description }: { children: React.ReactNode, title: string, description?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
      <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-1 mb-5">
          <DialogPrimitive.Title className="text-xl font-semibold text-gray-900">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="text-sm text-gray-500">
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
        
        {children}
        
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-salmon-500 focus:ring-offset-2">
          <X className="h-5 w-5 text-gray-500" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
