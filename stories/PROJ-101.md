# PROJ-101: A shopper can apply a discount code

**Type:** Story

## Description
As a shopper, I want to apply a discount code to my cart so that I pay a reduced price at checkout.

## Acceptance Criteria
- A valid percentage code (SAVE10) reduces the order total by 10% of the subtotal
- A valid fixed code (WELCOME5) takes $5.00 off when the subtotal is at least $20.00
- An unknown code shows "Invalid discount code" and leaves the total unchanged
- An expired code (EXPIRED20) shows "This code has expired"
- Codes are not case sensitive
- Only one code can be applied to an order at a time
- A shopper can remove an applied discount
- Applying a code to an empty cart is not allowed
