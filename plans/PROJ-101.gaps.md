# Test-gap review: PROJ-101

_Offline keyword heuristic. Set ANTHROPIC_API_KEY for a real review._

| Acceptance criterion | Status |
|---|---|
| A valid percentage code (SAVE10) reduces the order total by 10% of the subtotal | Probably covered |
| A valid fixed code (WELCOME5) takes $5.00 off when the subtotal is at least $20.00 | Probably covered |
| An unknown code shows "Invalid discount code" and leaves the total unchanged | POSSIBLE GAP |
| An expired code (EXPIRED20) shows "This code has expired" | Probably covered |
| Codes are not case sensitive | Probably covered |
| Only one code can be applied to an order at a time | Probably covered |
| A shopper can remove an applied discount | Probably covered |
| Applying a code to an empty cart is not allowed | Probably covered |
