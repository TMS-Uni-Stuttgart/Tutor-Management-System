package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.NamedElement;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import lombok.Getter;

/**
 * Represents a minimal set of information about the logged in {@link User}.
 */
@Getter
public class LoggedInUserResponseDTO extends NamedElement {

    private final List<LoggedInUserTutorial> tutorials;

    private final List<Role> roles;

    private final boolean hasTemporaryPassword;

    private final List<LoggedInUserSubstituteTutorial> substituteTutorials;

    LoggedInUserResponseDTO() {
        this(new User(), new HashMap<>(), new ArrayList<>());
    }

    public LoggedInUserResponseDTO(final User user,
            final Map<Tutorial, List<Instant>> substituteTutorials,
            final List<Tutorial> correctorTutorials) {
        super(user.getId(), user.getLastname(), user.getFirstname());

        this.tutorials = user.getTutorials().stream()
                .map(tutorial -> new LoggedInUserTutorial(tutorial)).collect(Collectors.toList());

        this.tutorials.addAll(correctorTutorials.stream()
                .map(tutorial -> new LoggedInUserTutorial(tutorial)).collect(Collectors.toList()));

        this.roles = new ArrayList<>(user.getRoles());
        this.hasTemporaryPassword = user.getTemporaryPassword().isPresent();

        this.substituteTutorials = substituteTutorials.entrySet().stream()
                .map(entry -> new LoggedInUserSubstituteTutorial(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    @Getter
    private class LoggedInUserTutorial {
        private final UUID id;

        private final int slot;

        LoggedInUserTutorial(final Tutorial tutorial) {
            this.id = tutorial.getId();
            this.slot = tutorial.getSlot();
        }
    }

    @Getter
    private class LoggedInUserSubstituteTutorial {
        private final UUID id;

        private final int slot;

        private final List<Instant> dates;

        LoggedInUserSubstituteTutorial(final Tutorial tutorial, final List<Instant> dates) {
            this.id = tutorial.getId();
            this.slot = tutorial.getSlot();
            this.dates = dates;
        }
    }
}
