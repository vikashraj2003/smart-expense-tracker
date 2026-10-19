package smart_expense_tracker;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "app.jwt.secret=VGhpc0lzQU5vdFJlYWxQcm9kdWN0aW9uU2VjcmV0S2V5MTIzNDU2Nzg5MA=="
})
class SmartExpenseTrackerApplicationTests {

    @Test
    void contextLoads() {
    }
}