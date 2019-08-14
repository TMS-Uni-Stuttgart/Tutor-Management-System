package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * TutorialDao
 */
public interface TutorialDao {

    public Tutorial saveTutorial(final Tutorial tutorial);

    public List<Tutorial> getAllTutorials();

    public Tutorial getTutorial(final UUID id) throws ElementNotFoundException;

    public void deleteTutorial(final UUID id) throws ElementNotFoundException;

    // public Tutorial updateTutorial(final UUID id, final Tutorial tutorial) throws
    // ElementNotFoundException;

    public Optional<User> getUserOfTutorial(final UUID id) throws ElementNotFoundException;

    // public void setUserOfTutorial(final UUID id, final User user) throws
    // ElementNotFoundException;
}
