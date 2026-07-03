// SSO-ready cookie scoping.
//
// By default the Supabase auth cookie is host-only (valid for exactly the host
// that set it). To let ONE hecz login work across the whole ecosystem
// (hecz.dev / study / tag / pulse), the cookie must be scoped to the shared
// parent domain instead.
//
// This is the single switch that turns that on: set
//   NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.hecz.dev
// and every Supabase client (browser, server, middleware) will write the session
// cookie at the parent domain, so a session minted on one subdomain is honoured
// on all of them. Leave it UNSET and behaviour is byte-for-byte identical to the
// host-only default — nothing changes for the standalone study app today.
//
// Note: this enables cross-SUBDOMAIN SSO only. SSO across different apex domains
// is a larger project (a shared auth origin / token broker) and is out of scope.
export function authCookieOptions(): { domain?: string } {
  const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();
  return domain ? { domain } : {};
}
