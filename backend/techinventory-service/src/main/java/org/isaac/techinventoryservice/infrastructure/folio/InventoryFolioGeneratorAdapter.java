package org.isaac.techinventoryservice.infrastructure.folio;

import org.isaac.techinventoryservice.application.port.output.InventoryFolioGeneratorPort;
import org.isaac.techinventoryservice.domain.model.Category;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class InventoryFolioGeneratorAdapter implements InventoryFolioGeneratorPort {
    private final AtomicInteger sequence = new AtomicInteger(1);

    @Override
    public String generate(Category category) {

        if (category == null) {
            throw new IllegalArgumentException("Category is required to generate inventory folio");
        }

        int currentSequence = sequence.getAndIncrement();

        return String.format(
                "%s-%s-%03d",
                category.getPrefixCode(),
                Year.now().getValue(),
                currentSequence
        );
    }
}
