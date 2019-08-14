package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;

/**
 * TeamRepository
 */
public interface TeamRepository extends JpaRepository<Team, UUID> {

    Optional<Team> findByTutorialIdAndId(UUID tutorialId, UUID id);

    List<Team> findAllByTutorialId(UUID tutorialId);

}
