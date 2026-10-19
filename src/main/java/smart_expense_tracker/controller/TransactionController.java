
package smart_expense_tracker.controller;

import jakarta.validation.Valid;
import smart_expense_tracker.dto.TransactionRequest;
import smart_expense_tracker.dto.TransactionResponse;
import smart_expense_tracker.service.TransactionService;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<TransactionResponse> getAllTransactions(
            @AuthenticationPrincipal Jwt jwt) {
        return service.getAllTransactions(jwt.getSubject());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return service.createTransaction(request, jwt.getSubject());
    }

    @PutMapping("/{id}")
    public TransactionResponse updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return service.updateTransaction(
                id, request, jwt.getSubject());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        service.deleteTransaction(id, jwt.getSubject());
    }
}
