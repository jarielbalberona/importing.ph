# 🧪 Hook & Component Patterns

## React Query fetch + apiClient
```ts
export function useShipmentsQuery() {
  return useQuery(['shipments'], async () => {
    const res = await apiClient.get('/api/shipments');
    return res.data;
  });
}
```

## Submit quote mutation
```ts
export const useSubmitQuote = () => {
  return useMutation({
    mutationFn: async (input: QuoteInput) => {
      const res = await apiClient.post(`/api/quotes/${input.shipmentId}`, input);
      return res.data;
    }
  });
};
```

## Zod form + Tailwind
```ts
const schema = z.object({
  origin_city: z.string(),
  destination: z.string(),
});

const form = useForm({ resolver: zodResolver(schema) });

<input {...form.register("origin_city")} className="input" />
```