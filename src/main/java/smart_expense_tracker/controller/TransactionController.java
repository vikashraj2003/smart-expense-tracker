
package smart_expense_tracker.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import smart_expense_tracker.dto.TransactionRequest;
import smart_expense_tracker.dto.TransactionResponse;
import smart_expense_tracker.service.TransactionService;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    // READ: Get all transactions
    @GetMapping
    public List<TransactionResponse> getAllTransactions() {
        return service.getAllTransactions();
    }

    // CREATE: Create a transaction
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        TransactionResponse saved =
                service.createTransaction(request);

        return ResponseEntity
                .created(URI.create(
                        "/api/v1/transactions/" + saved.id()))
                .body(saved);
    }

    // READ: Get one transaction
    @GetMapping("/{id}")
    public TransactionResponse getTransactionById(
            @PathVariable Long id) {

        return service.getTransactionById(id);
    }

    // UPDATE: Update a transaction
    @PutMapping("/{id}")
    public TransactionResponse updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {

        return service.updateTransaction(id, request);
    }

    // DELETE: Delete a transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id) {

        service.deleteTransaction(id);

        return ResponseEntity.noContent().build();
    }
}
