
package smart_expense_tracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(

    @NotBlank
    @Pattern(regexp = "INCOME|EXPENSE")
    String type,

    @NotNull
    @DecimalMin("0.01")
    BigDecimal amount,

    @NotBlank
    @Pattern(regexp = "[A-Z]{3}")
    String currency,

    @NotBlank
    @Size(max = 200)
    String description,

    @NotNull
    LocalDate transactionDate

) {}
