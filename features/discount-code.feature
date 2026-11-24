@ATF-1
Feature: Apply a discount code
  As a shopper
  I want to apply a discount code to my cart
  So that I pay a reduced price at checkout

  Background:
    Given I am on the shop home page

  @smoke @ATF-T1
  Scenario: Shopper applies a valid percentage code
    Given my cart contains "Backpack"
    When I apply the discount code "SAVE10"
    Then I should see the message "Discount applied: SAVE10"
    And the discount should be "-$5.00"
    And the order total should be "$45.00"

  @ATF-T2
  Scenario: Shopper applies a fixed-amount code above the minimum spend
    Given my cart contains "Backpack"
    When I apply the discount code "WELCOME5"
    Then I should see the message "Discount applied: WELCOME5"
    And the discount should be "-$5.00"
    And the order total should be "$45.00"

  @ATF-T3
  Scenario: Fixed-amount code is rejected below the minimum spend
    Given my cart contains "Notebook"
    When I apply the discount code "WELCOME5"
    Then I should see the message "Minimum spend of $20.00 required"
    And no discount should be applied
    And the order total should be "$10.00"

  @smoke @ATF-T4
  Scenario Outline: Shopper cannot apply an invalid or expired code
    Given my cart contains "Backpack"
    When I apply the discount code "<code>"
    Then I should see the message "<message>"
    And no discount should be applied
    And the order total should be "$50.00"

    Examples:
      | code      | message               |
      | INVALID99 | Invalid discount code |
      | EXPIRED20 | This code has expired |

  @ATF-T5
  Scenario: Discount codes are not case sensitive
    Given my cart contains "Backpack"
    When I apply the discount code "save10"
    Then I should see the message "Discount applied: SAVE10"
    And the order total should be "$45.00"

  @ATF-T6
  Scenario: Shopper removes an applied discount
    Given my cart contains "Backpack"
    And I have applied the discount code "SAVE10"
    When I remove the discount
    Then I should see the message "Discount removed"
    And no discount should be applied
    And the order total should be "$50.00"

  @ATF-T7
  Scenario: Codes cannot be applied to an empty cart
    When I apply the discount code "SAVE10"
    Then I should see the message "Add an item before applying a code"
    And no discount should be applied
    And the order total should be "$0.00"

  @ATF-T8
  Scenario: Only one code can be applied to an order at a time
    Given my cart contains "Backpack"
    And I have applied the discount code "SAVE10"
    When I apply the discount code "WELCOME5"
    Then I should see the message "A discount code is already applied"
    And the discount should be "-$5.00"
    And the order total should be "$45.00"