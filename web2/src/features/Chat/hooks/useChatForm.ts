import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMessageSchema, type SendMessageDto } from "../dtos/chat.dtos";
import { toast } from "react-hot-toast";

/**
 * Hook for managing the message input form.
 * Uses react-hook-form and Zod validation (DTO).
 */
export function useChatForm(onSubmit: (data: SendMessageDto) => Promise<void>) {
  const form = useForm<SendMessageDto>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: ""
    }
  });

  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      form.reset({ content: "" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      toast.error(errorMessage);
    }
  });

  return {
    form,
    onSubmit: handleFormSubmit,
    isSubmitting: form.formState.isSubmitting
  };
}
