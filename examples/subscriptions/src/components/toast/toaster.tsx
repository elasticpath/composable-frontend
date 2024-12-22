"use client";
import { useEffect } from "react";
import { useEvent } from "@elasticpath/react-shopper-hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Toaster(): JSX.Element {
  const { events } = useEvent();

  useEffect(() => {
    const sub = events.subscribe((event) => {
      const toastFn = event.type === "success" ? toast.success : toast.error;
      toastFn(`${"message" in event ? event.message : undefined}`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
    });
    return () => sub.unsubscribe();
  }, [events]);

  return <ToastContainer />;
}
