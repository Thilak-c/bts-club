# Requirements Document

## Introduction

This document defines the requirements for an AI chat assistant integrated into the BTS DISC QR table ordering system. The assistant will provide customers with menu guidance, order tracking, and restaurant services while respecting zone-based item restrictions. The assistant operates within the menu page and automatically knows the customer's table and zone context.

## Glossary

- **AI_Assistant**: The chat interface component that processes customer queries and provides responses using AI
- **Table_Context**: The combination of tableId, zoneId, and zoneName that identifies where a customer is seated
- **Zone_Restriction**: A rule that limits certain menu items to specific zones (e.g., Hookah only in Smoking Zone)
- **Quick_Reply**: Pre-defined clickable buttons that trigger common queries
- **Staff_Call**: A request sent to restaurant staff for assistance
- **VIP_Request**: A customer request to be moved to the VIP zone
- **Chat_Session**: A conversation thread between the customer and AI_Assistant for a single table visit

## Requirements

### Requirement 1: Table and Zone Context Awareness

**User Story:** As a customer, I want the assistant to automatically know my table and zone, so that I receive relevant recommendations without having to provide this information.

#### Acceptance Criteria

1. WHEN the menu page loads, THE AI_Assistant SHALL extract the tableId from the URL path `/menu/[tableId]`.
2. WHEN the tableId is extracted, THE AI_Assistant SHALL fetch the table data including zoneId and zoneName from the Convex database.
3. WHILE the AI_Assistant is active, THE AI_Assistant SHALL include tableId, zoneId, and zoneName in every AI API request.
4. IF the table data cannot be fetched, THEN THE AI_Assistant SHALL display a message indicating temporary unavailability and suggest refreshing the page.

### Requirement 2: Menu Questions and Recommendations

**User Story:** As a customer, I want to ask questions about the menu and get recommendations, so that I can make informed ordering decisions.

#### Acceptance Criteria

1. WHEN a customer asks about menu items, THE AI_Assistant SHALL respond with accurate information from the menu database only.
2. WHEN a customer requests recommendations, THE AI_Assistant SHALL suggest items that are available in the customer's current zone.
3. THE AI_Assistant SHALL NOT invent prices, offers, or items that do not exist in the database.
4. IF the AI_Assistant is uncertain about any information, THEN THE AI_Assistant SHALL respond with "I will check with the staff for you."
5. WHEN responding to menu queries, THE AI_Assistant SHALL use short, polite answers with a premium restaurant tone.

### Requirement 3: Zone-Based Item Restrictions

**User Story:** As a customer, I want to understand why certain items are unavailable in my zone, so that I know my options and can request a zone change if desired.

#### Acceptance Criteria

1. WHEN a customer asks about an item restricted to another zone, THE AI_Assistant SHALL explain that the item is only available in specific zones.
2. WHEN listing available items, THE AI_Assistant SHALL only include items permitted in the customer's current zone.
3. WHEN a customer asks "What can I order here?", THE AI_Assistant SHALL provide a summary of available categories and popular items for that zone.
4. IF a customer requests a restricted item, THEN THE AI_Assistant SHALL offer to help request a zone change.

### Requirement 4: Order Tracking

**User Story:** As a customer, I want to track my current order through the assistant, so that I can check status without navigating away from the menu.

#### Acceptance Criteria

1. WHEN a customer asks about their order status, THE AI_Assistant SHALL fetch the active order for the current table from the database.
2. WHEN an active order exists, THE AI_Assistant SHALL display the order number, items, total, and current status.
3. IF no active order exists for the table, THEN THE AI_Assistant SHALL inform the customer that no order is currently placed.
4. WHEN the order status changes, THE AI_Assistant SHALL provide the updated status upon the next query.

### Requirement 5: Staff Call Request

**User Story:** As a customer, I want to call staff through the assistant, so that I can get human assistance when needed.

#### Acceptance Criteria

1. WHEN a customer requests to call staff, THE AI_Assistant SHALL create a staff call notification with the table number.
2. WHEN a staff call is initiated, THE AI_Assistant SHALL confirm to the customer that staff has been notified.
3. THE AI_Assistant SHALL include the reason for the staff call if provided by the customer.

### Requirement 6: VIP Zone Change Request

**User Story:** As a customer, I want to request a move to the VIP zone, so that I can upgrade my dining experience.

#### Acceptance Criteria

1. WHEN a customer requests VIP or zone change, THE AI_Assistant SHALL create a zone change request with the current table and requested zone.
2. WHEN a zone change request is created, THE AI_Assistant SHALL inform the customer that staff will assist with the request shortly.
3. THE AI_Assistant SHALL explain any benefits or restrictions of the requested zone if asked.

### Requirement 7: Restaurant Information

**User Story:** As a customer, I want to ask about restaurant timings and location, so that I can plan my visit.

#### Acceptance Criteria

1. WHEN a customer asks about restaurant hours, THE AI_Assistant SHALL provide the configured operating hours.
2. WHEN a customer asks about the restaurant address, THE AI_Assistant SHALL provide the configured location information.
3. THE AI_Assistant SHALL provide basic restaurant information including contact details when requested.

### Requirement 8: Chat User Interface

**User Story:** As a customer, I want a clean, accessible chat interface, so that I can easily communicate with the assistant on my mobile device.

#### Acceptance Criteria

1. THE AI_Assistant SHALL display as a bottom sheet overlay on mobile devices.
2. THE AI_Assistant SHALL use a black background (#000000), white text, and warm orange accent (#F4A259) matching the BTS DISC style.
3. THE AI_Assistant SHALL provide Quick_Reply buttons for: "Popular in this zone", "What can I order here?", "Track my order", "Call staff", and "Move to VIP".
4. WHEN the chat is opened, THE AI_Assistant SHALL display a welcome message including the table number and zone name.
5. THE AI_Assistant SHALL support text input for custom queries.
6. THE AI_Assistant SHALL display a loading indicator while waiting for AI responses.

### Requirement 9: AI Response Behavior

**User Story:** As a restaurant operator, I want the assistant to maintain consistent, professional behavior, so that customers receive reliable service.

#### Acceptance Criteria

1. THE AI_Assistant SHALL use the system prompt: "You are BTS DISC Assistant. You know the customer's table and zone. Help with ordering, recommendations, and order tracking. Respect zone restrictions. If you don't know, say you will check with staff."
2. THE AI_Assistant SHALL limit responses to 150 words maximum for conciseness.
3. THE AI_Assistant SHALL NOT discuss topics unrelated to the restaurant, menu, or customer service.
4. IF a customer asks about unavailable features, THEN THE AI_Assistant SHALL politely redirect to available services.
