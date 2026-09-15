import { baseApi } from "@/services/api";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendChatMessage: build.mutation({
      query: (messages) => ({ url: "/ai/chat", method: "POST", body: { messages } }),
      transformResponse: (response) => response.data.reply,
    }),
  }),
});

export const { useSendChatMessageMutation } = aiApi;
