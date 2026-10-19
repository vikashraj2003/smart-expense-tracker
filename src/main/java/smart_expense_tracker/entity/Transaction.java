package smart_expense_tracker.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    // Nullable during migration so older Phase 3 records are preserved.
    // Every newly created transaction must have an owner.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser owner;

    protected Transaction() {}

    public Transaction(
            String type,
            BigDecimal amount,
            String currency,
            String description,
            LocalDate transactionDate) {
        this.type = type;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
        this.transactionDate = transactionDate;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getDescription() { return description; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public AppUser getOwner() { return owner; }

    public void setOwner(AppUser owner) { this.owner = owner; }
    public void setType(String type) { this.type = type; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }
}
