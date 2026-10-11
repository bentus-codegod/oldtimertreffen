/**
 * Kleine Sperrliste gängiger Wegwerf-/Temporär-Mail-Domains. Bewusst kurz und
 * wartbar gehalten – keine 100%-Abdeckung (die gibt es nicht), aber sie hebt
 * die Hürde spürbar. Bei Bedarf später durch eine größere Liste/Service ersetzen.
 */
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "grr.la",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "trashmail.com",
  "trashmail.de",
  "throwawaymail.com",
  "getnada.com",
  "nada.email",
  "yopmail.com",
  "yopmail.net",
  "maildrop.cc",
  "dispostable.com",
  "mintemail.com",
  "fakeinbox.com",
  "mailnesia.com",
  "mohmal.com",
  "emailondeck.com",
  "spamgourmet.com",
  "mytemp.email",
  "moakt.com",
  "tempr.email",
  "discard.email",
  "wegwerfemail.de",
  "einrot.com",
  "fakemail.net",
  "tmpmail.org",
  "mail-temp.com",
  "burnermail.io",
]);

/** true, wenn die E-Mail eine bekannte Wegwerf-Domain nutzt. */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}
