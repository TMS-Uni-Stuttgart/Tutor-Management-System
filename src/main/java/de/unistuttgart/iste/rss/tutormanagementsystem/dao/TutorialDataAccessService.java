package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.TutorialDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.TutorialRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * TutorialDataAccessService
 */
@Repository
public class TutorialDataAccessService implements TutorialDao {

    private final TutorialRepository tutorialRepository;

    @Autowired
    public TutorialDataAccessService(TutorialRepository tutorialRepository) {
        this.tutorialRepository = tutorialRepository;
    }

    @Override
    public Tutorial saveTutorial(final Tutorial tutorial) {
        return tutorialRepository.save(tutorial);
    }

    @Override
    public List<Tutorial> getAllTutorials() {
        List<Tutorial> tutorialList = new ArrayList<>();

        tutorialRepository.findAll().forEach(tutorial -> tutorialList.add(tutorial));

        return tutorialList;
    }

    @Override
    public Tutorial getTutorial(UUID id) throws ElementNotFoundException {
        Optional<Tutorial> tutorial = tutorialRepository.findById(id);

        if (tutorial.isEmpty()) {
            throw new ElementNotFoundException("Tutorial with the given ID was not found.");
        }

        return tutorial.get();
    }

    @Override
    public void deleteTutorial(final UUID id) throws ElementNotFoundException {
        try {
            tutorialRepository.deleteById(id);

        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }
    }

    @Override
    public Optional<User> getUserOfTutorial(final UUID id) throws ElementNotFoundException {
        return getTutorial(id).getTutor();
    }

}
