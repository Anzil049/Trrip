import toast from "react-hot-toast";

/**
 * Copy text to clipboard with fallback for HTTP sites.
 * navigator.clipboard only works on HTTPS/localhost,
 * so we fall back to the legacy execCommand approach.
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for HTTP
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    toast.success("Link copied to clipboard!");
    return true;
  } catch {
    toast.error("Failed to copy. Please copy the link manually.");
    return false;
  }
};
