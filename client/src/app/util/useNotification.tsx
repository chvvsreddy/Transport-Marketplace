import { useCallback } from "react";

export default function useNotification() {
  const showNotification = useCallback(
    (title: string, options: NotificationOptions, onClickUrl: string) => {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
      }

      const triggerNotification = () => {
        const notification = new Notification(title, options);

        notification.onclick = (event) => {
          event.preventDefault();
          if (onClickUrl) {
            window.open(onClickUrl, "_blank");
          }
        };
      };

      if (Notification.permission === "granted") {
        triggerNotification();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            triggerNotification();
          }
        });
      }
    },
    []
  );

  return { showNotification };
}
