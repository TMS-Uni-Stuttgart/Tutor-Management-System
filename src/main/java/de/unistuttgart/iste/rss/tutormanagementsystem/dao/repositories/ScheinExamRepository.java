package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;

/**
 * ScheinExamRepository
 */
public interface ScheinExamRepository extends JpaRepository<ScheinExam, UUID> {

}
