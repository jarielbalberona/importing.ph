import { useQuery, useMutation } from "@tanstack/react-query";
import { appQueryClient } from "@/providers/react-query";
import { 
  createQuoteAPI, 
  deleteQuoteAPI, 
  getQuoteAPI, 
  getQuotesByShipmentAPI, 
  getMyQuotesAPI,
  updateQuoteAPI,
  acceptQuoteAPI,
  rejectQuoteAPI
} from "@/api/quotes";

export function useQuote(quoteId: string, initialQuote?: any) {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => getQuoteAPI(quoteId),
    initialData: initialQuote,
  });
}

export function useQuotesByShipment(shipmentId: string, initialQuotes?: any) {
  return useQuery({
    queryKey: ["quotes", "shipment", shipmentId],
    queryFn: () => getQuotesByShipmentAPI(shipmentId),
    initialData: initialQuotes,
  });
}

export function useMyQuotes(initialQuotes?: any) {
  return useQuery({
    queryKey: ["my-quotes"],
    queryFn: getMyQuotesAPI,
    initialData: initialQuotes,
  });
}

export function useCreateQuote() {
  return useMutation({
    mutationKey: ["quotes"],
    mutationFn: createQuoteAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["quotes"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-quotes"] });
      appQueryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

export function useUpdateQuote() {
  return useMutation({
    mutationKey: ["quotes"],
    mutationFn: updateQuoteAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["quotes"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-quotes"] });
    },
  });
}

export function useDeleteQuote() {
  return useMutation({
    mutationKey: ["quotes"],
    mutationFn: deleteQuoteAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["quotes"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-quotes"] });
    },
  });
}

export function useAcceptQuote() {
  return useMutation({
    mutationKey: ["quotes"],
    mutationFn: acceptQuoteAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["quotes"] });
      appQueryClient.invalidateQueries({ queryKey: ["shipments"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}

export function useRejectQuote() {
  return useMutation({
    mutationKey: ["quotes"],
    mutationFn: rejectQuoteAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["quotes"] });
      appQueryClient.invalidateQueries({ queryKey: ["shipments"] });
      appQueryClient.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}
