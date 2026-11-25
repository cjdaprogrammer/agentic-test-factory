# Test-gap review: PROJ-101

_Offline keyword heuristic only. Keyword overlap does not establish behavioral test coverage._
_Configure ANTHROPIC_API_KEY for AI-assisted analysis; all findings still require human verification._

| Acceptance criterion | Status |
|---|---|
| A valid percentage code (SAVE10) reduces the order total by 10% of the subtotal | KEYWORD OVERLAP — VERIFY MANUALLY |
| A valid fixed code (WELCOME5) takes $5.00 off when the subtotal is at least $20.00 | KEYWORD OVERLAP — VERIFY MANUALLY |
| An unknown code shows "Invalid discount code" and leaves the total unchanged | KEYWORD OVERLAP — VERIFY MANUALLY |
| An expired code (EXPIRED20) shows "This code has expired" | KEYWORD OVERLAP — VERIFY MANUALLY |
| Codes are not case sensitive | KEYWORD OVERLAP — VERIFY MANUALLY |
| Only one code can be applied to an order at a time | KEYWORD OVERLAP — VERIFY MANUALLY |
| A shopper can remove an applied discount | KEYWORD OVERLAP — VERIFY MANUALLY |
| Applying a code to an empty cart is not allowed | KEYWORD OVERLAP — VERIFY MANUALLY |
