"use client";

import { AddServiceForm } from "@/components/services/add-service-form";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { submitOrderAction } from "@/store/slice/orders/Orders";
import type { CreateOrderRequestBody, OrderResponse } from "@/types/orders";
import { AddServiceFormState, computeEstimatedPrice } from "@/types/services";
import { toast } from "react-toastify";

export default function PublicOrderServicePage() {
  const dispatch = useAppDispatch();
  const { fullName, email } = useAppSelector((state) => state.authenticate);
  const { submitting, submitError } = useAppSelector((state) => state.order);

  const handleFormSubmit = async (
    state: AddServiceFormState,
    attachments: { file: File; type: "image" | "video" }[] = [],
  ): Promise<OrderResponse> => {
    const body: CreateOrderRequestBody = {
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      customerPhone: "specified",
      orderNotes: state.orderNotes,
      configuration: JSON.parse(JSON.stringify(state)),
      estimatedPrice: computeEstimatedPrice(state),
    };

    try {
      const createdOrder = await dispatch(
        submitOrderAction({
          body,
          files: attachments.map((a) => a.file),
        }),
      ).unwrap();
      toast.success("Order submitted successfully!");
      return createdOrder;
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        submitError ||
        "Cannot submit order. Please try again.";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Book Service
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
          Choose the photo and video editing services that fit your needs.
          Fill in the details and our team will get in touch with you to confirm as soon as possible.
        </p>
      </div>

      <div className="rounded-xl border bg-card/60 p-4 sm:p-8 shadow-sm">
        <AddServiceForm
          submitting={submitting}
          onSubmit={handleFormSubmit}
          initialState={{
            customerName: fullName || "",
            customerEmail: email || "",
          }}
        />
      </div>
    </div>
  );
}
