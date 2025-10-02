import { useQuery, useMutation } from "@tanstack/react-query";
import { getMeAPI, loginAPI, registerAPI, logoutAPI } from "@/api/auth";
import { appQueryClient } from "@/providers/react-query";

export function useProfile(data?: any) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getMeAPI,
    initialData: data
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: loginAPI,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerAPI,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutAPI,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
