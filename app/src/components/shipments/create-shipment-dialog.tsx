"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateShipment } from "@/hooks/react-queries/shipments";
import { toast } from "sonner";

export default function CreateShipmentDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    origin_city: "",
    destination: "",
    delivery_type: "",
    cargo_volume: "",
    item_type: "",
    target_delivery_date: "",
    notes: "",
  });

  const createShipmentMutation = useCreateShipment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createShipmentMutation.mutateAsync(formData);
      toast.success("Shipment created successfully!");
      setOpen(false);
      setFormData({
        origin_city: "",
        destination: "",
        delivery_type: "",
        cargo_volume: "",
        item_type: "",
        target_delivery_date: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to create shipment");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Shipment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>
            Post a new shipment request to receive quotes from forwarders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin_city">Origin City</Label>
              <Input
                id="origin_city"
                placeholder="e.g. Guangzhou"
                value={formData.origin_city}
                onChange={(e) => handleInputChange("origin_city", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g. Manila"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="delivery_type">Delivery Type</Label>
            <Select
              value={formData.delivery_type}
              onValueChange={(value) => handleInputChange("delivery_type", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="door_to_door">Door to Door</SelectItem>
                <SelectItem value="to_manila_warehouse">To Manila Warehouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cargo_volume">Cargo Volume</Label>
            <Input
              id="cargo_volume"
              placeholder="e.g. 2 CBM / 200kg"
              value={formData.cargo_volume}
              onChange={(e) => handleInputChange("cargo_volume", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="item_type">Item Type (Optional)</Label>
            <Input
              id="item_type"
              placeholder="e.g. Electronics, Clothing"
              value={formData.item_type}
              onChange={(e) => handleInputChange("item_type", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="target_delivery_date">Target Delivery Date (Optional)</Label>
            <Input
              id="target_delivery_date"
              type="date"
              value={formData.target_delivery_date}
              onChange={(e) => handleInputChange("target_delivery_date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or instructions..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createShipmentMutation.isPending}
            >
              {createShipmentMutation.isPending ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
