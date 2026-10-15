package smart_expense_tracker.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/v1/health")
    public Map<String, String> checkHealth() {
        return Map.of(
            "status", "UP",
            "message", "Smart Expense Tracker API is running"
        );
    }
}
