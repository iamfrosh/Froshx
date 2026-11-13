// Minimal service worker: lets the browser show "finish your registration" reminders
// and opens the registration form when the notification is tapped.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.navigate("/#register"); return c.focus(); }
      }
      return self.clients.openWindow("/#register");
    })
  );
});
