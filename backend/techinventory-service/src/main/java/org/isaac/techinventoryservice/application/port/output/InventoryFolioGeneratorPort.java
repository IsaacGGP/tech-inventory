package org.isaac.techinventoryservice.application.port.output;

import org.isaac.techinventoryservice.domain.model.Category;

public interface InventoryFolioGeneratorPort {
    String generate(Category category);
}
