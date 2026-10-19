
package smart_expense_tracker.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
    @NotBlank
    @Pattern(regexp = "INCOME|EXPENSE")
    String type,

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 10, fraction = 2)
    BigDecimal amount,

    @NotBlank
    @Pattern(regexp = "[A-Z]{3}")
    String currency,

    @NotBlank
    @Size(max = 255)
    String description,

    @NotNull
    @PastOrPresent
    LocalDate transactionDate
) {}
