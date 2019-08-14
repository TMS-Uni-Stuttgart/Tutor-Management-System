package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;

/**
 * ScheinCriteriaRepository
 */
public interface ScheinCriteriaRepository extends JpaRepository<ScheinCriteria, UUID> {

}
