# Gas Syndicate Watch - Security Specification

## Data Invariants
1. **Identity Integrity**: A complaint's `userId` must strictly match `request.auth.uid`, and `userEmail` must match `request.auth.token.email`.
2. **Minimal PII Guarantee**: In adherence to product requirements, only the user's Gmail address and name are stored and displayed.
3. **15-Day Expiration Constraint**: All complaints include an `expiresAt` timestamp set to 15 days from creation (`createdAt`), enforcing time-to-live retention.
4. **Price Logic Validity**: `sellingPrice` and `govtPrice` must be non-negative numbers, with `markupAmount` representing the syndicate overcharge.
5. **No Spoofing or Hijacking**: Only the complaint creator can update or delete their complaint document.

## The Dirty Dozen Security Test Payloads
1. **Payload 1 - User ID Impersonation**: Attacker sets `userId: "victim_123"` while authenticated as `attacker_456`. (Rejected: UID mismatch).
2. **Payload 2 - Email Spoofing**: Attacker submits report using forged `userEmail: "official@gov.org"` instead of verified token email. (Rejected).
3. **Payload 3 - Negative Price Values**: Submitting negative numbers for `govtPrice: -500` or `sellingPrice: -100`. (Rejected by schema validation).
4. **Payload 4 - ID Poisoning**: Creating complaint with document ID containing illegal characters `../../../etc/passwd`. (Rejected by `isValidId`).
5. **Payload 5 - Unauthenticated Write**: Unauthenticated guest trying to insert complaint into `/complaints`. (Rejected: unauthenticated).
6. **Payload 6 - Unauthorized Delete**: User B attempting to delete User A's complaint. (Rejected: `resource.data.userId != request.auth.uid`).
7. **Payload 7 - Missing Mandatory Fields**: Complaint payload omitting `shopName` or `markupAmount`. (Rejected: schema required keys).
8. **Payload 8 - Buffer Overflow String**: `shopName` sent with 50,000 characters. (Rejected: string length limit <= 150).
9. **Payload 9 - Modifying Immutable Creator**: Updating complaint while mutating `userId` to transfer ownership. (Rejected).
10. **Payload 10 - Arbitrary Profile Modification**: User A writing to `/users/{userB}` profile. (Rejected: path userId mismatch).
11. **Payload 11 - Shadow Field Injection**: Injecting arbitrary extra fields like `adminBypass: true` or `verifiedStatus: true`. (Rejected).
12. **Payload 12 - Corrupted Expiration Date**: Setting complaint expiration to 10 years in the future to bypass the 15-day purge policy. (Rejected).
