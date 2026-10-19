
package smart_expense_tracker.service;

import smart_expense_tracker.dto.TransactionRequest;
import smart_expense_tracker.dto.TransactionResponse;
import smart_expense_tracker.entity.AppUser;
import smart_expense_tracker.entity.Transaction;
import smart_expense_tracker.repository.TransactionRepository;
import smart_expense_tracker.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactions;
    private final UserRepository users;

    public TransactionService(
            TransactionRepository transactions,
            UserRepository users) {
        this.transactions = transactions;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(String email) {
        return transactions.findAllByOwnerEmailIgnoreCase(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TransactionResponse createTransaction(
            TransactionRequest request, String email) {

        AppUser owner = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        Transaction transaction = new Transaction(
                request.type(),
                request.amount(),
                request.currency(),
                request.description(),
                request.transactionDate());

        transaction.setOwner(owner);

        return toResponse(transactions.save(transaction));
    }

    @Transactional
    public TransactionResponse updateTransaction(
            Long id, TransactionRequest request, String email) {

        Transaction transaction = findOwnedTransaction(id, email);

        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setCurrency(request.currency());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate());

        return toResponse(transactions.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long id, String email) {
        Transaction transaction = findOwnedTransaction(id, email);
        transactions.delete(transaction);
    }

    private Transaction findOwnedTransaction(Long id, String email) {
        return transactions.findByIdAndOwnerEmailIgnoreCase(id, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getDescription(),
                transaction.getTransactionDate());
    }
}
