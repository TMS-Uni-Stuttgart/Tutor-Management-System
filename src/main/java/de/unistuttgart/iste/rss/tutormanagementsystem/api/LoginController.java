package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.LoggedInUserResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.UserService;

/**
 * LoginController
 */
@RestController
@RequestMapping(path = "/api/login")
@ResponseBody
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private TutorialService tutorialService;

    @PostMapping
    public LoggedInUserResponseDTO login(Authentication auth, HttpServletResponse response)
            throws ElementNotFoundException {
        final User user = userService.findByUsername(auth.getName());
        final Map<Tutorial, List<Instant>> substituteTutorials =
                tutorialService.getSubstituteTutorialsOfUser(user.getId());

        final List<Tutorial> correctorTutorials = getTutorialsInWhichUserIsCorrector(user);

        return new LoggedInUserResponseDTO(user, substituteTutorials, correctorTutorials);
    }

    @ExceptionHandler(ElementNotFoundException.class)
    public ResponseEntity<String> handleElementNotFoundException(ElementNotFoundException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    private List<Tutorial> getTutorialsInWhichUserIsCorrector(final User user) {
        final var tutorials = tutorialService.getAllTutorials();

        return tutorials.stream().filter(tutorial -> {
            final var correctorIds = tutorial.getCorrectors().stream()
                    .map(corrector -> corrector.getId()).collect(Collectors.toList());

            return correctorIds.contains(user.getId());
        }).collect(Collectors.toList());
    }
}
