import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RespondedTaskDialog = ({
  data,
}: any) => {
  if(!data) return null
  return (
    <Dialog
      open={!!data}
      onOpenChange={() => window.location.reload()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data.status === "rejected" ? <span className="text-red-500">Rejected</span> : <span className="text-blue-500">Approved</span>}
          </DialogTitle>
          <DialogDescription>
            Task status has been updated to {data.status === "rejected" ? "rejected" : "approved"}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={data.status === "rejected" ? "destructive" : "success"} onClick={() => window.location.reload()}>Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RespondedTaskDialog;
