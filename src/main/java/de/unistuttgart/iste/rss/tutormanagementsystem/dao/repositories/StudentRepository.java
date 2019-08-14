package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;

/**
 * StudentRepository
 */
public interface StudentRepository extends CrudRepository<Student, UUID> {

}
