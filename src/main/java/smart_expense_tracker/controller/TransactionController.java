
package smart_expense_tracker.controller;

import smart_expense_tracker.dto.TransactionRequest;
import smart_expense_tracker.dto.TransactionResponse;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final List<TransactionResponse> transactions =
            new CopyOnWriteArrayList<>();

    private final AtomicLong idGenerator = new AtomicLong(100);

    @GetMapping
    public List<TransactionResponse> getAllTransactions() {
        return transactions;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        long id = idGenerator.incrementAndGet();

        TransactionResponse saved = new TransactionResponse(
                id,
                request.type(),
                request.amount(),
                request.currency(),
                request.description(),
                request.transactionDate()
        );

        transactions.add(saved);

        return ResponseEntity
                .created(URI.create("/api/v1/transactions/" + id))
                .body(saved);
    }
}
