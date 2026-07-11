import tls from "tls";

type TlsWithSystemCa = typeof tls & {
  getCACertificates?: (type?: string) => string[];
  setDefaultCACertificates?: (certs: string[]) => void;
};

let applied = false;

/** Use the OS certificate store so Ollama Cloud works on Windows TLS setups. */
export function ensureSystemCertificates() {
  if (applied) return;
  applied = true;
  try {
    const tlsApi = tls as TlsWithSystemCa;
    if (typeof tlsApi.getCACertificates === "function" && typeof tlsApi.setDefaultCACertificates === "function") {
      tlsApi.setDefaultCACertificates(tlsApi.getCACertificates("system"));
    }
  } catch (error) {
    console.warn("[tls] could not apply system CA certificates:", error);
  }
}
