import { toast } from "sonner";

export function confirmToast({
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) {
    toast((t) => (
        <div className="flex flex-col gap-2">
            <p>{message}</p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => {
                        toast.dismiss(t);
                        onCancel?.();
                    }}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        toast.dismiss(t);
                        onConfirm?.();
                    }}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    ), {
        duration: 10000,
        important: true,
        closeButton: false,
    });
}
