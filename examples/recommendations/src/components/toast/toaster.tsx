"use client";
import { useEffect, type JSX } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEvent } from "../../hooks/use-event";

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
