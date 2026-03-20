import { useMutation } from "@tanstack/react-query";
import type {
  GenerateEmailsResult,
  OfferData,
  ProspectData,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGenerateEmails() {
  const { actor } = useActor();

  return useMutation<
    GenerateEmailsResult,
    Error,
    { prospect: ProspectData; offer: OfferData; tone: string }
  >({
    mutationFn: async ({ prospect, offer, tone }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.generateEmails(prospect, offer, tone);
    },
  });
}
