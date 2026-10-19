
package smart_expense_tracker.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    String name,
    String email
) {}
