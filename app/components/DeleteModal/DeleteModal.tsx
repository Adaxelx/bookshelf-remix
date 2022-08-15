import { DialogContent, DialogOverlay } from "@reach/dialog";
import defaultStyles from "@reach/dialog/styles.css";
import { Form } from "@remix-run/react";
import type { ReactElement } from "react";
import styles from "./styles.css";
export const links = () => [
  { rel: "stylesheet", href: defaultStyles },
  { rel: "stylesheet", href: styles },
];

export default function DeleteModal({
  isOpen,
  onClose,
  title,
  content,
  actions,
}: DeleteModalProps) {
  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onClose}>
      <DialogContent>
        <h4 className="text-red-600">{title}</h4>
        <p className="font-medium">{content}</p>
        <Form method="post" className="flex justify-between">
          {actions}
        </Form>
      </DialogContent>
    </DialogOverlay>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  actions?: ReactElement | ReactElement[];
}
