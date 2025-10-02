import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CreateTaskDialog = ({
  isConfirmDeleteDialogOpen,
  setIsConfirmDeleteDialogOpen,
  handleDeleteTask,
}: any) => {
  return (
    <Dialog
      open={isConfirmDeleteDialogOpen}
      onOpenChange={setIsConfirmDeleteDialogOpen}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex-1">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task? This action cannot be
            undone. The associated assignment and or approval will also be
            permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsConfirmDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteTask}>Delete Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
