import { ApiError, db, handle, nowIso, readJson, requireAdmin, sendInvoice } from "@/lib/portal/server";
import type { StockRequest } from "@/lib/portal/types";

/** Admin reviews a stock request: approve, reject, or send the invoice (which also updates the vendor's stock). */
export const PATCH = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  await requireAdmin(req);
  const { id } = await params;
  const body = await readJson(req);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 400) : "";
  const ref = db().doc(`stockRequests/${id}`);

  if (body.action === "send") {
    const taxRate = Number(body.taxRate ?? 0);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) throw new ApiError(400, "GST % must be between 0 and 100.");
    const invoiceNotes = typeof body.invoiceNotes === "string" ? body.invoiceNotes.trim().slice(0, 500) : "";
    return sendInvoice(id, { taxRate, notes: invoiceNotes, adminNote: note });
  }

  const snap = await ref.get();
  if (!snap.exists) throw new ApiError(404, "Request not found.");
  const request = snap.data() as StockRequest;
  if (request.status === "sent") throw new ApiError(400, "The invoice for this request has already been sent.");

  if (body.action === "approve") {
    if (request.status !== "pending") throw new ApiError(400, `This request is already ${request.status}.`);
    await ref.update({ status: "approved", adminNote: note, updatedAt: nowIso() });
  } else if (body.action === "reject") {
    if (!note) throw new ApiError(400, "Add a reason for rejecting this request.");
    await ref.update({ status: "rejected", adminNote: note, updatedAt: nowIso() });
  } else {
    throw new ApiError(400, "Unknown action.");
  }
  return {};
});
