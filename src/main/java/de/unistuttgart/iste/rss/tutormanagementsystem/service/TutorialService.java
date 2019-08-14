package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.TutorialDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.TutorialNotEmptyException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.SubstituteDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;

/**
 * TutorialService
 */
@Service
public class TutorialService {

    private final Logger logger = LoggerFactory.getLogger(TutorialService.class);

    @Autowired
    private TutorialDao tutorialDao;

    @Autowired
    private UserService userService;

    public Tutorial createTutorial(final TutorialDTO tutorialInfos)
            throws ElementNotFoundException {
        User tutor = null;

        if (tutorialInfos.getTutorId().isPresent()) {
            tutor = userService.getUser(tutorialInfos.getTutorId().get());
        }

        List<User> correctors = new ArrayList<>();

        for (var id : tutorialInfos.getCorrectorIds()) {
            correctors.add(userService.getUser(id));
        }

        return tutorialDao.saveTutorial(new Tutorial(UUID.randomUUID(), tutorialInfos.getSlot(),
                tutor, tutorialInfos.getDates(), tutorialInfos.getStartTime(),
                tutorialInfos.getEndTime(), correctors));
    }

    public List<Tutorial> getAllTutorials() {
        return tutorialDao.getAllTutorials();
    }

    public Tutorial getTutorial(final UUID id) throws ElementNotFoundException {
        return tutorialDao.getTutorial(id);
    }

    public void deleteTutorial(final UUID id)
            throws ElementNotFoundException, TutorialNotEmptyException {
        if (!getTutorial(id).getStudents().isEmpty()) {
            throw new TutorialNotEmptyException("Not empty tutorial must not be deleted.");
        }

        tutorialDao.deleteTutorial(id);
    }

    public Tutorial updateTutorial(final UUID id, final TutorialDTO updatedTutorial)
            throws ElementNotFoundException {
        Tutorial tutorial = getTutorial(id);
        User tutor = null;

        if (updatedTutorial.getTutorId().isPresent()) {
            tutor = userService.getUser(updatedTutorial.getTutorId().get());
        }

        List<User> correctors = new ArrayList<>();

        for (var correctorId : updatedTutorial.getCorrectorIds()) {
            correctors.add(userService.getUser(correctorId));
        }

        Tutorial adjustedTutorial = new Tutorial(tutorial.getId(), updatedTutorial.getSlot(), tutor,
                updatedTutorial.getDates(), updatedTutorial.getStartTime(),
                updatedTutorial.getEndTime(), correctors);

        adjustedTutorial.getSubstitutes().putAll(tutorial.getSubstitutes());

        return tutorialDao.saveTutorial(adjustedTutorial);
    }

    public Optional<User> getUserOfTutorial(final UUID id) throws ElementNotFoundException {
        return tutorialDao.getUserOfTutorial(id);
    }

    public void setUserOfTutorial(final UUID id, final UUID userId)
            throws ElementNotFoundException {
        Tutorial tutorial = getTutorial(id);
        User user = userService.getUser(userId);

        tutorial.setTutor(user);
        tutorialDao.saveTutorial(tutorial);
    }

    public void removeUserOfTutorial(final UUID id) throws ElementNotFoundException {
        Tutorial tutorial = getTutorial(id);

        tutorial.setTutor(null);
        tutorialDao.saveTutorial(tutorial);
    }

    public List<Student> getStudentsOfTutorial(final UUID id) throws ElementNotFoundException {
        Tutorial tutorial = getTutorial(id);

        return tutorial.getStudents();
    }

    public List<User> getCorrectorsOfTutorial(final UUID id) throws ElementNotFoundException {
        Tutorial tutorial = getTutorial(id);

        return tutorial.getCorrectors();
    }

    public Map<Instant, User> getSubstitutesOfTutorial(final UUID id)
            throws ElementNotFoundException {
        final Tutorial tutorial = getTutorial(id);
        final HashMap<Instant, User> resultMap = new HashMap<>();

        for (var entry : tutorial.getSubstitutes().entrySet()) {
            try {
                resultMap.put(entry.getKey(), userService.getUser(entry.getValue()));
            } catch (ElementNotFoundException e) {
                logger.error("Could not find User with the ID " + entry.getValue()
                        + " while retrieving all substitute tutors. It will be skipped.");
            }
        }

        return resultMap;
    }

    public Tutorial setSubstituteOfTutorial(final UUID id, final SubstituteDTO substituteDTO)
            throws ElementNotFoundException {
        final Tutorial tutorial = getTutorial(id);
        final User tutor = userService.getUser(substituteDTO.getTutorId());
        final var substitutesBeforeChange = new HashMap<>(tutorial.getSubstitutes());

        for (var entry : substitutesBeforeChange.entrySet()) {
            if (entry.getValue().equals(tutor.getId())) {
                tutorial.removeSubstituteTutor(entry.getKey());
            }
        }

        for (var date : substituteDTO.getDates()) {
            tutorial.setSubstituteTutor(date, tutor);
        }

        return tutorialDao.saveTutorial(tutorial);
    }

    /**
     * Returns a map of all tutorial in which the {@link User} with the given {@link UUID} is a
     * substitute tutor. The map also includes the dates at which the User is the substitute tutor.
     * 
     * @param userId User of which the "substitute tutorials" should be found
     * @return Map which keys are the tutorials and the values are the corresponding dates.
     * 
     * @throws ElementNotFoundException
     */
    public Map<Tutorial, List<Instant>> getSubstituteTutorialsOfUser(final UUID userId)
            throws ElementNotFoundException {
        final Map<Tutorial, List<Instant>> response = new HashMap<>();
        final List<Tutorial> tutorials = getAllTutorials();

        for (var tutorial : tutorials) {
            for (var entry : tutorial.getSubstitutes().entrySet()) {
                if (entry.getValue().equals(userId)) {
                    if (response.get(tutorial) == null) {
                        response.put(tutorial, new ArrayList<>());
                    }

                    response.get(tutorial).add(entry.getKey());
                }
            }
        }

        return response;
    }
}
