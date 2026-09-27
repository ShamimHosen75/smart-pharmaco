- Keep settings in the existing Zustand settings store, persisted to browser storage; this preserves local pharmacy preferences across reloads until a connected backend exists.
- Group settings in one searchable sidebar rather than separate routes; the reference design uses a single settings workspace and existing module links lead to operational pages.
- Treat external services, security, and public profiles as unconnected until real hosted integrations exist; a local switch must not imply a live service.
- Store real staff identity, invitations, and roles in Lovable Cloud with separate role rows and server-enforced policies; browser settings and demo operational stores cannot be trusted for authorization.
- Gate existing client-side operational pages by verified Cloud roles, while keeping their demo data distinct from secured staff records; route guards alone do not provide persisted tenant/branch isolation.

- Keep AI staff-access suggestions on an admin-verified Edge Function; model output is advisory and mapped to existing server-approved roles only, so text cannot grant privileges.
