import { useQuery, useMutation } from "@tanstack/react-query";
import { appQueryClient } from "@/providers/react-query";
import { 
  createShipmentAPI, 
  deleteShipmentAPI, 
  getShipmentAPI, 
  getShipmentsAPI, 
  getMyShipmentsAPI,
  updateShipmentAPI 
} from "@/api/shipments";

export function useShipment(shipmentId: string, initialShipment?: any) {
  return useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => getShipmentAPI(shipmentId),
    initialData: initialShipment,
  });
}

export function useShipments(initialShipments?: any) {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: getShipmentsAPI,
    initialData: initialShipments,
  });
}

export function useMyShipments(initialShipments?: any) {
  return useQuery({
    queryKey: ["my-shipments"],
    queryFn: getMyShipmentsAPI,
    initialData: initialShipments,
  });
}

export function useCreateShipment() {
  return useMutation({
    mutationKey: ["shipments"],
    mutationFn: createShipmentAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["shipments"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}

export function useUpdateShipment() {
  return useMutation({
    mutationKey: ["shipments"],
    mutationFn: updateShipmentAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["shipments"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}

export function useDeleteShipment() {
  return useMutation({
    mutationKey: ["shipments"],
    mutationFn: deleteShipmentAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["shipments"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}
