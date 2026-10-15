
package smart_expense_tracker.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import smart_expense_tracker.dto.TransactionRequest;
import smart_expense_tracker.dto.TransactionResponse;
import smart_expense_tracker.entity.Transaction;
import smart_expense_tracker.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    // READ: Get all transactions
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // CREATE: Save a new transaction
    @Transactional
    public TransactionResponse createTransaction(
            TransactionRequest request) {

        Transaction transaction = new Transaction(
                request.type(),
                request.amount(),
                request.currency(),
                request.description(),
                request.transactionDate()
        );

        Transaction saved = repository.save(transaction);

        return toResponse(saved);
    }

    // READ: Get one transaction by ID
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {

        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"));

        return toResponse(transaction);
    }

    // UPDATE: Update an existing transaction
    @Transactional
    public TransactionResponse updateTransaction(
            Long id,
            TransactionRequest request) {

        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"));

        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setCurrency(request.currency());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate());

        Transaction updated = repository.save(transaction);

        return toResponse(updated);
    }

    // DELETE: Delete a transaction by ID
    @Transactional
    public void deleteTransaction(Long id) {

        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Transaction not found");
        }

        repository.deleteById(id);
    }

    // Convert the database entity into an API response
    private TransactionResponse toResponse(Transaction transaction) {

        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getDescription(),
                transaction.getTransactionDate()
        );
    }
}
