
package smart_expense_tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
    Long id,
    String type,
    BigDecimal amount,
    String currency,
    String description,
    LocalDate transactionDate
) {}
