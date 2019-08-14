package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;

/**
 * UserRepository
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

}
