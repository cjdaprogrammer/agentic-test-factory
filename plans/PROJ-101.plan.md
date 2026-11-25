# Test plan: PROJ-101 A shopper can apply a discount code

_Offline mode: classifications are heuristic suggestions and require human review. Set ANTHROPIC_API_KEY for a full AI-proposed plan._

| ID | Scenario | Type | Priority | Automate? |
|----|----------|------|----------|-----------|
| TC-01 | A valid percentage code (SAVE10) reduces the order total by 10% of the subtotal | Functional / Calculation | High | Yes |
| TC-02 | A valid fixed code (WELCOME5) takes $5.00 off when the subtotal is at least $20.00 | Boundary / Business Rule | High | Yes |
| TC-03 | An unknown code shows "Invalid discount code" and leaves the total unchanged | Negative | High | Yes |
| TC-04 | An expired code (EXPIRED20) shows "This code has expired" | Negative | High | Yes |
| TC-05 | Codes are not case sensitive | Functional | Medium | Yes |
| TC-06 | Only one code can be applied to an order at a time | Boundary / Business Rule | High | Yes |
| TC-07 | A shopper can remove an applied discount | Functional / State Change | Medium | Yes |
| TC-08 | Applying a code to an empty cart is not allowed | Negative | High | Yes |

## Existing coverage review

| Criterion | Acceptance criterion | Coverage signal | Existing scenarios |
|---|---|---|---|
| AC-TC01 | A valid percentage code (SAVE10) reduces the order total by 10% of the subtotal | TAGGED — existing traceability tag | Shopper applies a valid percentage code (features/discount-code.feature) |
| AC-TC02 | A valid fixed code (WELCOME5) takes $5.00 off when the subtotal is at least $20.00 | TAGGED — existing traceability tag | Shopper applies a fixed-amount code at or above the minimum spend (features/discount-code.feature); Fixed-amount code is rejected below the minimum spend (features/discount-code.feature) |
| AC-TC03 | An unknown code shows "Invalid discount code" and leaves the total unchanged | TAGGED — existing traceability tag | Shopper cannot apply an invalid or expired code (features/discount-code.feature) |
| AC-TC04 | An expired code (EXPIRED20) shows "This code has expired" | TAGGED — existing traceability tag | Shopper cannot apply an invalid or expired code (features/discount-code.feature) |
| AC-TC05 | Codes are not case sensitive | TAGGED — existing traceability tag | Discount codes are not case sensitive (features/discount-code.feature) |
| AC-TC06 | Only one code can be applied to an order at a time | TAGGED — existing traceability tag | Only one code can be applied to an order at a time (features/discount-code.feature) |
| AC-TC07 | A shopper can remove an applied discount | TAGGED — existing traceability tag | Shopper removes an applied discount (features/discount-code.feature) |
| AC-TC08 | Applying a code to an empty cart is not allowed | TAGGED — existing traceability tag | Codes cannot be applied to an empty cart (features/discount-code.feature) |

_Coverage signals are preliminary. A traceability tag does not independently prove that the scenario verifies the full business requirement._

_Type and priority are assigned using keyword-based heuristics and require human review._
