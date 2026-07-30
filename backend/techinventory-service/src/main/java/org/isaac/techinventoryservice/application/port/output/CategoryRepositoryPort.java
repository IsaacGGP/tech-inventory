package org.isaac.techinventoryservice.application.port.output;

import org.isaac.techinventoryservice.domain.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepositoryPort {

    Category save(Category category);

    Optional<Category> findById(Long id);

    List<Category> findAll();

    //Revisar ya que si hay una categoria en uso, no se deberia eliminar
    void deleteById(Long id);

    boolean existsById(Long id);
}
