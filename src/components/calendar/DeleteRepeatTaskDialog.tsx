import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteRepeatTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
  taskTitle: string;
}

export const DeleteRepeatTaskDialog = ({
  isOpen,
  onClose,
  onDeleteSingle,
  onDeleteAll,
  taskTitle,
}: DeleteRepeatTaskDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">Delete Repeat Task</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            "{taskTitle}" is a repeating task. What would you like to delete?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 w-full">
          <AlertDialogAction
            onClick={onDeleteSingle}
            className="w-full bg-stone-800 hover:bg-stone-900 text-sm"
          >
            Delete this instance only
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onDeleteAll}
            className="w-full bg-rose-600 hover:bg-rose-700 text-sm"
          >
            Delete this task and all future tasks
          </AlertDialogAction>
          <AlertDialogCancel onClick={onClose} className="w-full text-sm">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
