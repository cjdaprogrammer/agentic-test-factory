# Test plan: PROJ-101 A shopper can apply a discount code

_Offline mode: one row per acceptance criterion. Set ANTHROPIC_API_KEY for a full AI-proposed plan._

| ID | Scenario | Type | Priority | Automate? |
|----|----------|------|----------|-----------|
| TC-01 | A valid percentage code (SAVE10) reduces the order total by 10% of the subtotal | TBD | TBD | Yes |
| TC-02 | A valid fixed code (WELCOME5) takes $5.00 off when the subtotal is at least $20.00 | TBD | TBD | Yes |
| TC-03 | An unknown code shows "Invalid discount code" and leaves the total unchanged | TBD | TBD | Yes |
| TC-04 | An expired code (EXPIRED20) shows "This code has expired" | TBD | TBD | Yes |
| TC-05 | Codes are not case sensitive | TBD | TBD | Yes |
| TC-06 | Only one code can be applied to an order at a time | TBD | TBD | Yes |
| TC-07 | A shopper can remove an applied discount | TBD | TBD | Yes |
| TC-08 | Applying a code to an empty cart is not allowed | TBD | TBD | Yes |
