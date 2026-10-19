
package smart_expense_tracker.repository;

import smart_expense_tracker.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByOwnerEmailIgnoreCase(String email);

    Optional<Transaction> findByIdAndOwnerEmailIgnoreCase(
            Long id, String email);
}
