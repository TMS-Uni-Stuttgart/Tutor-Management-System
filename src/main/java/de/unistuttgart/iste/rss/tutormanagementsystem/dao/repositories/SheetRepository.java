package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;

/**
 * SheetRepository
 */
public interface SheetRepository extends JpaRepository<Sheet, UUID> {

    public List<Sheet> findAllByOrderBySheetNoAsc();
}
