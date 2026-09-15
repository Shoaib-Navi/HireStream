import { baseApi } from "@/services/api";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendChatMessage: build.mutation({
      query: (messages) => ({ url: "/ai/chat", method: "POST", body: { messages } }),
      transformResponse: (response) => response.data.reply,
    }),
    draftJobDescription: build.mutation({
      query: (body) => ({ url: "/ai/job-description", method: "POST", body }),
      transformResponse: (response) => response.data.draft,
    }),
  }),
});

export const { useSendChatMessageMutation, useDraftJobDescriptionMutation } = aiApi;
