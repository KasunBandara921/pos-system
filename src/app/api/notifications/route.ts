import { NextRequest } from "next/server";
import { notificationEmitter } from "../../actions/notification";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connect signal
      controller.enqueue(encoder.encode("data: connected\n\n"));

      const onNotification = (data: any) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          console.error("Failed to push stream event:", err);
        }
      };

      // Listen for notifications
      notificationEmitter.on("out-of-stock", onNotification);

      // Clean up on close/abort
      req.signal.addEventListener("abort", () => {
        notificationEmitter.off("out-of-stock", onNotification);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
